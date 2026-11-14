import { routes } from '@/routes';
import { isAdminRole } from './roles';

/**
 * Two protected areas share one session (the backend's access-token cookie);
 * the token's `role` claim decides which area a user may enter.
 *
 * - admin area  `/admin/*`   → staff roles only, login at `/admin-login`
 * - user area   `/profile/*` → regular customers only, login at `/login`
 */
export const ADMIN_AREA = {
    prefix: routes.admin.base,
    home: routes.admin.base,
    login: routes.adminLogin
} as const;

export const USER_AREA = {
    prefix: routes.profile,
    home: routes.profile,
    login: routes.login
} as const;

/** Login pages: only for guests. */
export const AUTH_ROUTES: string[] = [routes.login, routes.adminLogin];

/** Query param used to return the user to the page they originally asked for. */
export const NEXT_PARAM = 'next';

/** True for `prefix` itself and anything below it (`/admin/x`, not `/admin-login`). */
export const isUnder = (pathname: string, prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);

/** The area home a role belongs to. */
export const getHomeForRole = (role?: string | null) =>
    isAdminRole(role) ? ADMIN_AREA.home : USER_AREA.home;

/**
 * Where to go after login: the requested `next` page if it is inside the
 * role's own area (no open redirects, no cross-area hops), else its home.
 */
export const getSafeRedirect = (next: string | null, role?: string | null) => {
    const area = isAdminRole(role) ? ADMIN_AREA : USER_AREA;
    return next && isUnder(next, area.prefix) ? next : area.home;
};
