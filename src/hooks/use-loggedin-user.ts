import { removeAccessToken, removeRefreshToken } from '@/auth/admin-cookies';
import { useGetUserProfileQuery } from '@/redux/admin/api/auth-api';
import { TUser } from '@/types/admin/user';

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
