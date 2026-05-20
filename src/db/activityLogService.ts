import type { ActivityLogRecord, CreateActivityLogInput } from "../types/activity";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const activityLogsStoragePrefix = "activityLogs:";

const mapActivityLog = (row: Record<string, unknown>): ActivityLogRecord => ({
  id: String(row.id),
  userId: String(row.user_id),
  actionType: row.action_type as ActivityLogRecord["actionType"],
  module: row.module as ActivityLogRecord["module"],
  entityType: (row.entity_type as string | null) ?? null,
  entityId: (row.entity_id as string | null) ?? null,
  description: String(row.description ?? ""),
  metadata: (row.metadata as Record<string, unknown> | null) ?? null,
  createdAt: String(row.created_at),
});

const getActivityLogsStorageKey = (userId: string) => `${activityLogsStoragePrefix}${userId}`;

const readLocalActivityLogs = (userId: string): ActivityLogRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getActivityLogsStorageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ActivityLogRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalActivityLogs = (userId: string, logs: ActivityLogRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getActivityLogsStorageKey(userId), JSON.stringify(logs));
};

export const recordActivity = async (input: CreateActivityLogInput): Promise<void> => {
  if (!isSupabaseConfigured) {
    const nextLog: ActivityLogRecord = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `activity-${Date.now()}`,
      userId: input.userId,
      actionType: input.actionType,
      module: input.module,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      description: input.description,
      metadata: input.metadata ?? null,
      createdAt: new Date().toISOString(),
    };
    const existing = readLocalActivityLogs(input.userId);
    writeLocalActivityLogs(input.userId, [nextLog, ...existing].slice(0, 300));
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("activity_logs").insert({
    user_id: input.userId,
    action_type: input.actionType,
    module: input.module,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    description: input.description,
    metadata: input.metadata ?? null,
  });

  if (error) {
    throw error;
  }
};

export const listMyActivityLogs = async (userId: string): Promise<ActivityLogRecord[]> => {
  if (!isSupabaseConfigured) {
    return readLocalActivityLogs(userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapActivityLog(row as Record<string, unknown>));
};
