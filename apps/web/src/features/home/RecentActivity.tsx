import { useSnapshots } from '@/features/snapshots/hooks';

interface ActivityItem {
  id: string;
  type: 'snapshot' | 'asset' | 'investor' | 'bank';
  title: string;
  description: string;
  date: string;
  icon: string;
  amount?: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Pred chvíľou';
  } else if (diffInHours < 24) {
    return `Pred ${diffInHours} h`;
  } else if (diffInHours < 48) {
    return 'Včera';
  } else {
    return date.toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

export function RecentActivity() {
  const { data: snapshotsData, isLoading } = useSnapshots({ limit: 5, page: 1 });

  // Convert snapshots to activity items
  const activities: ActivityItem[] = [];

  if (snapshotsData?.snapshots) {
    snapshotsData.snapshots.forEach(snapshot => {
      activities.push({
        id: `snapshot-${snapshot.id}`,
        type: 'snapshot',
        title: 'Snapshot vytvorený',
        description: `NAV: ${formatCurrency(snapshot.nav)}`,
        date: snapshot.createdAt,
        icon: '📈',
        amount: snapshot.nav,
      });
    });
  }

  // Sort activities by date (newest first)
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Žiadne nedávne aktivity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 5).map(activity => (
        <div
          key={activity.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted flex-shrink-0">
            <span className="text-sm">{activity.icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-foreground truncate">{activity.title}</h4>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  activity.type === 'snapshot'
                    ? 'bg-blue-100 text-blue-800'
                    : activity.type === 'asset'
                      ? 'bg-green-100 text-green-800'
                      : activity.type === 'investor'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {activity.type}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
