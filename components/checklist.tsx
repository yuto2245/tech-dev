import { Check } from "lucide-react";

const items = [
  "GPT-4o-miniによる自動ファクトチェック",
  "Supabase Edge Functionsでの非同期キュー",
  "GitHub OAuthとメール認証のデュアルサポート",
  "信頼性ダッシュボードでの透明なスコア表示",
  "コミュニティモデレーションとアラートログ"
];

export function Checklist() {
  return (
    <section className="mx-auto mt-20 w-full max-w-5xl rounded-3xl border border-slate-200 bg-slate-900 p-10 text-white">
      <h2 className="text-2xl font-semibold">MVPで提供するコア体験</h2>
      <p className="mt-3 text-sm text-slate-300">フェーズ1で実装する、信頼できる技術知識共有のための最小構成です。</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="mt-1 rounded-full bg-emerald-500/20 p-2 text-emerald-300">
              <Check size={16} />
            </span>
            <span className="text-sm leading-6 text-slate-100">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
