'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react';
import { Container } from '@/shop/components/common/container';
import { Skeleton } from '@/shop/components/ui/skeleton';
import { useUser } from '@/shop/hooks/use-user';
import { handleLogout } from '@/shop/lib/logout';
import { cn } from '@/shop/lib/utils';
import { getInitials, hasRealName } from '../_lib/format';

const MENU = [
    { label: 'Overview', href: '/profile', icon: LayoutDashboard },
    { label: 'My orders', href: '/profile/orders', icon: Package },
    { label: 'Account details', href: '/profile/settings', icon: UserRound }
];

/** "/profile/orders/123" belongs to the "My orders" menu item. */
const isActive = (pathname: string, href: string) =>
    href === '/profile'
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`);

/**
 * The frame around every dashboard page: who is logged in, the menu, and a
 * logout button. A side column on large screens, a row of tabs on phones.
 */
export default function DashboardShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, isLoading } = useUser();

    const name = hasRealName(user?.full_name) ? user!.full_name : 'Welcome!';

    return (
        <Container className='py-6 lg:py-10'>
            <div className='grid gap-6 lg:grid-cols-[260px_1fr]'>
                <aside className='space-y-4 lg:sticky lg:top-28 lg:self-start'>
                    {/* Who is logged in */}
                    <div className='flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm'>
                        {isLoading ? (
                            <>
                                <Skeleton className='size-12 rounded-full' />
                                <div className='flex-1 space-y-2'>
                                    <Skeleton className='h-4 w-28' />
                                    <Skeleton className='h-3 w-20' />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary'>
                                    {hasRealName(user?.full_name) ? (
                                        getInitials(user!.full_name)
                                    ) : (
                                        <UserRound className='size-6' />
                                    )}
                                </div>
                                <div className='min-w-0'>
                                    <p className='truncate font-medium text-gray-900'>
                                        {name}
                                    </p>
                                    <p className='text-sm text-gray-500'>
                                        {user?.phone_number}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Menu */}
                    <nav className='no-scrollbar flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-sm lg:flex-col'>
                        {MENU.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive(pathname, href)
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                )}
                            >
                                <Icon className='size-4' />
                                {label}
                            </Link>
                        ))}
                        <button
                            type='button'
                            onClick={handleLogout}
                            className='flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50'
                        >
                            <LogOut className='size-4' />
                            Log out
                        </button>
                    </nav>
                </aside>

                <div className='min-w-0'>{children}</div>
            </div>
        </Container>
    );
}
