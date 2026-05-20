import { ReactNode } from "react";

interface SgkQuestionSectionProps {
  title: string;
  children: ReactNode;
}

export default function SgkQuestionSection({ title, children }: SgkQuestionSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-card">
      <h2 className="mb-4 text-lg font-bold text-slate-900">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}



