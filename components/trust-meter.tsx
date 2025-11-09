import clsx from "clsx";

interface TrustMeterProps {
  value: number;
  size?: "sm" | "md";
}

export function TrustMeter({ value, size = "md" }: TrustMeterProps) {
  const percentage = Math.round(value * 100);
  const indicatorColor = value > 0.85 ? "bg-emerald-500" : value > 0.7 ? "bg-amber-400" : "bg-rose-500";

  return (
    <div className={clsx("flex flex-col", size === "sm" ? "gap-1" : "gap-2")}>
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Trust Score</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <div className={clsx("h-2 rounded-full bg-slate-200", size === "sm" ? "w-32" : "w-48")}> 
        <div className={clsx("h-2 rounded-full", indicatorColor)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
