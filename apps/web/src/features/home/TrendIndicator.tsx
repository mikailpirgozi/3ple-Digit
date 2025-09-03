interface TrendIndicatorProps {
  current: number;
  previous?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export function TrendIndicator({
  current,
  previous,
  formatValue = value => value.toString(),
  className = '',
}: TrendIndicatorProps) {
  if (previous === undefined || previous === 0) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs text-muted-foreground">—</span>
      </div>
    );
  }

  const change = current - previous;
  const percentChange = (change / Math.abs(previous)) * 100;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {isNeutral ? (
        <span className="text-xs text-muted-foreground">—</span>
      ) : (
        <>
          <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '↗' : '↘'}
          </span>
          <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatValue(Math.abs(change))} ({Math.abs(percentChange).toFixed(1)}%)
          </span>
        </>
      )}
    </div>
  );
}
