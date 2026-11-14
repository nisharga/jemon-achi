'use client';

import { clearSession } from '@/auth/cookies';
import { getApiErrorStatus } from '@/lib/api-error';
import { useGetUserProfileQuery } from '@/redux/api-queries/auth-api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Loads the current user's profile. If the backend rejects the token the
 * session is cleared and the user is sent to `loginPath`.
 */
export const useLoggedInUser = (loginPath: string) => {
    const router = useRouter();
    const { data, isLoading, isError, error } = useGetUserProfileQuery();

    useEffect(() => {
        const status = getApiErrorStatus(error);
        if (isError && (status === 401 || status === 403)) {
            clearSession();
            router.replace(loginPath);
        }
    }, [isError, error, router, loginPath]);

    return {
        profile: data?.data,
        isLoading,
        isError
    };
};
