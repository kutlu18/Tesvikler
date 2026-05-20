import { ReactNode } from "react";
import { repairTurkishText } from "../../core/text/repairTurkishText";

interface TicaretQuestionSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function TicaretQuestionSection({ title, description, children }: TicaretQuestionSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-card">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">{repairTurkishText(title)}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{repairTurkishText(description)}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}


