'use client';

import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoggedInUser, useLogout } from '@/hooks';
import { routes } from '@/routes';
import { LogOut } from 'lucide-react';

const AppHeader = () => {
    const { profile, isLoading } = useLoggedInUser(routes.adminLogin);
    const handleLogout = useLogout(routes.adminLogin);

    return (
        <header className='sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b bg-background px-4'>
            <div className='flex items-center gap-2'>
                <SidebarTrigger className='-ml-1' />
                {isLoading ? (
                    <Skeleton className='h-4 w-40' />
                ) : (
                    <p className='text-sm font-medium lg:text-base'>
                        Hi, {profile?.full_name ?? 'Admin'}{' '}
                        {profile?.role ? (
                            <span className='text-muted-foreground lowercase'>
                                ({profile.role})
                            </span>
                        ) : null}
                    </p>
                )}
            </div>

            <div className='flex items-center justify-end gap-4'>
                <ThemeSwitcher />
                <Button onClick={handleLogout} variant='destructive' size='sm'>
                    <LogOut />
                    Logout
                </Button>
            </div>
        </header>
    );
};

export default AppHeader;
