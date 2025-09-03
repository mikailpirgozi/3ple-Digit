interface DataPoint {
  date: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  className?: string;
  formatValue?: (value: number) => string;
}

export function SimpleLineChart({
  data,
  width = 400,
  height = 200,
  className = '',
  formatValue = value => value.toString(),
}: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-sm text-muted-foreground">Žiadne dáta na zobrazenie</p>
      </div>
    );
  }

  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Find min and max values
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Avoid division by zero

  // Create points for the line
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return { x, y, ...point };
  });

  // Create path string
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Create area path (for gradient fill)
  const areaPath =
    pathData +
    ` L ${points[points.length - 1].x} ${padding + chartHeight}` +
    ` L ${points[0].x} ${padding + chartHeight} Z`;

  return (
    <div className={className}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Gradient definition */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <g className="stroke-muted opacity-20">
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = padding + chartHeight * ratio;
            return (
              <line
                key={`h-${ratio}`}
                x1={padding}
                y1={y}
                x2={padding + chartWidth}
                y2={y}
                strokeWidth="1"
              />
            );
          })}

          {/* Vertical grid lines */}
          {points.map((point, index) => (
            <line
              key={`v-${index}`}
              x1={point.x}
              y1={padding}
              x2={point.x}
              y2={padding + chartHeight}
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" className="opacity-50" />

        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="hsl(var(--primary))"
              className="drop-shadow-sm"
            />
            <circle cx={point.x} cy={point.y} r="2" fill="hsl(var(--background))" />
          </g>
        ))}

        {/* Y-axis labels */}
        <g className="text-xs fill-muted-foreground">
          {[0, 0.5, 1].map(ratio => {
            const y = padding + chartHeight * ratio;
            const value = maxValue - ratio * valueRange;
            return (
              <text
                key={`y-label-${ratio}`}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs"
              >
                {formatValue(value)}
              </text>
            );
          })}
        </g>

        {/* X-axis labels */}
        <g className="text-xs fill-muted-foreground">
          {points.map((point, index) => {
            if (index % Math.ceil(points.length / 4) === 0 || index === points.length - 1) {
              const date = new Date(point.date);
              const label = date.toLocaleDateString('sk-SK', {
                month: 'short',
                day: 'numeric',
              });
              return (
                <text
                  key={`x-label-${index}`}
                  x={point.x}
                  y={padding + chartHeight + 20}
                  textAnchor="middle"
                  className="text-xs"
                >
                  {label}
                </text>
              );
            }
            return null;
          })}
        </g>
      </svg>
    </div>
  );
}
