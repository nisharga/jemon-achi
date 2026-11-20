import { ACCESS_TOKEN_KEY } from '@/auth/constants';
import { getDecodedUser, isTokenExpired } from '@/auth/decoded';
import { isAdminRole } from '@/auth/roles';
import {
    ADMIN_AREA,
    AUTH_ROUTES,
    getHomeForRole,
    isUnder,
    NEXT_PARAM,
    USER_AREA
} from '@/auth/routes';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Optimistic auth guard (Next.js 16 "proxy", formerly middleware).
 * Decodes the access-token cookie, checks expiry and routes by `role`:
 *
 * | path          | guest            | customer (USER) | staff (admin roles) |
 * | ------------- | ---------------- | --------------- | ------------------- |
 * | /login        | ✓                | → /profile      | → /admin            |
 * | /admin-login  | ✓                | → /profile      | → /admin            |
 * | /profile/*    | → /login?next    | ✓               | → /admin            |
 * | /admin/*      | → /admin-login   | → /profile      | ✓                   |
 *
 * The token signature is checked by the backend on every API call, which
 * remains the real authority; this only keeps people on the right pages.
 */
export function proxy(request: NextRequest) {
    const { nextUrl } = request;
    const { pathname } = nextUrl;

    const user = getDecodedUser(request.cookies.get(ACCESS_TOKEN_KEY)?.value);
    const isAuthenticated = user !== null && !isTokenExpired(user);
    const isAdmin = isAuthenticated && isAdminRole(user.role);

    const redirectTo = (path: string) =>
        NextResponse.redirect(new URL(path, nextUrl));

    const redirectToLogin = (loginPath: string) => {
        const url = new URL(loginPath, nextUrl);
        url.searchParams.set(NEXT_PARAM, pathname);
        return NextResponse.redirect(url);
    };

    // Login pages are for guests only.
    if (AUTH_ROUTES.includes(pathname)) {
        return isAuthenticated
            ? redirectTo(getHomeForRole(user.role))
            : NextResponse.next();
    }

    // Admin dashboard: staff only.
    if (isUnder(pathname, ADMIN_AREA.prefix)) {
        if (!isAuthenticated) return redirectToLogin(ADMIN_AREA.login);
        if (!isAdmin) return redirectTo(USER_AREA.home);
        return NextResponse.next();
    }

    // Customer area: regular users only.
    if (isUnder(pathname, USER_AREA.prefix)) {
        if (!isAuthenticated) return redirectToLogin(USER_AREA.login);
        if (isAdmin) return redirectTo(ADMIN_AREA.home);
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    // Only the guarded areas and their login pages; the marketing site is untouched.
    matcher: [
        '/admin',
        '/admin/:path*',
        '/admin-login',
        '/profile',
        '/profile/:path*',
        '/login',
        '/register'
    ]
};
