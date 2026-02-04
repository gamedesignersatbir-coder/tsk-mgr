import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface SearchResult {
    id: string;
    title: string;
    status: string;
    priority: string;
    similarity: number;
}

export function SmartSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setSearching(true);
        setError(null);
        setHasSearched(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error: fnError } = await supabase.functions.invoke('smart-search', {
                body: { query: query.trim(), userId: user?.id },
            });

            if (fnError) throw fnError;

            // Filter results with similarity > 0.3 (text-embedding-3-small model)
            const filtered = (data.results || []).filter((r: SearchResult) => r.similarity > 0.3);
            setResults(filtered);
        } catch (err: any) {
            setError(err.message || 'Search failed');
            setResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const statusColors: Record<string, string> = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'In-progress': 'bg-blue-100 text-blue-800',
        'Done': 'bg-green-100 text-green-800',
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 md:p-6 mb-6 border border-blue-100">
            {/* Search Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">search</span>
                <h3 className="text-lg font-bold text-slate-800 font-display">Smart Search</h3>
            </div>

            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search tasks semantically..."
                    className="flex-1 px-4 py-3 rounded-lg border border-blue-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button
                    onClick={handleSearch}
                    disabled={searching || !query.trim()}
                    className={cn(
                        "px-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2",
                        searching
                            ? "bg-primary/70 cursor-wait"
                            : "bg-primary hover:bg-blue-600 active:scale-95",
                        !query.trim() && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {searching ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                            Searching...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">search</span>
                            Search
                        </>
                    )}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-3 text-red-500 text-sm">{error}</p>
            )}

            {/* Results */}
            {hasSearched && !searching && (
                <div className="mt-4">
                    {results.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-sm text-slate-500 mb-2">
                                Found {results.length} similar task{results.length !== 1 ? 's' : ''}:
                            </p>
                            {results.map((result) => (
                                <div
                                    key={result.id}
                                    className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                                            statusColors[result.status] || 'bg-slate-100 text-slate-600'
                                        )}>
                                            {result.status}
                                        </span>
                                        <p className="text-slate-800 font-medium truncate">{result.title}</p>
                                    </div>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                        {Math.round(result.similarity * 100)}% match
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">
                            No similar tasks found. Try a different search term.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
