import { logout } from './customer-session';
import { removeUser, removeVendorId } from './user-store';

/** Clears the session and reloads the storefront home. */
export const handleLogout = () => {
    // Old leftovers in localStorage from the previous login system.
    removeUser();
    removeVendorId();
    logout();
};
