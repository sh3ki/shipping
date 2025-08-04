import echo from '@/lib/echo';
import type { Conversation, Message, User } from '@/types';
import { useEffect, useState } from 'react';

interface UseMessagesProps {
    conversations: Conversation[];
}

interface MessageEvent {
    message: Message;
}

interface SeenEvent {
    conversation_id: number;
    user_id: number;
    last_read_at: string;
    user: User;
}

export function useMessages({ conversations }: UseMessagesProps) {
    const [messages, setMessages] = useState<Record<number, Message[]>>({});
    const [conversationSeenStatus, setConversationSeenStatus] = useState<Record<number, Record<number, string>>>({});

    useEffect(() => {
        // Subscribe to all conversation channels
        const channels: Array<{ name: string; leave: () => void }> = [];

        conversations.forEach((conversation) => {
            const channel = echo.channel(`conversation.${conversation.id}`);
            
            channel.listen('MessageSent', (e: MessageEvent) => {
                setMessages(prev => ({
                    ...prev,
                    [conversation.id]: [...(prev[conversation.id] || []), e.message]
                }));
            });

            channel.listen('MessageSeen', (e: SeenEvent) => {
                setConversationSeenStatus(prev => ({
                    ...prev,
                    [e.conversation_id]: {
                        ...prev[e.conversation_id],
                        [e.user_id]: e.last_read_at
                    }
                }));
            });

            channels.push({ name: `conversation.${conversation.id}`, leave: () => echo.leaveChannel(`conversation.${conversation.id}`) });
        });

        // Cleanup function
        return () => {
            channels.forEach(channel => {
                channel.leave();
            });
        };
    }, [conversations]);

    const sendMessage = async (conversationId: number, content: string, type: string = 'text') => {
        try {
            const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ content, type }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const markAsSeen = async (conversationId: number) => {
        try {
            const response = await fetch(`/api/messages/conversations/${conversationId}/seen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to mark messages as seen');
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking messages as seen:', error);
            throw error;
        }
    };

    const loadConversationMessages = async (conversationId: number) => {
        try {
            const response = await fetch(`/api/messages/conversations/${conversationId}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load conversation messages');
            }

            const data = await response.json();
            setMessages(prev => ({
                ...prev,
                [conversationId]: data.messages
            }));

            return data;
        } catch (error) {
            console.error('Error loading conversation messages:', error);
            throw error;
        }
    };

    return {
        messages,
        conversationSeenStatus,
        sendMessage,
        markAsSeen,
        loadConversationMessages,
    };
}
