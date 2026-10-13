import { WhitelistUser, AuthSession, AuthResult } from '../types/auth';
import { getGoogleSheetUrl } from './storage';

const SESSION_STORAGE_KEY = 'tcc_scorecard_auth_session_v1';
const WHITELIST_CACHE_KEY = 'tcc_scorecard_whitelist_cache_v1';

/**
 * Seed users directly provided by the user via CSV
 */
export const SEED_WHITELIST_USERS: WhitelistUser[] = [
  {
    nama: 'David Tahalele',
    email: 'david.tahalele@gmail.com',
    pin: '0298',
    peran: 'Admin Web App',
    status: 'Aktif',
  },
  {
    nama: 'Airone Analyst',
    email: 'analyst@airzone.id',
    pin: '7940',
    peran: '',
    status: 'Aktif',
  },
  {
    nama: 'Mariskha Primasari',
    email: 'tcc.coordinator@airzone.id',
    pin: '3600',
    peran: 'Coach Coordinator',
    status: 'Aktif',
  },
  {
    nama: 'Julita Ayu Salsah Bela',
    email: '',
    pin: '7975',
    peran: 'Instructor/Coach',
    status: 'Non-Aktif',
  },
];

/**
 * Get cached whitelist users from localStorage or fallback to SEED
 */
export function getStoredWhitelist(): WhitelistUser[] {
  try {
    const raw = localStorage.getItem(WHITELIST_CACHE_KEY);
    if (!raw) return SEED_WHITELIST_USERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed reading cached whitelist:', e);
  }
  return SEED_WHITELIST_USERS;
}

/**
 * Save updated whitelist into local cache
 */
export function setStoredWhitelist(users: WhitelistUser[]): void {
  try {
    localStorage.setItem(WHITELIST_CACHE_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Failed saving whitelist cache:', e);
  }
}

/**
 * Normalizes email address for comparison (trim + lowercase)
 */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Normalizes PIN (trim string, ensure string comparison)
 */
export function normalizePin(pin: string): string {
  return String(pin || '').trim();
}

/**
 * Validates regular email syntax (supports Workspace & public domains)
 */
export function isValidEmailFormat(email: string): boolean {
  const normalized = normalizeEmail(email);
  // Standard permissive email regex supporting user@domain.tld, subdomains, workspace domains
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

/**
 * Fetch live whitelist from Google Sheet Webhook if URL is configured
 */
export async function syncWhitelistFromGoogleSheet(): Promise<{
  success: boolean;
  users: WhitelistUser[];
  message: string;
}> {
  const webhookUrl = getGoogleSheetUrl();
  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: false,
      users: getStoredWhitelist(),
      message: 'URL Google Apps Script belum dikonfigurasi. Menggunakan cache data lokal.',
    };
  }

  try {
    // Attempt GET request with action=GET_WHITELIST
    const targetUrl = new URL(webhookUrl.trim());
    targetUrl.searchParams.set('action', 'GET_WHITELIST');
    targetUrl.searchParams.set('t', Date.now().toString());

    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        const cleanUsers: WhitelistUser[] = data.users.map((u: Record<string, unknown>) => ({
          nama: String(u.nama || u.Nama || '').trim(),
          email: normalizeEmail(String(u.email || u.Email || '')),
          pin: normalizePin(String(u.pin || u.PIN || '')),
          peran: String(u.peran || u.Peran || '').trim(),
          status: String(u.status || u.Status || 'Aktif').trim(),
        }));

        if (cleanUsers.length > 0) {
          setStoredWhitelist(cleanUsers);
          return {
            success: true,
            users: cleanUsers,
            message: `Berhasil memuat ${cleanUsers.length} pengguna dari Google Sheet tab whitelist_user!`,
          };
        }
      }
    }
  } catch (err) {
    console.info('Direct GET whitelist skipped or CORS restricted, keeping current local whitelist cache:', err);
  }

  return {
    success: false,
    users: getStoredWhitelist(),
    message: 'Menggunakan data whitelist lokal.',
  };
}

/**
 * Authenticate user with Email and PIN.
 * Checks against both live Google Apps Script (if possible) and stored whitelist cache.
 */
export async function authenticateUser(
  emailInput: string,
  pinInput: string,
  rememberMe: boolean = true
): Promise<AuthResult> {
  const normEmail = normalizeEmail(emailInput);
  const normPin = normalizePin(pinInput);

  if (!normEmail) {
    return {
      success: false,
      code: 'INVALID_EMAIL',
      message: 'Silakan masukkan alamat email yang sudah didaftarkan.',
    };
  }

  if (!isValidEmailFormat(normEmail)) {
    return {
      success: false,
      code: 'INVALID_EMAIL',
      message: 'Format email tidak valid. Pastikan penulisan email sudah benar (contoh: nama@airzone.id atau coach@gmail.com).',
    };
  }

  if (!normPin) {
    return {
      success: false,
      code: 'INVALID_PIN',
      message: 'Silakan masukkan PIN otorisasi Anda.',
    };
  }

  // 1. Try Live Verification with Google Sheet if configured
  const webhookUrl = getGoogleSheetUrl();
  if (webhookUrl && webhookUrl.trim() && navigator.onLine) {
    try {
      const targetUrl = new URL(webhookUrl.trim());
      targetUrl.searchParams.set('action', 'VERIFY_USER');
      targetUrl.searchParams.set('email', normEmail);
      targetUrl.searchParams.set('pin', normPin);
      targetUrl.searchParams.set('t', Date.now().toString());

      const response = await fetch(targetUrl.toString(), {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.status === 'success' && result.user) {
          const validatedUser: WhitelistUser = {
            nama: result.user.nama || normEmail,
            email: normEmail,
            pin: normPin,
            peran: result.user.peran || '',
            status: result.user.status || 'Aktif',
          };

          const session: AuthSession = {
            user: validatedUser,
            loginTime: new Date().toISOString(),
            rememberMe,
          };
          saveAuthSession(session);

          return {
            success: true,
            code: 'SUCCESS',
            message: `Selamat datang, ${validatedUser.nama}! Akses formulir berhasil diverifikasi langsung dari Google Sheet.`,
            user: validatedUser,
          };
        } else if (result && result.code === 'INACTIVE') {
          return {
            success: false,
            code: 'INACTIVE',
            message: 'Akun Anda berstatus Non-Aktif pada database whitelist. Silakan hubungi Administrator untuk mengaktifkan kembali.',
          };
        } else if (result && result.code === 'INVALID_PIN') {
          return {
            success: false,
            code: 'INVALID_PIN',
            message: 'PIN yang Anda masukkan salah. Silakan periksa kembali PIN Anda.',
          };
        } else if (result && result.code === 'NOT_FOUND') {
          return {
            success: false,
            code: 'NOT_FOUND',
            message: 'Email ini belum terdaftar di tab whitelist_user Google Sheet.',
          };
        }
      }
    } catch (e) {
      console.info('Live online verification fallback to local whitelist cache:', e);
    }
  }

  // 2. Local Whitelist Verification (Supports offline & local seed/cache)
  const currentWhitelist = getStoredWhitelist();
  const matchedUser = currentWhitelist.find(
    (u) => normalizeEmail(u.email) === normEmail
  );

  if (!matchedUser) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'Email Anda belum terdaftar di daftar whitelist. Hubungi Admin untuk mendaftarkan email Anda ke tab whitelist_user.',
    };
  }

  // Check Status
  const userStatus = (matchedUser.status || '').trim().toLowerCase();
  if (userStatus === 'non-aktif' || userStatus === 'nonaktif' || userStatus === 'inactive') {
    return {
      success: false,
      code: 'INACTIVE',
      message: 'Status akun Anda saat ini "Non-Aktif". Hubungi Administrator untuk mengaktifkan kembali hak akses Anda.',
    };
  }

  // Check PIN
  if (normalizePin(matchedUser.pin) !== normPin) {
    return {
      success: false,
      code: 'INVALID_PIN',
      message: 'PIN yang Anda masukkan tidak sesuai dengan email ini. Silakan coba lagi.',
    };
  }

  // Successful verification
  const session: AuthSession = {
    user: matchedUser,
    loginTime: new Date().toISOString(),
    rememberMe,
  };
  saveAuthSession(session);

  return {
    success: true,
    code: 'SUCCESS',
    message: `Verifikasi berhasil! Selamat bertugas, ${matchedUser.nama}.`,
    user: matchedUser,
  };
}

/**
 * Get current authenticated session from storage
 */
export function getCurrentSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (session && session.user && session.user.email) {
      return session;
    }
  } catch (e) {
    console.warn('Failed parsing auth session:', e);
  }
  return null;
}

/**
 * Save auth session to localStorage
 */
export function saveAuthSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Failed saving auth session:', e);
  }
}

/**
 * Logout and clear session
 */
export function logout(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed clearing session:', e);
  }
}

/**
 * Re-validates if current session's email is still present and 'Aktif' in whitelist.
 * If user was deleted or set to Non-Aktif by admin, terminates session.
 */
export function isCurrentSessionValid(session: AuthSession | null): boolean {
  if (!session || !session.user || !session.user.email) return false;
  const whitelist = getStoredWhitelist();
  const found = whitelist.find((u) => normalizeEmail(u.email) === normalizeEmail(session.user.email));
  if (!found) return false;
  const status = (found.status || '').trim().toLowerCase();
  if (status === 'non-aktif' || status === 'nonaktif' || status === 'inactive') return false;
  return true;
}
