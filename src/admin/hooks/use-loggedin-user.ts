import { removeAccessToken, removeRefreshToken } from '@/admin/auth/cookies';
import { useGetUserProfileQuery } from '@/admin/redux/api-queries/auth-api';
import { TUser } from '@/admin/types/user';

export const useLoggedInUser = () => {
    // === get client profile ===
    const { data, isLoading, isError } = useGetUserProfileQuery({});

    if (isError) {
        removeAccessToken();
        removeRefreshToken();
        window.location.href = '/admin-login';
    }

    return {
        profile: data?.data as TUser,
        isLoading
    };
};
