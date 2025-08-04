import { useMessages } from '@/hooks/useMessages';
import { ConversationList } from './ConversationList';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { NewConversationModal } from './NewConversationModal';
import type { Conversation, Message, User } from '@/types';
import { cn } from '@/lib/utils';
import { MessageSquareMore } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface MessagingSystemProps {
    currentUser: User;
    className?: string;
}

export function MessagingSystem({ currentUser, className }: MessagingSystemProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    const [conversationMessages, setConversationMessages] = useState<Record<number, Message[]>>({});
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [showMobileConversation, setShowMobileConversation] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, markAsSeen, loadConversationMessages } = useMessages({
        conversations
    });

    // Load conversations on component mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Update conversation messages when messages from hook change
    useEffect(() => {
        setConversationMessages(prev => ({
            ...prev,
            ...messages
        }));
    }, [messages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [conversationMessages, selectedConversation]);

    // Mark messages as seen when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            markAsSeen(selectedConversation.id);
        }
    }, [selectedConversation, markAsSeen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/messages/conversations', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load conversations');
            }

            const data = await response.json();
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setShowMobileConversation(true);
        
        // Load messages for this conversation if not already loaded
        if (!conversationMessages[conversation.id]) {
            try {
                await loadConversationMessages(conversation.id);
            } catch (error) {
                console.error('Error loading conversation messages:', error);
            }
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!selectedConversation || sendingMessage) return;

        try {
            setSendingMessage(true);
            await sendMessage(selectedConversation.id, content);
            
            // Update conversation's last message time in the list
            setConversations(prev => prev.map(conv => 
                conv.id === selectedConversation.id
                    ? { ...conv, last_message_at: new Date().toISOString() }
                    : conv
            ));
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleCreateDirectConversation = async (userId: number) => {
        try {
            const response = await fetch('/api/messages/conversations/direct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ user_id: userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to create direct conversation');
            }

            const data = await response.json();
            const newConversation = data.conversation;
            
            // Set display name for direct conversation
            const otherUser = newConversation.users.find((u: User) => u.id !== currentUser.id);
            newConversation.display_name = otherUser?.name || 'Unknown User';
            newConversation.other_user = otherUser;

            // Add to conversations list if not already exists
            setConversations(prev => {
                const exists = prev.find(conv => conv.id === newConversation.id);
                if (exists) {
                    return prev;
                }
                return [newConversation, ...prev];
            });

            setSelectedConversation(newConversation);
            setShowMobileConversation(true);
        } catch (error) {
            console.error('Error creating direct conversation:', error);
        }
    };

    const handleCreateGroupConversation = async (name: string, description: string, userIds: number[]) => {
        try {
            const response = await fetch('/api/messages/conversations/group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ name, description, user_ids: userIds }),
            });

            if (!response.ok) {
                throw new Error('Failed to create group conversation');
            }

            const data = await response.json();
            const newConversation = data.conversation;
            newConversation.display_name = name;

            // Add to conversations list
            setConversations(prev => [newConversation, ...prev]);
            setSelectedConversation(newConversation);
            setShowMobileConversation(true);
        } catch (error) {
            console.error('Error creating group conversation:', error);
        }
    };

    const handleBackToList = () => {
        setShowMobileConversation(false);
        setSelectedConversation(null);
    };

    if (loading) {
        return (
            <div className={cn('flex h-full items-center justify-center', className)}>
                <div className="text-center">
                    <MessageSquareMore className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Loading conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex h-full bg-background', className)}>
            {/* Conversation List - Hidden on mobile when conversation is selected */}
            <div className={cn(
                'w-full md:w-80 border-r flex-shrink-0',
                showMobileConversation && 'hidden md:block'
            )}>
                <ConversationList
                    conversations={conversations}
                    selectedConversation={selectedConversation || undefined}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={() => setShowNewConversationModal(true)}
                    currentUser={currentUser}
                />
            </div>

            {/* Chat Area */}
            <div className={cn(
                'flex-1 flex flex-col',
                !showMobileConversation && 'hidden md:flex'
            )}>
                {selectedConversation ? (
                    <>
                        <ChatHeader
                            conversation={selectedConversation}
                            onBack={handleBackToList}
                            showBackButton={true}
                        />

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-1">
                                {conversationMessages[selectedConversation.id]?.map((message, index) => {
                                    const isLastMessage = index === conversationMessages[selectedConversation.id].length - 1;
                                    const seenByUsers = message.seen_by || [];
                                    
                                    return (
                                        <MessageBubble
                                            key={message.id}
                                            message={message}
                                            currentUser={currentUser}
                                            isLastMessage={isLastMessage}
                                            showSeen={selectedConversation.type === 'group'}
                                            seenByUsers={seenByUsers}
                                        />
                                    );
                                }) || (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <div className="text-center">
                                            <MessageSquareMore className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No messages yet</p>
                                            <p className="text-sm">Send a message to start the conversation</p>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <MessageInput
                            onSendMessage={handleSendMessage}
                            disabled={sendingMessage}
                            placeholder="Type a message..."
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <MessageSquareMore className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                            <p>Choose a conversation from the list to start messaging</p>
                        </div>
                    </div>
                )}
            </div>

            <NewConversationModal
                open={showNewConversationModal}
                onClose={() => setShowNewConversationModal(false)}
                onCreateDirectConversation={handleCreateDirectConversation}
                onCreateGroupConversation={handleCreateGroupConversation}
                currentUser={currentUser}
            />
        </div>
    );
}
