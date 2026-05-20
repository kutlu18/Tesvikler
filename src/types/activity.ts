import type { AnalysisType } from "./analysis";

export type ActivityActionType =
  | "register"
  | "login"
  | "logout"
  | "analysis_create"
  | "analysis_save"
  | "analysis_update"
  | "analysis_delete"
  | "analysis_archive"
  | "analysis_view"
  | "analysis_duplicate"
  | "analysis_note"
  | "analysis_report_placeholder"
  | "profile_update"
  | "password_reset_placeholder";

export interface ActivityLogRecord {
  id: string;
  userId: string;
  actionType: ActivityActionType;
  module: AnalysisType | "auth" | "profile" | "system";
  entityType: string | null;
  entityId: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateActivityLogInput {
  userId: string;
  actionType: ActivityActionType;
  module: AnalysisType | "auth" | "profile" | "system";
  entityType?: string | null;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, unknown> | null;
}
