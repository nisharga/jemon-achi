'use client';

import { clearSession } from '@/auth/cookies';
import { apiSlice } from '@/redux/api-queries/api-slice';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

/** Clears the session and cached API data, then goes to `redirectTo`. */
export const useLogout = (redirectTo: string) => {
    const router = useRouter();
    const dispatch = useDispatch();

    return useCallback(() => {
        clearSession();
        dispatch(apiSlice.util.resetApiState());
        router.replace(redirectTo);
        router.refresh();
    }, [dispatch, redirectTo, router]);
};
