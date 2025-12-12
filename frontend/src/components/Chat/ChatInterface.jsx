import { useState, useRef, useEffect } from 'react';
import { FiSend, FiLoader, FiAlertCircle, FiX } from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';

const ChatInterface = () => {
    const [message, setMessage] = useState('');
    const [provider, setProvider] = useState('');
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { currentConversation, sendMessage, sending } = useChat();
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentConversation?.messages]);

    useEffect(() => {
        if (user?.preferences?.defaultAIProvider) {
            setProvider(user.preferences.defaultAIProvider);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || sending) return;

        const messageText = message;
        setMessage('');
        setError(null); // Clear previous errors

        try {
            await sendMessage(
                messageText,
                currentConversation?._id || null,
                provider || user?.preferences?.defaultAIProvider
            );
        } catch (error) {
            console.error('Error sending message:', error);

            // Extract error message from response
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to send message. Please try again.';

            setError(errorMessage);
            setMessage(messageText); // Restore message on error
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-4">
                    <div className="flex items-start gap-3">
                        <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                                Error sending message
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                            aria-label="Dismiss error"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Chat Header */}
            <div className="glass border-b border-slate-200 dark:border-dark-border px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {currentConversation?.title || 'New Conversation'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {currentConversation?.messages?.length || 0} messages
                        </p>
                    </div>

                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="input w-auto text-sm"
                    >
                        <option value="openai">OpenAI</option>
                        <option value="claude">Claude</option>
                        <option value="gemini">Gemini</option>
                        <option value="lmstudio">LM Studio</option>
                    </select>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {!currentConversation || currentConversation.messages?.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-2xl font-semibold mb-2 gradient-text">Start a Conversation</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Send a message to begin chatting with AI
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {currentConversation.messages.map((msg, index) => (
                            <MessageBubble key={index} message={msg} />
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="message-assistant">
                                    <div className="loading-dots flex space-x-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="glass border-t border-slate-200 dark:border-dark-border p-6">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="input flex-1"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || sending}
                        className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {sending ? (
                            <>
                                <FiLoader className="animate-spin" />
                                Sending
                            </>
                        ) : (
                            <>
                                <FiSend />
                                Send
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
