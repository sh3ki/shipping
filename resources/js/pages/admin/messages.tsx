import AppLayout from '@/layouts/app-layout';
import { MessagingSystem } from '@/components/messaging/MessagingSystem';
import type { BreadcrumbItem, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Messages',
        href: '/admin/messages',
    },
];

interface PageProps extends Record<string, unknown> {
    auth: {
        user: User;
    };
}

export default function AdminMessages() {
    const { auth } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Messages" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-hidden">
                <div className="bg-background rounded-lg shadow flex-1 overflow-hidden">
                    <MessagingSystem currentUser={auth.user} className="h-full" />
                </div>
            </div>
        </AppLayout>
    );
}
