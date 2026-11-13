import { ACCESS_TOKEN_KEY } from '@/auth/constants';
import { getDecodedUser, isTokenExpired } from '@/auth/decoded';
import {
    AUTH_ROUTES,
    DEFAULT_LOGIN_REDIRECT,
    NEXT_PARAM,
    PROTECTED_PREFIX
} from '@/auth/routes';
import { routes } from '@/routes';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Optimistic auth guard (Next.js 16 "proxy", formerly middleware).
 * It decodes the access-token cookie and checks expiry. Signature checks and
 * role/permission rules belong to the backend, which validates the bearer
 * token on every API request; an invalid token makes `GET /user` fail and
 * `useLoggedInUser` signs the user out.
 */
export function proxy(request: NextRequest) {
    const { nextUrl } = request;
    const { pathname } = nextUrl;

    const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
    const user = getDecodedUser(accessToken);
    const isAuthenticated = user !== null && !isTokenExpired(user);

    // Logged-in users have no business on the login page.
    if (AUTH_ROUTES.includes(pathname)) {
        return isAuthenticated
            ? NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
            : NextResponse.next();
    }

    // Guests trying to reach the admin area go to login (and come back after).
    if (pathname.startsWith(PROTECTED_PREFIX) && !isAuthenticated) {
        const loginUrl = new URL(routes.adminLogin, nextUrl);
        loginUrl.searchParams.set(NEXT_PARAM, pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Only the admin area and its login page; the marketing site is untouched.
    matcher: ['/admin', '/admin/:path*', '/admin-login']
};
