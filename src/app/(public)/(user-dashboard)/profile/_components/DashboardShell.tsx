'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Package,
    UserRound
} from 'lucide-react';
import { Container } from '@/components/public/common/container';
import LogoutDialog from '@/components/public/shared/LogoutDialog';
import { useClickOutside } from '@/hooks/use-click-outside';
import { cn } from '@/lib/public-utils';

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
 * The frame around every dashboard page: the menu and the page.
 * Large screens: a vertical menu on the left. Phones: a dropdown above the page.
 */
export default function DashboardShell({ children }: { children: ReactNode }) {
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const askToLogOut = () => setIsLogoutOpen(true);

    return (
        <Container className='py-6 lg:py-10'>
            <div className='grid gap-6 lg:grid-cols-[260px_1fr]'>
                <aside className='lg:sticky lg:top-28 lg:self-start'>
                    <MenuList onLogout={askToLogOut} />
                    <MenuDropdown onLogout={askToLogOut} />
                </aside>

                <div className='min-w-0'>{children}</div>
            </div>

            <LogoutDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen} />
        </Container>
    );
}

/** Large screens: every page listed, the current one highlighted. */
function MenuList({ onLogout }: { onLogout: () => void }) {
    const pathname = usePathname();

    return (
        <nav
            aria-label='Account'
            className='hidden flex-col gap-2 rounded-xl bg-white p-2 shadow-sm lg:flex'
        >
            {MENU.map(({ label, href, icon: Icon }) => (
                <Link
                    key={href}
                    href={href}
                    aria-current={isActive(pathname, href) ? 'page' : undefined}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive(pathname, href)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                >
                    <Icon className='size-4' aria-hidden='true' />
                    {label}
                </Link>
            ))}
            <LogoutButton onClick={onLogout} />
        </nav>
    );
}

/** Phones: one button showing the current page; tap it to see the others. */
function MenuDropdown({ onLogout }: { onLogout: () => void }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);
    useClickOutside(boxRef, () => setIsOpen(false));

    const current =
        MENU.find((item) => isActive(pathname, item.href)) ?? MENU[0];
    const CurrentIcon = current.icon;

    return (
        <div ref={boxRef} className='relative lg:hidden'>
            <button
                type='button'
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={`Account menu, current page: ${current.label}`}
                className='flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm'
            >
                <CurrentIcon className='text-ink size-4' aria-hidden='true' />
                {current.label}
                <ChevronDown
                    aria-hidden='true'
                    className={cn(
                        'ml-auto size-4 text-gray-600 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {isOpen && (
                <nav
                    aria-label='Account'
                    className='absolute inset-x-0 top-full z-30 mt-2 flex flex-col gap-1 rounded-xl bg-white p-2 shadow-lg'
                >
                    {MENU.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setIsOpen(false)}
                            aria-current={
                                isActive(pathname, href) ? 'page' : undefined
                            }
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                                isActive(pathname, href)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-gray-600 hover:bg-gray-100'
                            )}
                        >
                            <Icon className='size-4' aria-hidden='true' />
                            {label}
                        </Link>
                    ))}
                    <LogoutButton
                        onClick={() => {
                            setIsOpen(false);
                            onLogout();
                        }}
                    />
                </nav>
            )}
        </div>
    );
}

function LogoutButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type='button'
            onClick={onClick}
            className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50'
        >
            <LogOut className='size-4' aria-hidden='true' />
            Log out
        </button>
    );
}
