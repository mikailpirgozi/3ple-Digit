import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { getAssetTypeIcon, getFileIcon } from './icons';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

// Currency Formatter
export function formatCurrency(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Date Formatter
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Date(date).toLocaleDateString('sk-SK', { ...defaultOptions, ...options });
}

// File Size Formatter
export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Percentage Formatter
export function formatPercentage(value: number, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

// File Type Badge
interface FileTypeBadgeProps {
  mimeType: string | null | undefined;
  className?: string;
}

export function FileTypeBadge({ mimeType, className }: FileTypeBadgeProps) {
  const Icon = getFileIcon(mimeType);
  const type = mimeType?.split('/')[0] ?? 'unknown';

  return (
    <Badge variant="secondary" className={cn('flex items-center gap-1', className)}>
      <Icon className="h-3 w-3" />
      {type.toUpperCase()}
    </Badge>
  );
}

// Asset Type Badge
interface AssetTypeBadgeProps {
  type: string;
  className?: string;
}

export function AssetTypeBadge({ type, className }: AssetTypeBadgeProps) {
  const Icon = getAssetTypeIcon(type);

  return (
    <Badge variant="outline" className={cn('flex items-center gap-1', className)}>
      <Icon className="h-3 w-3" />
      {type}
    </Badge>
  );
}

// Status Badge
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'success';
  className?: string;
}

const statusConfig = {
  active: { variant: 'default' as const, label: 'Aktívny' },
  inactive: { variant: 'secondary' as const, label: 'Neaktívny' },
  pending: { variant: 'outline' as const, label: 'Čaká' },
  completed: { variant: 'default' as const, label: 'Dokončené' },
  failed: { variant: 'destructive' as const, label: 'Zlyhalo' },
  success: { variant: 'default' as const, label: 'Úspech' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

// Trend Indicator
interface TrendIndicatorProps {
  value: number;
  label?: string;
  className?: string;
}

export function TrendIndicator({ value, label, className }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span
        className={cn(
          'text-sm font-medium',
          isPositive ? 'text-green-600' : isNeutral ? 'text-muted-foreground' : 'text-red-600'
        )}
      >
        {isPositive ? '+' : ''}
        {formatPercentage(value)}
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

// Metric Card
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && <TrendIndicator value={trend.value} label={trend.label} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Data Table Cell
interface DataTableCellProps {
  value: string | number | Date;
  type?: 'text' | 'currency' | 'date' | 'percentage' | 'file-size';
  className?: string;
}

export function DataTableCell({ value, type = 'text', className }: DataTableCellProps) {
  const formatValue = () => {
    switch (type) {
      case 'currency':
        return formatCurrency(Number(value));
      case 'date':
        return formatDate(value as Date);
      case 'percentage':
        return formatPercentage(Number(value));
      case 'file-size':
        return formatFileSize(Number(value));
      default:
        return String(value);
    }
  };

  return <span className={cn('text-sm', className)}>{formatValue()}</span>;
}

// Action Button Group
interface ActionButtonGroupProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
    icon?: LucideIcon;
  }>;
  className?: string;
}

export function ActionButtonGroup({ actions, className }: ActionButtonGroupProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant={action.variant ?? 'outline'}
            size="sm"
            onClick={action.onClick}
          >
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
