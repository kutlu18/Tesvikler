import type { AnalysisType } from "../types/analysis";
import type { UserProfile } from "../types/auth";
import { listMyAnalyses } from "./analysisService";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const mockUsersStorageKey = "mockAuthUsers";
const mockSessionStorageKey = "mockAuthSession";

interface MockUserRecord {
  id: string;
  email: string;
  passwordHash?: string;
  fullName: string;
  companyName: string;
  role: UserProfile["role"];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

const mapProfile = (row: Record<string, unknown>): UserProfile => ({
  id: String(row.id),
  fullName: String(row.full_name ?? ""),
  email: String(row.email ?? ""),
  companyName: String(row.company_name ?? ""),
  role: (row.role as UserProfile["role"]) ?? "Diger",
  avatarUrl: (row.avatar_url as string | null) ?? null,
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
  lastLoginAt: (row.last_login_at as string | null) ?? null,
});

export interface ProfileSummary extends UserProfile {
  totalAnalysisCount: number;
  mostUsedAnalysisModule: AnalysisType | null;
}

const readMockUserRecords = (): MockUserRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(mockUsersStorageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => ({
      id: String(item.id),
      passwordHash: typeof item.passwordHash === "string" ? item.passwordHash : undefined,
      fullName: String(item.fullName ?? ""),
      email: String(item.email ?? ""),
      companyName: String(item.companyName ?? ""),
      role: (item.role as UserProfile["role"]) ?? "Diger",
      createdAt: String(item.createdAt ?? new Date().toISOString()),
      updatedAt: String(item.updatedAt ?? new Date().toISOString()),
      lastLoginAt: (item.lastLoginAt as string | null) ?? null,
    }));
  } catch {
    return [];
  }
};

const readMockProfiles = (): UserProfile[] =>
  readMockUserRecords().map((item) => ({
    id: item.id,
    fullName: item.fullName,
    email: item.email,
    companyName: item.companyName,
    role: item.role,
    avatarUrl: null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastLoginAt: item.lastLoginAt,
  }));

const writeMockUserRecords = (users: MockUserRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = users.map((item) => ({
    id: item.id,
    email: item.email,
    passwordHash: item.passwordHash,
    fullName: item.fullName,
    companyName: item.companyName,
    role: item.role,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastLoginAt: item.lastLoginAt,
  }));

  window.localStorage.setItem(mockUsersStorageKey, JSON.stringify(normalized));
};

const writeMockSessionProfile = (profile: UserProfile) => {
  if (typeof window === "undefined") {
    return;
  }

  const raw = window.localStorage.getItem(mockSessionStorageKey);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    window.localStorage.setItem(
      mockSessionStorageKey,
      JSON.stringify({
        ...parsed,
        fullName: profile.fullName,
        companyName: profile.companyName,
        role: profile.role,
        updatedAt: profile.updatedAt,
        lastLoginAt: profile.lastLoginAt,
      })
    );
  } catch {
    // noop
  }
};

export const getMyProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured) {
    return readMockProfiles().find((item) => item.id === userId) ?? null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfile(data as Record<string, unknown>) : null;
};

export const ensureProfile = async (payload: {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  role: UserProfile["role"];
}): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: payload.id,
      email: payload.email,
      full_name: payload.fullName,
      company_name: payload.companyName,
      role: payload.role,
      last_login_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }
};

export const updateProfileInfo = async (
  userId: string,
  payload: Partial<Pick<UserProfile, "fullName" | "companyName" | "role">>
): Promise<UserProfile> => {
  if (!isSupabaseConfigured) {
    const users = readMockUserRecords();
    const existing = users.find((item) => item.id === userId);

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

    writeMockUserRecords(users.map((item) => (item.id === userId ? updated : item)));
    const updatedProfile = readMockProfiles().find((item) => item.id === userId);
    if (!updatedProfile) {
      throw new Error("Kullanici profili bulunamadi.");
    }

    writeMockSessionProfile(updatedProfile);
    return updatedProfile;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase connection is not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: payload.fullName,
      company_name: payload.companyName,
      role: payload.role,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data as Record<string, unknown>);
};

export const touchLastLogin = async (userId: string) => {
  if (!isSupabaseConfigured) {
    const users = readMockUserRecords();
    const existing = users.find((item) => item.id === userId);
    if (!existing) {
      return;
    }

    const updated: MockUserRecord = {
      ...existing,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeMockUserRecords(users.map((item) => (item.id === userId ? updated : item)));
    writeMockSessionProfile({
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      companyName: updated.companyName,
      role: updated.role,
      avatarUrl: null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      lastLoginAt: updated.lastLoginAt,
    });
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  await supabase.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", userId);
};

export const getProfileSummary = async (userId: string): Promise<ProfileSummary | null> => {
  const profile = await getMyProfile(userId);
  if (!profile) {
    return null;
  }

  const analyses = await listMyAnalyses(userId);
  const usage = analyses.reduce<Record<string, number>>((acc, item) => {
    acc[item.analysisType] = (acc[item.analysisType] ?? 0) + 1;
    return acc;
  }, {});

  const mostUsedAnalysisModule = Object.entries(usage).sort((a, b) => b[1] - a[1])[0]?.[0] as AnalysisType | undefined;

  return {
    ...profile,
    totalAnalysisCount: analyses.length,
    mostUsedAnalysisModule: mostUsedAnalysisModule ?? null,
  };
};
