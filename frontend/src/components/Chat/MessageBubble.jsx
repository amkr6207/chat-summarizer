import { formatDistanceToNow } from 'date-fns';
import { FiUser, FiCpu } from 'react-icons/fi';

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in`}>
            <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                        : 'bg-slate-200 dark:bg-dark-card text-slate-700 dark:text-slate-300'
                    }`}>
                    {isUser ? <FiUser size={16} /> : <FiCpu size={16} />}
                </div>

                {/* Message Content */}
                <div className="flex flex-col gap-1">
                    <div className={isUser ? 'message-user' : 'message-assistant'}>
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>

                    {/* Timestamp */}
                    <span className={`text-xs text-slate-500 dark:text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
