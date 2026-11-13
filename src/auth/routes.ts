import { routes } from '@/routes';

/** Routes that only make sense for logged-out users (login, register…). */
export const AUTH_ROUTES: string[] = [routes.adminLogin];

/** URL prefix guarded by the proxy; everything below it needs a session. */
export const PROTECTED_PREFIX = routes.admin.base;

/** Where to send a user right after login (or when already logged in). */
export const DEFAULT_LOGIN_REDIRECT = routes.admin.base;

/** Query param used to return the user to the page they originally asked for. */
export const NEXT_PARAM = 'next';
