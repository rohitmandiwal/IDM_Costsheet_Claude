import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { cn } from '../../lib/cn';

interface MetricsCardProps {
  title: string;
  subtitle?: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function MetricsCard({
  title,
  subtitle,
  count,
  icon: Icon,
  iconColor = 'text-blue-600',
  action,
  children,
}: MetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg bg-gray-100', iconColor)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {subtitle && <CardDescription className="text-sm mt-1">{subtitle}</CardDescription>}
            </div>
          </div>
          {action && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                {count}
              </div>
              {action}
            </div>
          )}
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
