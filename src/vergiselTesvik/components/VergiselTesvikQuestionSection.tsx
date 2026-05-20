import { ReactNode } from "react";

interface VergiselTesvikQuestionSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function VergiselTesvikQuestionSection({
  title,
  description,
  children,
}: VergiselTesvikQuestionSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-card">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}


