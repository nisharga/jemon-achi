'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, User } from 'lucide-react';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useUser } from '@/hooks/use-user';
import { handleLogout } from '@/lib/logout';
import { cn } from '@/lib/public-utils';

/** User icon with a small menu: "Login" for guests, "My account" and "Logout" for customers. */
export default function AccountMenu() {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useClickOutside(menuRef, () => setIsOpen(false));

    const close = () => setIsOpen(false);

    return (
        <div ref={menuRef} className='relative'>
            <button
                type='button'
                onClick={() => setIsOpen(!isOpen)}
                aria-label='Account menu'
                aria-expanded={isOpen}
                className='text-primary-ink flex items-center'
            >
                <User className='size-5' aria-hidden='true' />
                <ChevronDown
                    aria-hidden='true'
                    className={cn(
                        'size-5 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {isOpen && (
                <ul className='absolute top-full right-0 z-40 mt-5 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl'>
                    {user ? (
                        <>
                            <li>
                                <Link
                                    href='/profile'
                                    onClick={close}
                                    className='nav-link block px-4 py-2 hover:bg-gray-50'
                                >
                                    My account
                                </Link>
                            </li>
                            <li>
                                <button
                                    type='button'
                                    onClick={handleLogout}
                                    className='nav-link block w-full px-4 py-2 text-left text-red-700 hover:bg-red-50'
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link
                                href='/login'
                                onClick={close}
                                className='nav-link block px-4 py-2 hover:bg-gray-50'
                            >
                                Login
                            </Link>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
