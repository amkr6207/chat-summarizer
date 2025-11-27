import { createContext, useContext, useState, useCallback } from 'react';
import { chatAPI } from '../services/api';

const ChatContext = createContext(null);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const loadConversations = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const response = await chatAPI.getConversations(params);
            setConversations(response.data.data.conversations);
            return response.data.data;
        } catch (error) {
            console.error('Error loading conversations:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const loadConversation = useCallback(async (id) => {
        try {
            setLoading(true);
            const response = await chatAPI.getConversation(id);
            setCurrentConversation(response.data.data.conversation);
            return response.data.data.conversation;
        } catch (error) {
            console.error('Error loading conversation:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const sendMessage = useCallback(async (message, conversationId = null, provider = null, model = null) => {
        try {
            setSending(true);
            const response = await chatAPI.sendMessage({
                message,
                conversationId,
                provider,
                model,
            });

            const { conversation } = response.data.data;
            setCurrentConversation(conversation);

            // Update conversations list
            setConversations(prev => {
                const exists = prev.find(c => c._id === conversation.id);
                if (exists) {
                    return prev.map(c => c._id === conversation.id ? { ...c, lastMessageAt: new Date() } : c);
                } else {
                    return [{ _id: conversation.id, title: conversation.title, lastMessageAt: new Date() }, ...prev];
                }
            });

            return response.data.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        } finally {
            setSending(false);
        }
    }, []);

    const updateConversation = useCallback(async (id, data) => {
        try {
            const response = await chatAPI.updateConversation(id, data);
            const updated = response.data.data.conversation;

            setConversations(prev =>
                prev.map(c => c._id === id ? updated : c)
            );

            if (currentConversation?._id === id) {
                setCurrentConversation(updated);
            }

            return updated;
        } catch (error) {
            console.error('Error updating conversation:', error);
            throw error;
        }
    }, [currentConversation]);

    const deleteConversation = useCallback(async (id) => {
        try {
            await chatAPI.deleteConversation(id);
            setConversations(prev => prev.filter(c => c._id !== id));

            if (currentConversation?._id === id) {
                setCurrentConversation(null);
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    }, [currentConversation]);

    const createNewConversation = useCallback(() => {
        setCurrentConversation(null);
    }, []);

    const value = {
        conversations,
        currentConversation,
        loading,
        sending,
        loadConversations,
        loadConversation,
        sendMessage,
        updateConversation,
        deleteConversation,
        createNewConversation,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
