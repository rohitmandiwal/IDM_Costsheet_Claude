import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Enter PR Number' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10"
        />
      </div>
      <Button
        onClick={handleSearch}
        className="bg-black hover:bg-gray-800 text-white"
      >
        Search
      </Button>
    </div>
  );
}
