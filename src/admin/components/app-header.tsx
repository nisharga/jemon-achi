'use client';

import { removeAccessToken, removeRefreshToken } from '@/admin/auth/cookies';
import { useRouter } from 'next/navigation';
import React from 'react';
import { SidebarTrigger } from '@/admin/components/ui/sidebar';
import { Button } from '@/admin/components/ui/button';
import { useLoggedInUser } from '@/admin/hooks/use-loggedin-user';
import FraudCheckerSearchBox from './shared/fraud-checker-search-box';
import Clock from './shared/Clock';

const AppHeader = () => {
    // === router ===
    const router = useRouter();
    const { profile } = useLoggedInUser();

    // === handle logout ===
    const handleLogout = () => {
        removeAccessToken();
        removeRefreshToken();
        router.refresh();
    };

    return (
        <header className='sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b bg-primary px-4 print:hidden'>
            <div className='flex items-center gap-1'>
                <SidebarTrigger className='-ml-1 text-white' />
                <p className='text-sm font-medium text-white lg:text-base'>
                    Hi, {profile?.full_name}{' '}
                    <span className='text-white/80 lowercase'>
                        ({profile?.role})
                    </span>
                </p>
            </div>

            <div className='flex items-center justify-end gap-4 text-gray-100'>
                <div className='hidden md:block'>
                    <FraudCheckerSearchBox />
                </div>
                <Clock />
                <Button onClick={handleLogout} variant='destructive' size='sm'>
                    Logout
                </Button>
            </div>
        </header>
    );
};

export default AppHeader;
