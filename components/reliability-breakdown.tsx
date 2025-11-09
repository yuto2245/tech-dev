interface ReliabilityBreakdownProps {
  factRate: number;
  humanInputScore: number;
  coverageScore: number;
  backlogCount: number;
}

export function ReliabilityBreakdown({ factRate, humanInputScore, coverageScore, backlogCount }: ReliabilityBreakdownProps) {
  const metrics = [
    {
      label: "ファクトチェック通過率",
      value: factRate,
      description: "直近30日のAIファクトチェックを通過した記事の割合"
    },
    {
      label: "人間入力推定スコア",
      value: humanInputScore,
      description: "AI生成疑惑に対する低リスク割合"
    },
    {
      label: "カバレッジ指数",
      value: coverageScore,
      description: "TechDev推奨テンプレートに沿った項目の充足度"
    }
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">信頼性メトリクス</h2>
          <p className="text-sm text-slate-500">AIと人のシグナルを統合した総合スコアリング</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          要再チェック: {backlogCount}件
        </div>
      </header>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
            <p className="text-3xl font-bold text-slate-900">{metric.value.toFixed(2)}</p>
            <p className="text-sm text-slate-600">{metric.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
