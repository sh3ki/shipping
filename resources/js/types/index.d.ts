import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Message {
    id: number;
    conversation_id: number;
    user_id: number;
    content: string;
    type: 'text' | 'image' | 'file';
    metadata?: Record<string, unknown>;
    edited_at?: string;
    created_at: string;
    updated_at: string;
    user: User;
    seen_by?: User[];
}

export interface Conversation {
    id: number;
    type: 'direct' | 'group';
    name?: string;
    description?: string;
    settings?: Record<string, unknown>;
    last_message_at?: string;
    created_at: string;
    updated_at: string;
    users: User[];
    messages?: Message[];
    latest_message?: Message[];
    unread_count?: number;
    display_name?: string;
    other_user?: User;
}

export interface ConversationUser {
    conversation_id: number;
    user_id: number;
    joined_at: string;
    last_read_at?: string;
    is_admin: boolean;
    settings?: Record<string, unknown>;
}
