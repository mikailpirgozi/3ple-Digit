interface PieDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimplePieChartProps {
  data: PieDataPoint[];
  size?: number;
  className?: string;
  formatValue?: (value: number) => string;
}

const defaultColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(220, 70%, 50%)',
  'hsl(280, 70%, 50%)',
  'hsl(340, 70%, 50%)',
  'hsl(40, 70%, 50%)',
  'hsl(120, 70%, 50%)',
];

export function SimplePieChart({
  data,
  size = 200,
  className = '',
  formatValue = value => value.toString(),
}: SimplePieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-muted-foreground">Žiadne dáta</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-muted-foreground">Žiadne dáta</p>
      </div>
    );
  }

  const radius = size / 2 - 20;
  const center = size / 2;

  let currentAngle = -90; // Start from top

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    currentAngle += angle;

    return {
      ...item,
      pathData,
      percentage,
      color: item.color ?? defaultColors[index % defaultColors.length],
      startAngle,
      endAngle,
    };
  });

  return (
    <div className={className}>
      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <svg width={size} height={size}>
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer drop-shadow-sm"
              title={`${slice.label}: ${formatValue(slice.value)} (${slice.percentage.toFixed(1)}%)`}
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{slice.label}</span>
                <span className="text-xs text-muted-foreground">
                  {formatValue(slice.value)} ({slice.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
