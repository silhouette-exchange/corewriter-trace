'use client';

interface UnifiedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export function UnifiedSearchBar({
  value,
  onChange,
  onSearch,
  loading,
}: UnifiedSearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      onSearch();
    }
  };

  return (
    <div className="form-group">
      <label htmlFor="search">Search</label>
      <div className="input-button-group">
        <input
          id="search"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter transaction hash or account address..."
          className="text-input"
          disabled={loading}
        />
        <button
          onClick={onSearch}
          disabled={loading || !value.trim()}
          className="load-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
}

