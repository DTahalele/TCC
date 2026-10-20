import { ScoreCardRecord } from '../types/scoreCard';
import { TrialRegistrationRecord } from '../types/trialRegistration';
import {
  getStoredRecords,
  setStoredRecords,
  getGoogleSheetUrl,
  setGoogleSheetUrl,
  hasGoogleSheetUrlConfigured,
  setDatabaseConnected,
} from './storage';
import {
  getStoredTrials,
  setStoredTrials,
  fetchTrialsFromGoogleSheet,
} from './trialStorage';
import { fetchRecordsFromGoogleSheet } from './googleSheets';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  serverConnected: boolean;
  cloudConnected: boolean;
  statusMessage: string;
}

type SyncListener = (status: SyncStatus) => void;
type DataUpdateListener = (data: {
  records?: ScoreCardRecord[];
  trials?: TrialRegistrationRecord[];
}) => void;

class SyncManager {
  private static instance: SyncManager;
  private isSyncing = false;
  private lastSyncTime: Date | null = null;
  private serverConnected = false;
  private cloudConnected = false;
  private statusMessage = 'Sistem Siap';
  private statusListeners: Set<SyncListener> = new Set();
  private dataListeners: Set<DataUpdateListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private intervalId: any = null;
  private isInitialized = false;

  private constructor() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('tcc_cross_tab_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'DATA_UPDATED') {
            this.notifyDataListeners({
              records: getStoredRecords(),
              trials: getStoredTrials(),
            });
          }
        };
      }
    } catch (e) {
      // BroadcastChannel not available in restricted iframe
    }
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  public subscribeStatus(listener: SyncListener): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => this.statusListeners.delete(listener);
  }

  public subscribeData(listener: DataUpdateListener): () => void {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }

  private notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach((l) => {
      try {
        l(status);
      } catch (e) {}
    });
  }

  private notifyDataListeners(data: {
    records?: ScoreCardRecord[];
    trials?: TrialRegistrationRecord[];
  }) {
    this.dataListeners.forEach((l) => {
      try {
        l(data);
      } catch (e) {}
    });
  }

  public getStatus(): SyncStatus {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      serverConnected: this.serverConnected,
      cloudConnected: this.cloudConnected || hasGoogleSheetUrlConfigured(),
      statusMessage: this.statusMessage,
    };
  }

  /**
   * Initialize auto-sync listeners:
   * - visibilitychange (when phone is unlocked or user switches back to browser tab)
   * - focus (window focus)
   * - online (reconnected to WiFi / 4G / 5G)
   * - recurring heartbeat (every 20s)
   */
  public initAutoSync() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Initial sync immediately on launch
    this.performFullSync();

    // 2. On visibility change (Android/iOS background to foreground)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.performFullSync({ silent: true });
      }
    });

    // 3. On window focus
    window.addEventListener('focus', () => {
      this.performFullSync({ silent: true });
    });

    // 4. On network reconnected
    window.addEventListener('online', () => {
      this.performFullSync();
    });

    // 5. Periodic polling interval (every 20 seconds)
    this.intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        this.performFullSync({ silent: true });
      }
    }, 20000);
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    this.statusListeners.clear();
    this.dataListeners.clear();
    this.isInitialized = false;
  }

  /**
   * Broadcast change to other tabs/windows in the same device
   */
  public broadcastLocalChange() {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
      } catch (e) {}
    }
  }

  /**
   * Sync shared configuration (e.g. Google Sheet Webhook URL) with server
   */
  public async syncServerConfig(): Promise<string> {
    try {
      const res = await fetch('/api/config', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          this.serverConnected = true;
          if (data && data.webhookUrl && typeof data.webhookUrl === 'string') {
            const currentLocal = getGoogleSheetUrl();
            if (!currentLocal || currentLocal !== data.webhookUrl) {
              setGoogleSheetUrl(data.webhookUrl);
              setDatabaseConnected(true);
            }
            return data.webhookUrl;
          }
        }
      }
    } catch (e) {
      // Server endpoint not reachable or static host
    }
    return getGoogleSheetUrl();
  }

  /**
   * Push newly updated Google Sheet URL to server so all other devices receive it
   */
  public async pushServerConfig(webhookUrl: string): Promise<boolean> {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          webhookUrl,
          isConnected: Boolean(webhookUrl && webhookUrl.trim()),
        }),
      });
      if (res.ok) {
        this.serverConnected = true;
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  }

  /**
   * Perform comprehensive multi-tier synchronization:
   * Tier 1: Shared Node server sync (/api/sync)
   * Tier 2: Google Sheet cloud database (Apps Script)
   */
  public async performFullSync(options: { silent?: boolean } = {}): Promise<{
    recordsUpdated: boolean;
    trialsUpdated: boolean;
  }> {
    if (this.isSyncing) {
      return { recordsUpdated: false, trialsUpdated: false };
    }

    this.isSyncing = true;
    if (!options.silent) {
      this.statusMessage = 'Menyinkronkan data...';
      this.notifyStatus();
    }

    let recordsUpdated = false;
    let trialsUpdated = false;

    try {
      // Step A: Sync config first
      await this.syncServerConfig();

      // Step B: Sync with Shared Server (/api/sync)
      try {
        const serverRes = await fetch('/api/sync', {
          headers: { Accept: 'application/json' },
        });

        if (serverRes.ok) {
          const contentType = serverRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const serverData = await serverRes.json();
            this.serverConnected = true;

            if (serverData && serverData.success) {
              // 1. Records from server
              if (Array.isArray(serverData.records) && serverData.records.length > 0) {
                setStoredRecords(serverData.records);
                recordsUpdated = true;
              } else {
                // If server is empty, push local data to seed server
                const localRecords = getStoredRecords();
                if (localRecords.length > 0) {
                  this.pushToServer({ records: localRecords });
                }
              }

              // 2. Trials from server
              if (Array.isArray(serverData.trials) && serverData.trials.length > 0) {
                setStoredTrials(serverData.trials);
                trialsUpdated = true;
              } else {
                const localTrials = getStoredTrials();
                if (localTrials.length > 0) {
                  this.pushToServer({ trials: localTrials });
                }
              }
            }
          }
        }
      } catch (e) {
        // Shared server not available
        this.serverConnected = false;
      }

      // Step C: Sync with Google Sheets Cloud Database if configured
      if (hasGoogleSheetUrlConfigured()) {
        const [sheetRecordsRes, sheetTrialsRes] = await Promise.all([
          fetchRecordsFromGoogleSheet().catch(() => null),
          fetchTrialsFromGoogleSheet().catch(() => null),
        ]);

        if (sheetRecordsRes && sheetRecordsRes.success && sheetRecordsRes.records.length > 0) {
          setStoredRecords(sheetRecordsRes.records);
          recordsUpdated = true;
          this.cloudConnected = true;
          // Also sync newest records to server
          this.pushToServer({ records: sheetRecordsRes.records });
        }

        if (sheetTrialsRes && sheetTrialsRes.success && sheetTrialsRes.trials.length > 0) {
          setStoredTrials(sheetTrialsRes.trials);
          trialsUpdated = true;
          this.cloudConnected = true;
          // Also sync newest trials to server
          this.pushToServer({ trials: sheetTrialsRes.trials });
        }
      }

      this.lastSyncTime = new Date();
      this.statusMessage = 'Tersinkron otomatis';

      if (recordsUpdated || trialsUpdated) {
        this.notifyDataListeners({
          records: recordsUpdated ? getStoredRecords() : undefined,
          trials: trialsUpdated ? getStoredTrials() : undefined,
        });
        this.broadcastLocalChange();
      }
    } catch (error) {
      console.warn('Auto-sync warning:', error);
      this.statusMessage = 'Sinkronisasi lokal aktif';
    } finally {
      this.isSyncing = false;
      this.notifyStatus();
    }

    return { recordsUpdated, trialsUpdated };
  }

  /**
   * Push data update to shared server in background
   */
  public async pushToServer(data: {
    records?: ScoreCardRecord[];
    trials?: TrialRegistrationRecord[];
  }) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });
      this.serverConnected = true;
    } catch (e) {
      // ignore
    }
  }
}

export const syncManager = SyncManager.getInstance();
