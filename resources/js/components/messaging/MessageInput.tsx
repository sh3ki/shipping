import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Paperclip, Send, Smile } from 'lucide-react';
import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export function MessageInput({
    onSendMessage,
    disabled = false,
    placeholder = 'Type a message...',
    className,
}: MessageInputProps) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={cn('border-t bg-background p-4', className)}>
            <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 rounded-full"
                    disabled={disabled}
                >
                    <Paperclip className="h-4 w-4" />
                </Button>

                <div className="flex-1 relative">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="pr-12"
                    />
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                        disabled={disabled}
                    >
                        <Smile className="h-4 w-4" />
                    </Button>
                </div>

                <Button 
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    size="sm"
                    className="h-10 w-10 rounded-full"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
