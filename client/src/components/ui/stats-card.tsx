interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, subtitle, icon, trend, className = "" }: StatsCardProps) {
  return (
    <div className={`glass-card p-6 rounded-2xl neon-border hover-lift ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
          {icon}
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <div className="text-gray-400 text-sm">{title}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      {trend && (
        <div className={`text-xs mt-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {trend.value}
        </div>
      )}
    </div>
  );
}
