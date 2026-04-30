export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  is_active: boolean;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  display_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface RegisterResponse {
  detail: string;
}

export interface ConfirmPasswordResetRequest {
  uid: string;
  token: string;
  password: string;
  password_confirm: string;
}

export interface ActivateAccountRequest {
  uid: string;
  token: string;
}

export interface DetailResponse {
  detail: string;
}
