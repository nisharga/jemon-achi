'use client';
import { Icons } from '@/components/Icons';
import Logo from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { cn } from '@/lib/utils';
import { MENUS } from '@/static';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const TheHeader = () => {
    const [isShowMobileMenu, setIsShowMobileMenu] = useState(false);

    // lock body scroll while the fullscreen mobile menu is open
    useEffect(() => {
        document.body.classList.toggle('modal-open', isShowMobileMenu);
        return () => document.body.classList.remove('modal-open');
    }, [isShowMobileMenu]);

    return (
        <header className='sticky top-0 z-50 py-4'>
            <div className='container'>
                {/* larger device menu */}
                <div className='hidden items-center justify-between rounded-full border border-primary-50/40 bg-primary-50/90 px-4 py-2 backdrop-blur-sm lg:flex dark:bg-gray-900/60'>
                    <div>
                        <Link href={'/landing'}>
                            <Logo />
                        </Link>
                    </div>
                    <div className='flex items-center justify-end gap-6 text-gray-800 lg:gap-8 dark:text-gray-100'>
                        {MENUS.map(({ id, route, label, isButton }) => (
                            <Link
                                className={cn(
                                    'whitespace-nowrap transition-colors duration-300',
                                    isButton
                                        ? 'rounded-full bg-linear-to-tr from-primary-800 to-fuchsia-900 px-4 py-2 text-white hover:bg-linear-to-tl'
                                        : 'hover:text-primary-900'
                                )}
                                key={id}
                                href={route}
                            >
                                {label}
                            </Link>
                        ))}
                        <ThemeSwitcher />
                    </div>
                </div>

                {/* Mobile menu */}
                {!isShowMobileMenu ? (
                    <div className='mt-3 flex items-center justify-between rounded-full bg-primary-200/40 px-4 py-2 backdrop-blur-sm lg:hidden dark:bg-gray-800/60'>
                        <Logo className='h-7!' />
                        <div className='flex items-center justify-end gap-6'>
                            <ThemeSwitcher />
                            <button
                                onClick={() => setIsShowMobileMenu(true)}
                                className='rounded-md no-underline'
                                aria-label='Open menu'
                            >
                                <Icons.Menu />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='fixed top-0 left-0 block h-full w-full bg-white/95 lg:hidden dark:bg-slate-900'>
                        <div className='mt-8 px-6'>
                            <div className='mb-16 flex items-center justify-between rounded-full bg-primary-200/40 px-4 py-2 dark:bg-gray-800/30'>
                                <Logo className='h-7!' />
                                <div className='flex items-center justify-end gap-6'>
                                    <ThemeSwitcher />
                                    <button
                                        onClick={() =>
                                            setIsShowMobileMenu(false)
                                        }
                                        className='rounded-md no-underline'
                                        aria-label='Close menu'
                                    >
                                        <Icons.X />
                                    </button>
                                </div>
                            </div>

                            <div className='flex flex-col justify-end gap-8'>
                                {MENUS.map(({ id, route, label }) => (
                                    <Link
                                        className='whitespace-nowrap last:rounded-lg last:bg-primary-900 last:px-4 last:py-2 last:text-white last:hover:bg-primary-800'
                                        key={id}
                                        href={route}
                                        onClick={() =>
                                            setTimeout(() => {
                                                setIsShowMobileMenu(false);
                                            }, 200)
                                        }
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default TheHeader;
