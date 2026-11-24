import {
    clearSession,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken
} from '@/auth/cookies';

/**
 * The customer's login lives in two cookies (shared with the route guard in
 * `src/proxy.ts`):
 * - access token:  sent with every API call, short-lived
 * - refresh token: used to get a new access token when the old one expires
 */

export const saveLogin = (tokens: {
    access_token: string;
    refresh_token: string;
}) => {
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
};

export const isLoggedIn = () => Boolean(getAccessToken());

export { getAccessToken, getRefreshToken };

/** Forgets the login and sends the customer to the shop home page. */
export const logout = () => {
    clearSession();
    // A full page load (not router.push) also empties every cached API response.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/';
};
