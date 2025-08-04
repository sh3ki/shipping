import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { User } from '@/types';
import { cn } from '@/lib/utils';
import { Users, MessageSquare, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NewConversationModalProps {
    open: boolean;
    onClose: () => void;
    onCreateDirectConversation: (userId: number) => void;
    onCreateGroupConversation: (name: string, description: string, userIds: number[]) => void;
    currentUser: User;
}

export function NewConversationModal({
    open,
    onClose,
    onCreateDirectConversation,
    onCreateGroupConversation,
    currentUser,
}: NewConversationModalProps) {
    const [activeTab, setActiveTab] = useState<'direct' | 'group'>('direct');
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/messages/users', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleUserSelect = (user: User) => {
        if (activeTab === 'direct') {
            onCreateDirectConversation(user.id);
            onClose();
        } else {
            setSelectedUsers(prev => 
                prev.find(u => u.id === user.id)
                    ? prev.filter(u => u.id !== user.id)
                    : [...prev, user]
            );
        }
    };

    const handleCreateGroup = () => {
        if (groupName.trim() && selectedUsers.length > 0) {
            onCreateGroupConversation(
                groupName.trim(),
                groupDescription.trim(),
                selectedUsers.map(u => u.id)
            );
            onClose();
            resetForm();
        }
    };

    const resetForm = () => {
        setActiveTab('direct');
        setSearchQuery('');
        setSelectedUsers([]);
        setGroupName('');
        setGroupDescription('');
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const removeSelectedUser = (userId: number) => {
        setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Start a New Conversation</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Tabs */}
                    <div className="flex rounded-lg bg-muted p-1">
                        <Button
                            variant={activeTab === 'direct' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('direct')}
                            className="flex-1"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Direct Message
                        </Button>
                        <Button
                            variant={activeTab === 'group' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('group')}
                            className="flex-1"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Group Chat
                        </Button>
                    </div>

                    {/* Group Chat Form */}
                    {activeTab === 'group' && (
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="groupName">Group Name</Label>
                                <Input
                                    id="groupName"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Enter group name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="groupDescription">Description (optional)</Label>
                                <Input
                                    id="groupDescription"
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    placeholder="Enter group description"
                                />
                            </div>

                            {/* Selected Users */}
                            {selectedUsers.length > 0 && (
                                <div>
                                    <Label>Selected Members ({selectedUsers.length})</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedUsers.map(user => (
                                            <div key={user.id} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                                                <span>{user.name}</span>
                                                <button
                                                    onClick={() => removeSelectedUser(user.id)}
                                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={activeTab === 'direct' ? 'Search for a user...' : 'Search for members to add...'}
                            className="pl-10"
                        />
                    </div>

                    {/* User List */}
                    <div className="max-h-64 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-4 text-muted-foreground">
                                Loading users...
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                No users found
                            </div>
                        ) : (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserSelect(user)}
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors',
                                        activeTab === 'group' && selectedUsers.find(u => u.id === user.id) && 'bg-blue-50 border border-blue-200'
                                    )}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gray-100 text-gray-600">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        {user.role && (
                                            <p className="text-xs text-blue-600 capitalize">{user.role}</p>
                                        )}
                                    </div>
                                    {activeTab === 'group' && selectedUsers.find(u => u.id === user.id) && (
                                        <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                                            <div className="h-2 w-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Action Buttons */}
                    {activeTab === 'group' && (
                        <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={handleClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCreateGroup}
                                disabled={!groupName.trim() || selectedUsers.length === 0}
                                className="flex-1"
                            >
                                Create Group
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
