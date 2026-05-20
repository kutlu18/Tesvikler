const tabs = ["Genel Bilgiler", "Analizlerim", "Hareket Geçmişi", "Ayarlar"] as const;

export type ProfileTabKey = (typeof tabs)[number];

interface ProfileTabsProps {
  activeTab: ProfileTabKey;
  onChange: (tab: ProfileTabKey) => void;
}

export default function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  return (
    <div className="inline-flex flex-wrap rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === tab ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
