import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Settings, LayoutGrid, LogOut } from 'lucide-react';
import AppLogo from './app-logo';

import { usePage } from '@inertiajs/react';
import { Map } from 'lucide-react';

export function getSidebarNavItems(role?: string): NavItem[] {
    if (role === 'admin') {
        return [
            {
                title: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Map Layout',
                href: '/admin/map_layout',
                icon: Map,
            },
        ];
    } else if (role === 'staff') {
        return [
            {
                title: 'Dashboard',
                href: '/staff/dashboard',
                icon: LayoutGrid,
            },
        ];
    }
    return [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];
}

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Settings',
    //     href: 'settings/profile',
    //     icon: Settings,
    // },
    // {
    //     title: 'Logout',
    //     href: 'logout',
    //     icon: LogOut,
    // },
];

export function AppSidebar() {
    const page = usePage();
    const role = page.props?.auth?.user?.role;
    const navItems = getSidebarNavItems(role);
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={navItems[0]?.href || '/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
