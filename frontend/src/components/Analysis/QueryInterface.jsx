import { useState } from 'react';
import { FiSearch, FiLoader } from 'react-icons/fi';
import { analysisAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const QueryInterface = () => {
    const [query, setQuery] = useState('');
    const [provider, setProvider] = useState('gemini'); // Default to gemini since it's working
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setAnswer(null);

        try {
            const response = await analysisAPI.queryHistory({
                query,
                provider: provider || user?.preferences?.defaultAIProvider || 'gemini',
            });

            setAnswer(response.data.data);
        } catch (error) {
            console.error('Query error:', error);
            setError(error.response?.data?.message || 'Failed to query history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="card">
                <h2 className="text-2xl font-bold mb-4 gradient-text">Query Your Chat History</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Ask questions about your past conversations and get intelligent answers
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g., What did we discuss about machine learning?"
                                className="input pl-12 text-lg"
                                disabled={loading}
                            />
                        </div>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="input w-32"
                            disabled={loading}
                        >
                            <option value="openai">OpenAI</option>
                            <option value="claude">Claude</option>
                            <option value="gemini">Gemini</option>
                            <option value="lmstudio">LM Studio</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={!query.trim() || loading}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FiLoader className="animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <FiSearch />
                                Search History
                            </>
                        )}
                    </button>
                </form>
            </div>

            {error && (
                <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {answer && (
                <div className="card animate-in">
                    <h3 className="text-lg font-semibold mb-3">Answer</h3>
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{answer.answer}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Analyzed {answer.conversationsAnalyzed} conversation{answer.conversationsAnalyzed !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueryInterface;
