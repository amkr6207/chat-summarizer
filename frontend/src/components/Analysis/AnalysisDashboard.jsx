import { useEffect, useState } from 'react';
import { FiMessageSquare, FiTrendingUp, FiTag, FiCpu } from 'react-icons/fi';
import { analysisAPI } from '../../services/api';

const AnalysisDashboard = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            const response = await analysisAPI.getInsights();
            setInsights(response.data.data);
        } catch (error) {
            console.error('Error loading insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin text-primary-500">
                    <FiCpu size={32} />
                </div>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="card text-center">
                <p className="text-slate-600 dark:text-slate-400">No insights available yet</p>
            </div>
        );
    }

    const stats = [
        {
            icon: FiMessageSquare,
            label: 'Total Conversations',
            value: insights.statistics.totalConversations,
            color: 'text-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            icon: FiTrendingUp,
            label: 'Total Messages',
            value: insights.statistics.totalMessages,
            color: 'text-green-500',
            bg: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            icon: FiMessageSquare,
            label: 'Avg Messages/Conv',
            value: insights.statistics.avgMessagesPerConversation,
            color: 'text-purple-500',
            bg: 'bg-purple-100 dark:bg-purple-900/20',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="card hover:scale-105 transition-transform">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Top Tags */}
            {insights.topTags && insights.topTags.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FiTag className="text-primary-500" />
                        Top Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {insights.topTags.map((tagData, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                            >
                                {tagData.tag} ({tagData.count})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Provider Usage */}
            {insights.providerUsage && Object.keys(insights.providerUsage).length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FiCpu className="text-primary-500" />
                        AI Provider Usage
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(insights.providerUsage).map(([provider, count]) => (
                            <div key={provider} className="flex items-center justify-between">
                                <span className="capitalize font-medium">{provider}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-48 bg-slate-200 dark:bg-dark-border rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(count / insights.statistics.totalConversations) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                                        {count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {insights.recentActivity && insights.recentActivity.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {insights.recentActivity.map((conv) => (
                            <div
                                key={conv.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
                            >
                                <div>
                                    <p className="font-medium">{conv.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {conv.messageCount} messages
                                    </p>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisDashboard;
