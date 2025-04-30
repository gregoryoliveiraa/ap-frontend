export interface User {
  id: string;
  email: string;
  name?: string;
  nome_completo?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  avatar_url?: string;
  phone?: string;
  oab_number?: string;
  numero_oab?: string;
  estado_oab?: string;
  role: string;
  plan: string;
  plano?: string;
  is_active: boolean;
  is_verified: boolean;
  verificado?: boolean;
  created_at: string;
  updated_at: string;
  tokens_used?: number;
  available_credits: number;
  creditos_disponiveis?: number;
  otp_enabled?: boolean;
  otp_verified?: boolean;
  bio?: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  oab_number?: string;
  estado_oab?: string;
  plan?: string;
  is_active?: boolean;
  is_verified?: boolean;
  available_credits?: number;
  role?: string;
}