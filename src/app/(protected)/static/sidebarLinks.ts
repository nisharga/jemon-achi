import { routes } from '@/routes';

export interface ISidebarLink {
    title: string;
    url: string;
}

export interface ISidebarGroup {
    title: string;
    /** Stable key for the group (never shown to users). */
    label: string;
    items: ISidebarLink[];
}

/** Dashboard navigation. Add a group per domain as features are ported. */
export const SIDEBAR_LINKS: ISidebarGroup[] = [
    {
        title: 'Dashboard',
        label: 'dashboard',
        items: [{ title: 'Overview', url: routes.admin.base }]
    },
    {
        title: 'Website',
        label: 'website',
        items: [
            { title: 'Home page', url: routes.base },
            { title: 'Contact page', url: routes.contactUs }
        ]
    }
];
