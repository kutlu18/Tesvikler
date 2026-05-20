import type { Session, User } from "@supabase/supabase-js";

export type UserRole =
  | "Mali Musavir"
  | "Bagimsiz Denetci"
  | "Tesvik Danismani"
  | "Sirket Yetkilisi"
  | "Diger";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  role: UserRole;
}

export type AuthDialogView = "login" | "register" | null;

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  authDialogView: AuthDialogView;
  authDialogMessage: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: Partial<Pick<UserProfile, "fullName" | "companyName" | "role">>) => Promise<void>;
  openAuthDialog: (view?: Exclude<AuthDialogView, null>, message?: string, onGuestContinue?: (() => void | Promise<void>) | null) => void;
  closeAuthDialog: () => void;
  switchAuthDialog: (view: Exclude<AuthDialogView, null>) => void;
  openUpgradeModal: (message?: string) => void;
  closeUpgradeModal: () => void;
}
