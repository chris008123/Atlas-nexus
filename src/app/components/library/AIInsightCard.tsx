import { GlassCard } from "../Shared"

export function AIInsightCard({ icon: Icon, label, value, color }: {
  icon: React.FC<any>, label: string, value: string, color: string
}) {
  return (
    <GlassCard className="p-3.5 flex items-center gap-3" hover={false}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={14} color={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide truncate text-[var(--text3)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
        <p className="text-sm font-semibold truncate text-[var(--text)]" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{value}</p>
      </div>
    </GlassCard>
  )
}