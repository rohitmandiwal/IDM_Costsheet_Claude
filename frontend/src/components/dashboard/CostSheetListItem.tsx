import { Badge } from '../ui/Badge';
import type { CostSheet } from '../../types/dashboard.types';

interface CostSheetListItemProps {
  costSheet: CostSheet;
  onItemClick?: (costSheetNumber: string) => void;
  showProgress?: boolean;
}

export function CostSheetListItem({
  costSheet,
  onItemClick,
  showProgress = false,
}: CostSheetListItemProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1d ago';
    return `${diffInDays}d ago`;
  };

  const getStatusVariant = (status: string): 'pending' | 'approved' | 'rejected' | 'default' => {
    if (status.toLowerCase().includes('pending')) return 'pending';
    if (status.toLowerCase().includes('approved')) return 'approved';
    if (status.toLowerCase().includes('rejected')) return 'rejected';
    return 'default';
  };

  return (
    <div
      className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${
        onItemClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onItemClick?.(costSheet.costSheetNumber)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{costSheet.costSheetNumber}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{costSheet.prNumber}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {!showProgress && <span className="text-sm text-gray-600">{formatAmount(costSheet.amount)}</span>}
            <Badge variant={costSheet.type === 'Technical' ? 'tech' : 'comm'}>
              {costSheet.type === 'Technical' ? 'TECH' : 'COMM'}
            </Badge>
            {!showProgress && (
              <Badge variant={getStatusVariant(costSheet.status)}>
                {costSheet.status}
              </Badge>
            )}
          </div>
          {showProgress && costSheet.progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Progress</span>
                <span className="text-xs font-medium text-gray-900">{costSheet.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${costSheet.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 ml-4">{getTimeAgo(costSheet.createdAt)}</div>
      </div>
    </div>
  );
}
