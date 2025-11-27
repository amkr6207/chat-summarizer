import Navbar from '../components/Layout/Navbar';
import AnalysisDashboard from '../components/Analysis/AnalysisDashboard';
import QueryInterface from '../components/Analysis/QueryInterface';

const Analysis = () => {
    return (
        <div className="h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto p-6 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text mb-2">Analytics & Insights</h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Explore your conversation history and get intelligent insights
                        </p>
                    </div>

                    <QueryInterface />

                    <AnalysisDashboard />
                </div>
            </div>
        </div>
    );
};

export default Analysis;
