import { createContext, type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session, User } from "@supabase/supabase-js";
import type { AuthContextValue, AuthDialogView, RegisterPayload, UserProfile } from "../types/auth";
import { recordActivity } from "../db/activityLogService";
import { ensureProfile, getMyProfile, touchLastLogin, updateProfileInfo } from "../db/profileService";
import { getSupabaseClient, isSupabaseConfigured } from "../db/supabaseClient";
import UpgradeModal from "./UpgradeModal";

const guestModeStorageKey = "guestModeEnabled";
const mockUsersStorageKey = "mockAuthUsers";
const mockSessionStorageKey = "mockAuthSession";

interface MockUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  companyName: string;
  role: UserProfile["role"];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

const encodePassword = (value: string) => {
  if (typeof window === "undefined") {
    return value;
  }

  return window.btoa(unescape(encodeURIComponent(value)));
};

const decodePassword = (value: string) => {
  if (typeof window === "undefined") {
    return value;
  }

  return decodeURIComponent(escape(window.atob(value)));
};

const createMockSupabaseUser = (mockUser: MockUserRecord): User =>
  ({
    id: mockUser.id,
    app_metadata: {},
    user_metadata: {
      full_name: mockUser.fullName,
      company_name: mockUser.companyName,
      role: mockUser.role,
    },
    aud: "authenticated",
    created_at: mockUser.createdAt,
    email: mockUser.email,
  }) as User;

const toProfile = (mockUser: MockUserRecord): UserProfile => ({
  id: mockUser.id,
  fullName: mockUser.fullName,
  email: mockUser.email,
  companyName: mockUser.companyName,
  role: mockUser.role,
  avatarUrl: null,
  createdAt: mockUser.createdAt,
  updatedAt: mockUser.updatedAt,
  lastLoginAt: mockUser.lastLoginAt,
});

const readMockUsers = (): MockUserRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(mockUsersStorageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as MockUserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeMockUsers = (users: MockUserRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockUsersStorageKey, JSON.stringify(users));
};

const readMockSession = (): MockUserRecord | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(mockSessionStorageKey);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as MockUserRecord;
  } catch {
    return null;
  }
};

const writeMockSession = (session: MockUserRecord | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(mockSessionStorageKey);
    return;
  }

  window.localStorage.setItem(mockSessionStorageKey, JSON.stringify(session));
};

const readGuestFlag = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(guestModeStorageKey) === "true";
};

const getAuthRedirectUrl = (path: string) => {
  if (typeof window === "undefined") {
    return path;
  }

  const basePath = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${window.location.origin}${basePath}${normalizedPath}`;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authDialogView, setAuthDialogView] = useState<AuthDialogView>(null);
  const [authDialogMessage, setAuthDialogMessage] = useState<string | null>(null);
  const [guestContinueAction, setGuestContinueAction] = useState<(() => void | Promise<void>) | null>(null);
  const [upgradeModalMessage, setUpgradeModalMessage] = useState<string | null>(null);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    const initialize = async () => {
      const guestEnabled = readGuestFlag();
      setIsGuest(guestEnabled);

      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          const nextProfile = await getMyProfile(data.session.user.id);
          setProfile(nextProfile);
          setIsGuest(false);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(guestModeStorageKey);
          }
        }

        const { data: subscription } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
          setSession(nextSession);
          setUser(nextSession?.user ?? null);

          if (nextSession?.user) {
            setIsGuest(false);
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(guestModeStorageKey);
            }
            if (event !== "PASSWORD_RECOVERY") {
              await touchLastLogin(nextSession.user.id);
            }
            setProfile(await getMyProfile(nextSession.user.id));
          } else {
            setProfile(null);
          }
        });

        setIsLoading(false);

        return () => subscription.subscription.unsubscribe();
      }

      const mockSession = readMockSession();
      if (mockSession) {
        setUser(createMockSupabaseUser(mockSession));
        setProfile(toProfile(mockSession));
        setIsGuest(false);
      }

      setIsLoading(false);
      return undefined;
    };

    let cleanup: (() => void) | undefined;
    void initialize().then((nextCleanup) => {
      cleanup = nextCleanup;
    });

    return () => cleanup?.();
  }, []);

  const closeAuthDialog = () => {
    setAuthDialogView(null);
    setAuthDialogMessage(null);
    setGuestContinueAction(null);
  };

  const openAuthDialog = (
    view: Exclude<AuthDialogView, null> = "login",
    message?: string,
    onGuestContinue?: (() => void | Promise<void>) | null
  ) => {
    setAuthDialogView(view);
    setAuthDialogMessage(message ?? null);
    setGuestContinueAction(onGuestContinue ?? null);
    setUpgradeModalMessage(message ?? "Bu modüle erismek icin kayit olmaniz veya giris yapmaniz gerekiyor.");
  };

  const switchAuthDialog = (view: Exclude<AuthDialogView, null>) => setAuthDialogView(view);

  const continueAsGuest = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(guestModeStorageKey, "true");
    }

    setIsGuest(true);
    setUser(null);
    setProfile(null);
    setSession(null);
    writeMockSession(null);
    await guestContinueAction?.();
    closeAuthDialog();
    navigate("/app", { replace: true });
  };

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Auth servisi su anda kullanilamiyor.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session ?? null);
        setProfile(await getMyProfile(data.user.id));
        await touchLastLogin(data.user.id);
        await recordActivity({
          userId: data.user.id,
          actionType: "login",
          module: "auth",
          entityType: "session",
          description: "Kullanici giris yapti.",
        });
      }
    } else {
      const users = readMockUsers();
      const existing = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
      if (!existing || decodePassword(existing.passwordHash) !== password) {
        throw new Error("E-posta veya sifre hatali.");
      }

      const updatedSession = { ...existing, lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      writeMockSession(updatedSession);
      writeMockUsers(users.map((item) => (item.id === updatedSession.id ? updatedSession : item)));
      setUser(createMockSupabaseUser(updatedSession));
      setProfile(toProfile(updatedSession));
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(guestModeStorageKey);
    }

    setIsGuest(false);
    closeAuthDialog();
  };

  const signUp = async (payload: RegisterPayload) => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Auth servisi su anda kullanilamiyor.");
      }

      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.fullName,
            company_name: payload.companyName,
            role: payload.role,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await ensureProfile({
          id: data.user.id,
          email: payload.email,
          fullName: payload.fullName,
          companyName: payload.companyName,
          role: payload.role,
        });

        setUser(data.user);
        setSession(data.session ?? null);
        setProfile(await getMyProfile(data.user.id));

        await recordActivity({
          userId: data.user.id,
          actionType: "register",
          module: "auth",
          entityType: "user",
          entityId: data.user.id,
          description: "Kullanici kayit oldu.",
        });
      }
    } else {
      const users = readMockUsers();
      const exists = users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase());
      if (exists) {
        throw new Error("Bu e-posta ile zaten bir hesap olusturulmus.");
      }

      const now = new Date().toISOString();
      const created: MockUserRecord = {
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `mock-${Date.now()}`,
        email: payload.email,
        passwordHash: encodePassword(payload.password),
        fullName: payload.fullName,
        companyName: payload.companyName,
        role: payload.role,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      writeMockUsers([created, ...users]);
      writeMockSession(created);
      setUser(createMockSupabaseUser(created));
      setProfile(toProfile(created));
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(guestModeStorageKey);
    }

    setIsGuest(false);
    closeAuthDialog();
  };

  const signOut = async () => {
    if (user) {
      await recordActivity({
        userId: user.id,
        actionType: "logout",
        module: "auth",
        entityType: "session",
        description: "Kullanici cikis yapti.",
      });
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }

    writeMockSession(null);
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsGuest(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(guestModeStorageKey);
    }
  };

  const requestPasswordReset = async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Sifre sifirlama maili icin Supabase Auth yapilandirmasi gerekli.");
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Auth servisi su anda kullanilamiyor.");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl("/auth/update-password"),
    });

    if (error) {
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Sifre guncelleme icin Supabase Auth yapilandirmasi gerekli.");
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Auth servisi su anda kullanilamiyor.");
    }

    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw error;
    }

    if (data.user) {
      await recordActivity({
        userId: data.user.id,
        actionType: "password_reset",
        module: "auth",
        entityType: "user",
        entityId: data.user.id,
        description: "Kullanici sifresini sifirladi.",
      });
    }

    await supabase.auth.signOut();
    writeMockSession(null);
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsGuest(false);
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    if (isSupabaseConfigured) {
      setProfile(await getMyProfile(user.id));
      return;
    }

    const mockSession = readMockSession();
    setProfile(mockSession ? toProfile(mockSession) : null);
  };

  const updateProfile = async (payload: Partial<Pick<UserProfile, "fullName" | "companyName" | "role">>) => {
    if (!user) {
      throw new Error("Bu islemi yapmak icin giris yapmaniz gerekiyor.");
    }

    if (isSupabaseConfigured) {
      const nextProfile = await updateProfileInfo(user.id, payload);
      setProfile(nextProfile);
    } else {
      const users = readMockUsers();
      const existing = users.find((item) => item.id === user.id);
      if (!existing) {
        throw new Error("Kullanici profili bulunamadi.");
      }

      const updated: MockUserRecord = {
        ...existing,
        fullName: payload.fullName ?? existing.fullName,
        companyName: payload.companyName ?? existing.companyName,
        role: payload.role ?? existing.role,
        updatedAt: new Date().toISOString(),
      };

      writeMockUsers(users.map((item) => (item.id === updated.id ? updated : item)));
      writeMockSession(updated);
      setProfile(toProfile(updated));
    }

    await recordActivity({
      userId: user.id,
      actionType: "profile_update",
      module: "profile",
      entityType: "profile",
      entityId: user.id,
      description: "Profil bilgileri guncellendi.",
    });
  };

  const openUpgradeModal = (message?: string) => {
    setUpgradeModalMessage(message ?? "Bu modüle erismek icin kayit olmaniz veya giris yapmaniz gerekiyor.");
  };

  const closeUpgradeModal = () => {
    setUpgradeModalMessage(null);
    closeAuthDialog();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      isLoading,
      isConfigured: isSupabaseConfigured,
      isAuthenticated,
      isGuest,
      authDialogView,
      authDialogMessage,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updatePassword,
      login: signIn,
      register: signUp,
      logout: signOut,
      continueAsGuest,
      refreshProfile,
      updateProfile,
      openAuthDialog,
      closeAuthDialog,
      switchAuthDialog,
      openUpgradeModal,
      closeUpgradeModal,
    }),
    [session, user, profile, isLoading, isAuthenticated, isGuest, authDialogView, authDialogMessage]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <UpgradeModal
        isOpen={Boolean(upgradeModalMessage)}
        message={upgradeModalMessage}
        onClose={closeUpgradeModal}
        onLogin={() => navigate("/auth/login")}
        onRegister={() => navigate("/auth/register")}
      />
    </AuthContext.Provider>
  );
}
