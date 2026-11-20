import { removeAccessToken } from '@/shop/lib/cookies';
import { removeUser, removeVendorId } from '@/shop/lib/user-store';

/** Clears the session and reloads the storefront home. */
export const handleLogout = () => {
    removeAccessToken();
    removeUser();
    removeVendorId();
    window.location.href = '/';
};
