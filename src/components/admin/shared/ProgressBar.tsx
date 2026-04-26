interface ProgressBarProps {
  value: number;
  /** Цвет градиента: "violet" | "cyan" */
  color?: "violet" | "cyan";
  minWidth?: string;
}

export default function ProgressBar({ value, color = "violet", minWidth = "min-w-[100px]" }: ProgressBarProps) {
  const gradient =
    color === "cyan"
      ? "bg-gradient-to-r from-violet-500 to-cyan-500"
      : "bg-gradient-to-r from-violet-500 to-purple-600";

  if (value <= 0) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <div className={`flex items-center gap-2 ${minWidth}`}>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${gradient} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{value}%</span>
    </div>
  );
}
