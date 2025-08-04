import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/types';
import { cn } from '@/lib/utils';
import { MoreVertical, Phone, Video, Users, ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
    conversation: Conversation;
    onBack?: () => void;
    showBackButton?: boolean;
    className?: string;
}

export function ChatHeader({
    conversation,
    onBack,
    showBackButton = false,
    className,
}: ChatHeaderProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getOnlineStatus = () => {
        // This could be enhanced with real online status
        return 'Last seen recently';
    };

    return (
        <div className={cn('border-b bg-background p-4', className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {showBackButton && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onBack}
                            className="h-8 w-8 rounded-full lg:hidden"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}

                    <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(
                            conversation.type === 'group' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        )}>
                            {conversation.type === 'group' ? (
                                <Users className="h-5 w-5" />
                            ) : (
                                getInitials(conversation.other_user?.name || conversation.display_name || 'U')
                            )}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                            {conversation.display_name}
                        </h3>
                        {conversation.type === 'group' ? (
                            <p className="text-xs text-muted-foreground">
                                {conversation.users.length} member{conversation.users.length !== 1 ? 's' : ''}
                                {conversation.description && ` • ${conversation.description}`}
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                {getOnlineStatus()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                        <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
