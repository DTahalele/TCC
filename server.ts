import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

// Shared Data Directory for cross-device synchronization
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SHARED_DB_FILE = path.join(DATA_DIR, 'shared-database.json');
const CONFIG_FILE = path.join(DATA_DIR, 'app-config.json');

interface SharedDatabase {
  records: any[] | null;
  trials: any[] | null;
  lastUpdated: string;
}

function getSharedDb(): SharedDatabase {
  try {
    if (fs.existsSync(SHARED_DB_FILE)) {
      const content = fs.readFileSync(SHARED_DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading shared DB file:', err);
  }
  return {
    records: null,
    trials: null,
    lastUpdated: new Date().toISOString(),
  };
}

function saveSharedDb(data: SharedDatabase) {
  try {
    const tmpFile = `${SHARED_DB_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, SHARED_DB_FILE);
  } catch (err) {
    console.error('Error saving shared DB file:', err);
    try {
      fs.writeFileSync(SHARED_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {}
  }
}

function mergeRecords(existingList: any[] | null, incomingList: any[] | null): any[] {
  const map = new Map<string, any>();

  const getRecordKey = (r: any): string => {
    if (!r) return '';
    if (r.id) return String(r.id);
    if (r.record_id) return String(r.record_id);
    if (r.MemberID && r.Test_Date) {
      return `${String(r.MemberID).trim().toLowerCase()}_${String(r.Test_Date).trim()}`;
    }
    return `rec_${Math.random()}`;
  };

  if (Array.isArray(existingList)) {
    for (const r of existingList) {
      if (r) {
        const key = getRecordKey(r);
        if (key) map.set(key, r);
      }
    }
  }

  if (Array.isArray(incomingList)) {
    for (const r of incomingList) {
      if (r) {
        const key = getRecordKey(r);
        if (!key) continue;
        if (!map.has(key)) {
          map.set(key, r);
        } else {
          const existing = map.get(key);
          const timeExisting = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          const timeIncoming = new Date(r.updatedAt || r.createdAt || 0).getTime();
          if (timeIncoming >= timeExisting) {
            map.set(key, { ...existing, ...r });
          }
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const dateA = a.Test_Date ? new Date(a.Test_Date).getTime() : 0;
    const dateB = b.Test_Date ? new Date(b.Test_Date).getTime() : 0;
    if (dateA !== dateB) return dateB - dateA;
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

function mergeTrials(existingList: any[] | null, incomingList: any[] | null): any[] {
  const map = new Map<string, any>();

  const getTrialKey = (t: any): string => {
    if (!t) return '';
    if (t.id) return String(t.id);
    if (t.MemberID) return String(t.MemberID).trim().toLowerCase();
    return `trial_${Math.random()}`;
  };

  if (Array.isArray(existingList)) {
    for (const t of existingList) {
      if (t) {
        const key = getTrialKey(t);
        if (key) map.set(key, t);
      }
    }
  }

  if (Array.isArray(incomingList)) {
    for (const t of incomingList) {
      if (t) {
        const key = getTrialKey(t);
        if (!key) continue;
        if (!map.has(key)) {
          map.set(key, t);
        } else {
          const existing = map.get(key);
          const timeExisting = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          const timeIncoming = new Date(t.updatedAt || t.createdAt || 0).getTime();
          if (timeIncoming >= timeExisting) {
            map.set(key, { ...existing, ...t });
          }
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

function getAppConfig(): { webhookUrl: string; isConnected: boolean } {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
  return {
    webhookUrl: process.env.VITE_GOOGLE_SHEET_WEBHOOK_URL || '',
    isConnected: Boolean(process.env.VITE_GOOGLE_SHEET_WEBHOOK_URL),
  };
}

function saveAppConfig(config: { webhookUrl: string; isConnected: boolean }) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving config file:', err);
  }
}

// 1. Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 2. Shared Google Sheet Webhook Configuration (Syncs URL across all devices)
app.get('/api/config', (_req, res) => {
  const cfg = getAppConfig();
  res.json({
    success: true,
    webhookUrl: cfg.webhookUrl || '',
    isConnected: cfg.isConnected || false,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/config', (req, res) => {
  const { webhookUrl, isConnected } = req.body || {};
  const current = getAppConfig();
  const nextConfig = {
    webhookUrl: typeof webhookUrl === 'string' ? webhookUrl.trim() : current.webhookUrl,
    isConnected: isConnected !== undefined ? Boolean(isConnected) : Boolean(webhookUrl),
  };
  saveAppConfig(nextConfig);
  res.json({
    success: true,
    config: nextConfig,
    message: 'Konfigurasi database cloud berhasil disimpan dan disinkronkan ke seluruh perangkat.',
  });
});

// 3. Shared Database Sync Endpoint (Syncs records and trials across all devices)
app.get('/api/sync', (_req, res) => {
  const db = getSharedDb();
  const cfg = getAppConfig();
  res.json({
    success: true,
    records: db.records,
    trials: db.trials,
    config: cfg,
    lastUpdated: db.lastUpdated,
  });
});

app.post('/api/sync', (req, res) => {
  const { records, trials } = req.body || {};
  const currentDb = getSharedDb();

  const updatedDb: SharedDatabase = {
    records: Array.isArray(records) ? records : currentDb.records,
    trials: Array.isArray(trials) ? trials : currentDb.trials,
    lastUpdated: new Date().toISOString(),
  };

  saveSharedDb(updatedDb);

  res.json({
    success: true,
    records: updatedDb.records,
    trials: updatedDb.trials,
    lastUpdated: updatedDb.lastUpdated,
    message: 'Data berhasil disinkronkan ke server pusat.',
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TCC Server] Running on http://0.0.0.0:${PORT} (${isDev ? 'Development' : 'Production'})`);
  });
}

startServer().catch((err) => {
  console.error('[TCC Server] Failed to start:', err);
  process.exit(1);
});
