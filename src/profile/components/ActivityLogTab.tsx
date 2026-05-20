import { Clock3 } from "lucide-react";
import type { ActivityLogRecord } from "../../types/activity";

interface ActivityLogTabProps {
  logs: ActivityLogRecord[];
  isLoading: boolean;
}

export default function ActivityLogTab({ logs, isLoading }: ActivityLogTabProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
          <Clock3 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Henüz hareket kaydı bulunmuyor</h3>
        <p className="mt-2 text-sm text-slate-600">Platformdaki işlemler burada zaman sırasıyla listelenecek.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[180px_170px_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>Tarih</span>
        <span>Modül</span>
        <span>Açıklama</span>
      </div>
      <div className="divide-y divide-slate-100">
        {logs.map((log) => (
          <div key={log.id} className="grid grid-cols-1 gap-2 px-5 py-4 text-sm text-slate-700 md:grid-cols-[180px_170px_1fr] md:gap-4">
            <span>{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
            <span className="font-medium text-slate-900">{log.module}</span>
            <span>{log.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
