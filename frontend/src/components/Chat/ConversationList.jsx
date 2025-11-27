import { useEffect, useState } from 'react';
import { FiMessageSquare, FiPlus, FiSearch, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = () => {
    const { conversations, loadConversations, loadConversation, deleteConversation, createNewConversation, currentConversation } = useChat();
    const [search, setSearch] = useState('');
    const [filteredConversations, setFilteredConversations] = useState([]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        if (search) {
            setFilteredConversations(
                conversations.filter(conv =>
                    conv.title?.toLowerCase().includes(search.toLowerCase())
                )
            );
        } else {
            setFilteredConversations(conversations);
        }
    }, [search, conversations]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this conversation?')) {
            try {
                await deleteConversation(id);
            } catch (error) {
                console.error('Error deleting conversation:', error);
            }
        }
    };

    return (
        <div className="h-full flex flex-col glass border-r border-slate-200 dark:border-dark-border">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-dark-border">
                <button
                    onClick={createNewConversation}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    <FiPlus />
                    New Chat
                </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-200 dark:border-dark-border">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search conversations..."
                        className="input pl-10 text-sm"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                        <FiMessageSquare className="mx-auto mb-2" size={32} />
                        <p className="text-sm">No conversations yet</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv._id}
                                onClick={() => loadConversation(conv._id)}
                                className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${currentConversation?._id === conv._id
                                        ? 'bg-primary-100 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                                        : 'hover:bg-slate-100 dark:hover:bg-dark-card'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate mb-1">
                                            {conv.title || 'New Conversation'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {conv.lastMessageAt && formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => handleDelete(e, conv._id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
                                    >
                                        <FiTrash2 size={14} className="text-red-600 dark:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
