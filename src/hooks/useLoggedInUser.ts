'use client';

import { clearSession } from '@/auth/cookies';
import { getApiErrorStatus } from '@/lib/api-error';
import { useGetUserProfileQuery } from '@/redux/api-queries/auth-api';
import { routes } from '@/routes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Loads the current admin profile. If the backend rejects the token the
 * session is cleared and the user is sent back to the login page.
 */
export const useLoggedInUser = () => {
    const router = useRouter();
    const { data, isLoading, isError, error } = useGetUserProfileQuery();

    useEffect(() => {
        const status = getApiErrorStatus(error);
        if (isError && (status === 401 || status === 403)) {
            clearSession();
            router.replace(routes.adminLogin);
        }
    }, [isError, error, router]);

    return {
        profile: data?.data,
        isLoading,
        isError
    };
};
