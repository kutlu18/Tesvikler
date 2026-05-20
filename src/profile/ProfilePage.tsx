import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { archiveAnalysis, deleteAnalysis, duplicateAnalysis, listMyAnalyses, queueAnalysisResume } from "../db/analysisService";
import { recordActivity, listMyActivityLogs } from "../db/activityLogService";
import { getProfileSummary, type ProfileSummary } from "../db/profileService";
import { exportAnalysisReport } from "../core/report/exportAnalysisReport";
import type { AnalysisFilters, AnalysisRecord } from "../types/analysis";
import ActivityLogTab from "./components/ActivityLogTab";
import AnalysisDetailModal from "./components/AnalysisDetailModal";
import MyAnalysesTab from "./components/MyAnalysesTab";
import ProfileSettingsTab from "./components/ProfileSettingsTab";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import ProfileTabs, { type ProfileTabKey } from "./components/ProfileTabs";

interface ProfilePageProps {
  onNavigateToModule: (moduleKey: string) => void;
  initialTab?: ProfileTabKey;
}

export default function ProfilePage({ onNavigateToModule, initialTab = "Genel Bilgiler" }: ProfilePageProps) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTabKey>(initialTab);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof listMyActivityLogs>>>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [filters, setFilters] = useState<AnalysisFilters>({ analysisType: "all", status: "all" });

  const reloadAnalyses = async () => {
    if (!user) {
      return;
    }

    setIsLoadingAnalyses(true);
    try {
      const items = await listMyAnalyses(user.id, filters);
      setAnalyses(items);
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  const reloadSummary = async () => {
    if (!user) {
      return;
    }

    const nextSummary = await getProfileSummary(user.id);
    setSummary(nextSummary);
  };

  const reloadLogs = async () => {
    if (!user) {
      return;
    }

    setIsLoadingLogs(true);
    try {
      setLogs(await listMyActivityLogs(user.id));
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void reloadSummary();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void reloadAnalyses();
  }, [user, filters]);

  useEffect(() => {
    if (!user || activeTab !== "Hareket Geçmişi") {
      return;
    }

    void reloadLogs();
  }, [user, activeTab]);

  const generalInfo = useMemo(
    () => (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Genel Bilgiler</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Info label="Ad Soyad" value={profile?.fullName || "-"} />
          <Info label="E-posta" value={profile?.email || "-"} />
          <Info label="Firma adı" value={profile?.companyName || "-"} />
          <Info label="Rol" value={profile?.role || "-"} />
          <Info label="Son giriş" value={profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString("tr-TR") : "-"} />
          <Info label="Toplam analiz" value={String(summary?.totalAnalysisCount ?? 0)} />
        </div>
      </section>
    ),
    [profile, summary],
  );

  return (
    <div className="space-y-6">
      <ProfileSummaryCard profile={profile} summary={summary} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "Genel Bilgiler" ? generalInfo : null}

      {activeTab === "Analizlerim" ? (
        <MyAnalysesTab
          analyses={analyses}
          filters={filters}
          isLoading={isLoadingAnalyses}
          onFilterChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onView={(analysis) => setSelectedAnalysis(analysis)}
          onReopen={(analysis) => {
            queueAnalysisResume(analysis);
            onNavigateToModule(analysis.analysisType);
          }}
          onArchive={(analysis) => void handleArchiveAnalysis(analysis)}
          onDelete={(analysis) => void handleDeleteAnalysis(analysis)}
          onDuplicate={(analysis) => void handleDuplicateAnalysis(analysis)}
          onReport={(analysis) => void handleReportPlaceholder(analysis)}
        />
      ) : null}

      {activeTab === "Hareket Geçmişi" ? <ActivityLogTab logs={logs} isLoading={isLoadingLogs} /> : null}
      {activeTab === "Ayarlar" ? <ProfileSettingsTab /> : null}

      <AnalysisDetailModal analysis={selectedAnalysis} onClose={() => setSelectedAnalysis(null)} />
    </div>
  );

  async function handleArchiveAnalysis(analysis: AnalysisRecord) {
    if (!user) {
      return;
    }

    await archiveAnalysis(user.id, analysis.id);
    await recordActivity({
      userId: user.id,
      actionType: "analysis_archive",
      module: analysis.analysisType,
      entityType: "analysis",
      entityId: analysis.id,
      description: `${analysis.title || "Analiz"} arşivlendi.`,
    });
    await reloadAnalyses();
    await reloadSummary();
  }

  async function handleDeleteAnalysis(analysis: AnalysisRecord) {
    if (!user) {
      return;
    }

    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Bu analiz silinecek. Devam etmek istiyor musunuz?");
      if (!confirmed) {
        return;
      }
    }

    await deleteAnalysis(user.id, analysis.id);
    await recordActivity({
      userId: user.id,
      actionType: "analysis_delete",
      module: analysis.analysisType,
      entityType: "analysis",
      entityId: analysis.id,
      description: `${analysis.title || "Analiz"} silindi.`,
    });
    await reloadAnalyses();
    await reloadSummary();
  }

  async function handleDuplicateAnalysis(analysis: AnalysisRecord) {
    if (!user) {
      return;
    }

    const created = await duplicateAnalysis(user.id, analysis);
    await recordActivity({
      userId: user.id,
      actionType: "analysis_duplicate",
      module: analysis.analysisType,
      entityType: "analysis",
      entityId: created.id,
      description: `${analysis.title || "Analiz"} kopyalandı.`,
    });
    await reloadAnalyses();
    await reloadSummary();
  }

  async function handleReportPlaceholder(analysis: AnalysisRecord) {
    try {
      await exportAnalysisReport({
        analysisType: analysis.analysisType,
        defaultTitle: analysis.title || "Analiz Raporu",
        info: {
          analysisId: analysis.id,
          title: analysis.title,
          customerName: analysis.customerName || "",
          customerTaxNumber: analysis.customerTaxNumber || "",
          customerNaceCode: analysis.customerNaceCode || "",
          customerSector: analysis.customerSector || "",
          notes: analysis.notes || "",
          status: analysis.status,
        },
        formData: analysis.formData,
        results: analysis.results,
        scores: analysis.scores || null,
      });

      if (!user) {
        return;
      }

      await recordActivity({
        userId: user.id,
        actionType: "analysis_report_placeholder",
        module: analysis.analysisType,
        entityType: "analysis",
        entityId: analysis.id,
        description: `${analysis.title || "Analiz"} için rapor çıktısı oluşturuldu.`,
      });
    } catch (error) {
      if (typeof window !== "undefined") {
        window.alert(error instanceof Error ? error.message : "Rapor oluşturulamadı.");
      }
    }
  }
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}
