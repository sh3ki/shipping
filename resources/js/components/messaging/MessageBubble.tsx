import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message, User } from '@/types';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    currentUser: User;
    isLastMessage?: boolean;
    showSeen?: boolean;
    seenByUsers?: User[];
}

export function MessageBubble({
    message,
    currentUser,
    isLastMessage = false,
    showSeen = false,
    seenByUsers = [],
}: MessageBubbleProps) {
    const isOwnMessage = message.user.id === currentUser.id;
    
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={cn(
            'flex gap-3 mb-4',
            isOwnMessage ? 'flex-row-reverse' : 'flex-row'
        )}>
            {!isOwnMessage && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        {getInitials(message.user.name)}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={cn(
                'flex flex-col gap-1 max-w-[75%]',
                isOwnMessage ? 'items-end' : 'items-start'
            )}>
                {!isOwnMessage && (
                    <span className="text-xs text-muted-foreground font-medium">
                        {message.user.name}
                    </span>
                )}

                <div className={cn(
                    'relative px-4 py-2 rounded-2xl text-sm',
                    isOwnMessage 
                        ? 'bg-blue-600 text-white rounded-br-md' 
                        : 'bg-muted text-foreground rounded-bl-md'
                )}>
                    <div className="break-words whitespace-pre-wrap">
                        {message.content}
                    </div>
                    
                    {message.edited_at && (
                        <div className={cn(
                            'text-xs mt-1 opacity-70',
                            isOwnMessage ? 'text-blue-100' : 'text-muted-foreground'
                        )}>
                            (edited)
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                    </span>

                    {isOwnMessage && (
                        <div className="flex items-center">
                            {seenByUsers.length > 0 ? (
                                <CheckCheck className="h-3 w-3 text-blue-600" />
                            ) : (
                                <Check className="h-3 w-3 text-muted-foreground" />
                            )}
                        </div>
                    )}
                </div>

                {isOwnMessage && showSeen && isLastMessage && seenByUsers.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">
                            Seen by {seenByUsers.length === 1 
                                ? seenByUsers[0].name 
                                : `${seenByUsers[0].name} and ${seenByUsers.length - 1} other${seenByUsers.length > 2 ? 's' : ''}`
                            }
                        </span>
                    </div>
                )}
            </div>

            {isOwnMessage && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {getInitials(currentUser.name)}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
