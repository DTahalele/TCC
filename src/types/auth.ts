export interface WhitelistUser {
  nama: string;
  email: string;
  pin: string;
  peran?: string;
  status: 'Aktif' | 'Non-Aktif' | string;
}

export interface AuthSession {
  user: WhitelistUser;
  loginTime: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: WhitelistUser;
  code?: 'SUCCESS' | 'INVALID_EMAIL' | 'INVALID_PIN' | 'INACTIVE' | 'NOT_FOUND' | 'NETWORK_ERROR';
}
