import { useMounted } from '@/hooks/useMounted';
import { isLoggedIn } from '@/lib/customer-session';
import { useGetMyProfileQuery } from '@/redux/public/api/customer-api';

/**
 * The logged-in customer, or `null` for guests.
 *
 * The profile is only requested in the browser (the login cookie is not read
 * on the server) and only when a login cookie exists, so guests make no call.
 */
export const useUser = () => {
    const isMounted = useMounted();
    const hasLogin = isMounted && isLoggedIn();

    const { data, isLoading, isError, refetch } = useGetMyProfileQuery(
        undefined,
        { skip: !hasLogin }
    );

    // Everyone who logs in through the shop is a regular customer.
    const user = hasLogin && data ? { ...data, role: 'USER' as const } : null;

    return {
        user,
        // Still "loading" until we know whether someone is logged in.
        isLoading: !isMounted || (hasLogin && isLoading),
        isError,
        refetch,
        isMounted
    };
};
