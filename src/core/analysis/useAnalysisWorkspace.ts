import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "../../auth/useAuth";
import { recordActivity } from "../../db/activityLogService";
import {
  clearPersistedAnalysisInfo,
  consumeAnalysisResume,
  getPersistedAnalysisInfo,
  persistAnalysisInfo,
  saveAnalysis,
} from "../../db/analysisService";
import { defaultAnalysisInfoState, type AnalysisInfoState, type AnalysisStatus, type AnalysisType, type PersistedAnalysisResults } from "../../types/analysis";
import { exportAnalysisReport } from "../report/exportAnalysisReport";

export const buildInitialWorkspaceState = <TForm extends object>(
  analysisType: AnalysisType,
  createDefaultForm: () => TForm
): { form: TForm; info: AnalysisInfoState } => {
  const defaultForm = createDefaultForm();
  const defaultInfo = defaultAnalysisInfoState();
  const storedInfo = getPersistedAnalysisInfo(
    analysisType,
    defaultInfo as unknown as Record<string, unknown>
  ) as unknown as AnalysisInfoState;
  const resumed = consumeAnalysisResume<TForm>(analysisType);

  return {
    form: resumed.formData ? ({ ...defaultForm, ...resumed.formData } as TForm) : defaultForm,
    info: {
      ...storedInfo,
      analysisId:
        typeof resumed.info?.id === "string"
          ? resumed.info.id
          : typeof resumed.info?.analysisId === "string"
            ? resumed.info.analysisId
            : storedInfo.analysisId,
      title: String(resumed.info?.title ?? storedInfo.title),
      customerName: String(resumed.info?.customerName ?? storedInfo.customerName),
      customerTaxNumber: String(resumed.info?.customerTaxNumber ?? storedInfo.customerTaxNumber),
      customerNaceCode: String(resumed.info?.customerNaceCode ?? storedInfo.customerNaceCode),
      customerSector: String(resumed.info?.customerSector ?? storedInfo.customerSector),
      notes: String(resumed.info?.notes ?? storedInfo.notes),
      status: ((resumed.info?.status as AnalysisStatus | undefined) ?? storedInfo.status) as AnalysisStatus,
    },
  };
};

interface UseAnalysisWorkspaceParams {
  analysisType: AnalysisType;
  info: AnalysisInfoState;
  setInfo: Dispatch<SetStateAction<AnalysisInfoState>>;
  formData: Record<string, unknown>;
  results: PersistedAnalysisResults;
  scores?: Record<string, unknown> | null;
  extractedCategories?: Record<string, unknown> | null;
  defaultTitle: string;
  onSaved?: () => void | Promise<void>;
}

export const useAnalysisWorkspace = ({
  analysisType,
  info,
  setInfo,
  formData,
  results,
  scores = null,
  extractedCategories = null,
  defaultTitle,
  onSaved,
}: UseAnalysisWorkspaceParams) => {
  const { user, openAuthDialog } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    persistAnalysisInfo(analysisType, info as unknown as Record<string, unknown>);
  }, [analysisType, info]);

  const setInfoField = <K extends keyof AnalysisInfoState>(key: K, nextValue: AnalysisInfoState[K]) => {
    setInfo((prev) => ({ ...prev, [key]: nextValue }));
  };

  const clearInfo = () => {
    clearPersistedAnalysisInfo(analysisType);
    setInfo(defaultAnalysisInfoState());
  };

  const performSave = async (asGuest = false) => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload = await saveAnalysis({
        analysisId: info.analysisId,
        userId: asGuest ? null : user?.id ?? null,
        analysisType,
        title: info.title.trim() || defaultTitle,
        customerName: info.customerName.trim(),
        customerTaxNumber: info.customerTaxNumber.trim(),
        customerNaceCode: info.customerNaceCode.trim(),
        customerSector: info.customerSector.trim(),
        formData,
        extractedCategories,
        results,
        scores,
        eligibleCount: results.uygun.length,
        potentialCount: results.potansiyel.length,
        riskyCount: results.riskli.length,
        notes: info.notes.trim(),
        status: info.status,
      });

      setInfo((prev) => ({ ...prev, analysisId: payload.id }));
      setSaveMessage(
        asGuest
          ? "Analiz misafir olarak taray\u0131c\u0131ya kaydedildi. Kal\u0131c\u0131 kay\u0131t i\u00e7in giri\u015f yapabilirsiniz."
          : "Analiz ba\u015far\u0131yla kaydedildi."
      );

      if (!asGuest && user) {
        await recordActivity({
          userId: user.id,
          actionType: info.analysisId ? "analysis_update" : "analysis_save",
          module: analysisType,
          entityType: "analysis",
          entityId: payload.id,
          description: `${payload.title || defaultTitle} kaydedildi.`,
        });
      }

      await onSaved?.();
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Analiz kaydedilemedi. L\u00fctfen ba\u011flant\u0131n\u0131z\u0131 ve oturum durumunuzu kontrol edin."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      openAuthDialog("login", "Analizinizi kaydetmek i\u00e7in giri\u015f yapman\u0131z gerekiyor.", () => performSave(true));
      return;
    }

    await performSave(false);
  };

  const handleReportPlaceholder = async () => {
    try {
      await exportAnalysisReport({
        analysisType,
        defaultTitle,
        info,
        formData,
        results,
        scores,
      });

      if (user) {
        await recordActivity({
          userId: user.id,
          actionType: "analysis_report_placeholder",
          module: analysisType,
          entityType: "analysis",
          entityId: info.analysisId,
          description: `${info.title || defaultTitle} i\u00e7in rapor \u00e7\u0131kt\u0131s\u0131 olu\u015fturuldu.`,
        });
      }

      setSaveMessage("Rapor penceresi a\u00e7\u0131ld\u0131. Yazd\u0131r ekran\u0131ndan PDF olarak kaydedebilirsiniz.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Rapor olu\u015fturulamad\u0131. L\u00fctfen tekrar deneyin."
      );
    }
  };

  return {
    setInfoField,
    clearInfo,
    isSaving,
    saveMessage,
    handleSave,
    handleReportPlaceholder,
  };
};
