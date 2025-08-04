import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Conversation, User } from '@/types';
import { cn } from '@/lib/utils';
import { MessageSquareMore, MessageSquarePlus, Users } from 'lucide-react';

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversation?: Conversation;
    onSelectConversation: (conversation: Conversation) => void;
    onNewConversation: () => void;
    currentUser: User;
    className?: string;
}

export function ConversationList({
    conversations,
    selectedConversation,
    onSelectConversation,
    onNewConversation,
    currentUser,
    className,
}: ConversationListProps) {
    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getLastMessagePreview = (conversation: Conversation) => {
        const lastMessage = conversation.latest_message?.[0];
        if (!lastMessage) return 'No messages yet';
        
        const isFromCurrentUser = lastMessage.user.id === currentUser.id;
        const prefix = isFromCurrentUser ? 'You: ' : `${lastMessage.user.name}: `;
        
        return prefix + (lastMessage.content.length > 50 
            ? lastMessage.content.substring(0, 50) + '...'
            : lastMessage.content);
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Messages</h2>
                    <Button onClick={onNewConversation} size="sm">
                        <MessageSquarePlus className="h-4 w-4 mr-2" />
                        New
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <MessageSquareMore className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No conversations yet</p>
                            <p className="text-sm">Start a new conversation to get started</p>
                        </div>
                    ) : (
                        conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation)}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors',
                                    selectedConversation?.id === conversation.id && 'bg-muted'
                                )}
                            >
                                <div className="relative">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className={cn(
                                            conversation.type === 'group' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                        )}>
                                            {conversation.type === 'group' ? (
                                                <Users className="h-6 w-6" />
                                            ) : (
                                                getInitials(conversation.other_user?.name || conversation.display_name || 'U')
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    {conversation.unread_count && conversation.unread_count > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium text-sm truncate">
                                            {conversation.display_name}
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTime(conversation.last_message_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {getLastMessagePreview(conversation)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
