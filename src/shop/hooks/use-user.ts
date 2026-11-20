import { useGetUserInfoQuery } from '@/shop/redux/api/auth-api';
import { useState, useEffect } from 'react';

export const useUser = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    const {
        data: userData,
        isLoading: isUserLoading,
        isError: isUserError,
        refetch
    } = useGetUserInfoQuery({}, { skip: !isMounted });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (userData?.data) {
            setUser(userData.data);
        } else if (isUserError) {
            setUser(null);
        }
    }, [userData, isUserError]);

    return {
        user,
        // We are "loading" if not mounted yet OR the query is fetching
        isLoading: !isMounted || isUserLoading,
        isError: isUserError,
        refetch,
        isMounted
    };
};
