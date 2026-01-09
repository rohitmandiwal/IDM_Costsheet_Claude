import { Button } from '../ui/Button';

interface FilterButtonsProps {
  activeFilter: 'All' | 'Technical' | 'Non-Technical';
  onFilterChange: (filter: 'All' | 'Technical' | 'Non-Technical') => void;
}

export function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  const filters: Array<'All' | 'Technical' | 'Non-Technical'> = ['All', 'Technical', 'Non-Technical'];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Filter by Type:</span>
      {filters.map((filter) => (
        <Button
          key={filter}
          variant={activeFilter === filter ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter)}
          className={activeFilter === filter ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}
