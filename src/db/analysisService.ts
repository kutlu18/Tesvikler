import type { AnalysisFilters, AnalysisNoteRecord, AnalysisRecord, AnalysisStatus, AnalysisType, SaveAnalysisInput } from "../types/analysis";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const guestAnalysisStorageKey = "guestAnalyses";
const userAnalysisStoragePrefix = "savedAnalyses:";
const userAnalysisNotesStoragePrefix = "analysisNotes:";
const analysisResumeStoragePrefix = "analysisResume:";
const analysisInfoStoragePrefix = "analysisInfo:";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const toAnalysisRecord = (row: Record<string, unknown>): AnalysisRecord => ({
  id: String(row.id),
  userId: (row.user_id as string | null) ?? null,
  analysisId: String(row.id),
  analysisType: row.analysis_type as AnalysisType,
  title: String(row.title ?? ""),
  customerName: (row.customer_name as string | undefined) ?? "",
  customerTaxNumber: (row.customer_tax_number as string | undefined) ?? "",
  customerNaceCode: (row.customer_nace_code as string | undefined) ?? "",
  customerSector: (row.customer_sector as string | undefined) ?? "",
  formData: (row.form_data as Record<string, unknown>) ?? {},
  extractedCategories: (row.extracted_categories as Record<string, unknown> | null) ?? null,
  results: (row.results as AnalysisRecord["results"]) ?? { uygun: [], potansiyel: [], riskli: [] },
  scores: (row.scores as Record<string, unknown> | null) ?? null,
  eligibleCount: Number(row.eligible_count ?? 0),
  potentialCount: Number(row.potential_count ?? 0),
  riskyCount: Number(row.risky_count ?? 0),
  notes: (row.notes as string | undefined) ?? "",
  status: row.status as AnalysisRecord["status"],
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
  archivedAt: (row.archived_at as string | null) ?? null,
});

const readGuestAnalyses = (): AnalysisRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(guestAnalysisStorageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as AnalysisRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGuestAnalyses = (analyses: AnalysisRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(guestAnalysisStorageKey, JSON.stringify(analyses));
};

const getUserAnalysesStorageKey = (userId: string) => `${userAnalysisStoragePrefix}${userId}`;
const getUserNotesStorageKey = (userId: string) => `${userAnalysisNotesStoragePrefix}${userId}`;

const readUserAnalyses = (userId: string): AnalysisRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getUserAnalysesStorageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as AnalysisRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeUserAnalyses = (userId: string, analyses: AnalysisRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getUserAnalysesStorageKey(userId), JSON.stringify(analyses));
};

const readUserNotes = (userId: string): AnalysisNoteRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getUserNotesStorageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as AnalysisNoteRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeUserNotes = (userId: string, notes: AnalysisNoteRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getUserNotesStorageKey(userId), JSON.stringify(notes));
};

export const saveGuestAnalysis = async (input: SaveAnalysisInput): Promise<AnalysisRecord> => {
  const now = new Date().toISOString();
  const existing = readGuestAnalyses();
  const nextId = input.analysisId ?? createId();
  const nextRecord: AnalysisRecord = {
    ...input,
    id: nextId,
    analysisId: nextId,
    userId: null,
    createdAt: existing.find((item) => item.id === nextId)?.createdAt ?? now,
    updatedAt: now,
    archivedAt: null,
    isGuest: true,
  };

  const filtered = existing.filter((item) => item.id !== nextRecord.id);
  filtered.unshift(nextRecord);
  writeGuestAnalyses(filtered.slice(0, 30));
  return nextRecord;
};

const saveLocalUserAnalysis = async (input: SaveAnalysisInput): Promise<AnalysisRecord> => {
  const now = new Date().toISOString();
  const userId = input.userId;

  if (!userId) {
    return saveGuestAnalysis(input);
  }

  const existing = readUserAnalyses(userId);
  const nextId = input.analysisId ?? createId();
  const previous = existing.find((item) => item.id === nextId);

  const nextRecord: AnalysisRecord = {
    ...input,
    id: nextId,
    analysisId: nextId,
    userId,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    archivedAt: input.status === "Arsivlendi" ? previous?.archivedAt ?? now : previous?.archivedAt ?? null,
  };

  const filtered = existing.filter((item) => item.id !== nextId);
  filtered.unshift(nextRecord);
  writeUserAnalyses(userId, filtered.slice(0, 200));
  return nextRecord;
};

export const saveAnalysis = async (input: SaveAnalysisInput): Promise<AnalysisRecord> => {
  if (!input.userId) {
    return saveGuestAnalysis(input);
  }

  if (!isSupabaseConfigured) {
    return saveLocalUserAnalysis(input);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return saveLocalUserAnalysis(input);
  }

  const payload = {
    user_id: input.userId,
    analysis_type: input.analysisType,
    title: input.title,
    customer_name: input.customerName ?? null,
    customer_tax_number: input.customerTaxNumber ?? null,
    customer_nace_code: input.customerNaceCode ?? null,
    customer_sector: input.customerSector ?? null,
    status: input.status,
    form_data: input.formData,
    extracted_categories: input.extractedCategories ?? null,
    results: input.results,
    scores: input.scores ?? null,
    eligible_count: input.eligibleCount,
    potential_count: input.potentialCount,
    risky_count: input.riskyCount,
    notes: input.notes ?? null,
  };

  if (input.analysisId) {
    const { data, error } = await supabase
      .from("analyses")
      .update(payload)
      .eq("id", input.analysisId)
      .eq("user_id", input.userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return toAnalysisRecord(data as Record<string, unknown>);
  }

  const { data, error } = await supabase.from("analyses").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return toAnalysisRecord(data as Record<string, unknown>);
};

export const listMyAnalyses = async (userId: string, filters?: AnalysisFilters): Promise<AnalysisRecord[]> => {
  if (!isSupabaseConfigured) {
    let analyses = readUserAnalyses(userId);

    if (filters?.analysisType && filters.analysisType !== "all") {
      analyses = analyses.filter((item) => item.analysisType === filters.analysisType);
    }

    if (filters?.status && filters.status !== "all") {
      analyses = analyses.filter((item) => item.status === filters.status);
    }

    if (filters?.customerName) {
      const search = filters.customerName.toLowerCase();
      analyses = analyses.filter((item) => (item.customerName ?? "").toLowerCase().includes(search));
    }

    if (filters?.naceCode) {
      const search = filters.naceCode.toLowerCase();
      analyses = analyses.filter((item) => (item.customerNaceCode ?? "").toLowerCase().includes(search));
    }

    if (filters?.dateFrom) {
      analyses = analyses.filter((item) => item.createdAt >= filters.dateFrom!);
    }

    if (filters?.dateTo) {
      const end = `${filters.dateTo}T23:59:59.999Z`;
      analyses = analyses.filter((item) => item.createdAt <= end);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      analyses = analyses.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          (item.customerName ?? "").toLowerCase().includes(search) ||
          (item.customerNaceCode ?? "").toLowerCase().includes(search) ||
          (item.notes ?? "").toLowerCase().includes(search)
      );
    }

    if (filters?.resultBucket && filters.resultBucket !== "all") {
      analyses = analyses.filter((item) => {
        if (filters.resultBucket === "uygun") return item.eligibleCount > 0;
        if (filters.resultBucket === "potansiyel") return item.potentialCount > 0;
        return item.riskyCount > 0;
      });
    }

    return analyses.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  let query = supabase.from("analyses").select("*").eq("user_id", userId).order("updated_at", { ascending: false });

  if (filters?.analysisType && filters.analysisType !== "all") {
    query = query.eq("analysis_type", filters.analysisType);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.customerName) {
    query = query.ilike("customer_name", `%${filters.customerName}%`);
  }

  if (filters?.naceCode) {
    query = query.ilike("customer_nace_code", `%${filters.naceCode}%`);
  }

  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_nace_code.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  let analyses = (data ?? []).map((row) => toAnalysisRecord(row as Record<string, unknown>));

  if (filters?.resultBucket && filters.resultBucket !== "all") {
    analyses = analyses.filter((item) => {
      if (filters.resultBucket === "uygun") return item.eligibleCount > 0;
      if (filters.resultBucket === "potansiyel") return item.potentialCount > 0;
      return item.riskyCount > 0;
    });
  }

  return analyses;
};

export const getAnalysisById = async (userId: string, analysisId: string): Promise<AnalysisRecord | null> => {
  if (!isSupabaseConfigured) {
    return readUserAnalyses(userId).find((item) => item.id === analysisId) ?? null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toAnalysisRecord(data as Record<string, unknown>) : null;
};

export const archiveAnalysis = async (userId: string, analysisId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const analyses = readUserAnalyses(userId);
    const updated = analyses.map((item) =>
      item.id === analysisId
        ? ({
            ...item,
            status: "Arsivlendi" as AnalysisStatus,
            archivedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } satisfies AnalysisRecord)
        : item
    );
    writeUserAnalyses(userId, updated);
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("analyses")
    .update({ status: "Arsivlendi", archived_at: new Date().toISOString() })
    .eq("id", analysisId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};

export const deleteAnalysis = async (userId: string, analysisId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const analyses = readUserAnalyses(userId).filter((item) => item.id !== analysisId);
    writeUserAnalyses(userId, analyses);
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("analyses").delete().eq("id", analysisId).eq("user_id", userId);
  if (error) {
    throw error;
  }
};

export const duplicateAnalysis = async (userId: string, analysis: AnalysisRecord): Promise<AnalysisRecord> => {
  return saveAnalysis({
    ...analysis,
    analysisId: null,
    userId,
    title: `${analysis.title || "Analiz"} kopyasi`,
    status: "Taslak",
  });
};

const mapNote = (row: Record<string, unknown>): AnalysisNoteRecord => ({
  id: String(row.id),
  analysisId: String(row.analysis_id),
  userId: String(row.user_id),
  note: String(row.note ?? ""),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
});

export const listAnalysisNotes = async (userId: string, analysisId: string): Promise<AnalysisNoteRecord[]> => {
  if (!isSupabaseConfigured) {
    return readUserNotes(userId)
      .filter((item) => item.analysisId === analysisId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("analysis_notes")
    .select("*")
    .eq("analysis_id", analysisId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapNote(row as Record<string, unknown>));
};

export const addAnalysisNote = async (userId: string, analysisId: string, note: string): Promise<AnalysisNoteRecord> => {
  if (!isSupabaseConfigured) {
    const existing = readUserNotes(userId);
    const now = new Date().toISOString();
    const created: AnalysisNoteRecord = {
      id: createId(),
      analysisId,
      userId,
      note,
      createdAt: now,
      updatedAt: now,
    };
    writeUserNotes(userId, [created, ...existing]);
    return created;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase connection is not configured.");
  }

  const { data, error } = await supabase
    .from("analysis_notes")
    .insert({ user_id: userId, analysis_id: analysisId, note })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapNote(data as Record<string, unknown>);
};

export const persistAnalysisInfo = (analysisType: AnalysisType, info: Record<string, unknown>) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${analysisInfoStoragePrefix}${analysisType}`, JSON.stringify(info));
};

export const getPersistedAnalysisInfo = <T extends Record<string, unknown>>(analysisType: AnalysisType, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(`${analysisInfoStoragePrefix}${analysisType}`);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fallback;
    }

    return { ...fallback, ...parsed } as T;
  } catch {
    return fallback;
  }
};

export const clearPersistedAnalysisInfo = (analysisType: AnalysisType) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(`${analysisInfoStoragePrefix}${analysisType}`);
};

export const queueAnalysisResume = (analysis: AnalysisRecord) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${analysisResumeStoragePrefix}${analysis.analysisType}`, JSON.stringify(analysis));
};

export const consumeAnalysisResume = <TForm extends object>(
  analysisType: AnalysisType
): { formData: TForm | null; info: Partial<AnalysisRecord> | null } => {
  if (typeof window === "undefined") {
    return { formData: null, info: null };
  }

  const storageKey = `${analysisResumeStoragePrefix}${analysisType}`;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return { formData: null, info: null };
    }

    const parsed = JSON.parse(raw) as AnalysisRecord;
    window.localStorage.removeItem(storageKey);

    return {
      formData: (parsed.formData as TForm) ?? null,
      info: parsed,
    };
  } catch {
    return { formData: null, info: null };
  }
};
