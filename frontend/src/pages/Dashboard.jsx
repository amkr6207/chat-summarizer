import Navbar from '../components/Layout/Navbar';
import ConversationList from '../components/Chat/ConversationList';
import ChatInterface from '../components/Chat/ChatInterface';

const Dashboard = () => {
    return (
        <div className="h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 flex-shrink-0">
                    <ConversationList />
                </div>

                {/* Main Chat Area */}
                <div className="flex-1">
                    <ChatInterface />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
