import Cookies from 'js-cookie';
import {
    ACCESS_TOKEN_DAYS,
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_DAYS,
    REFRESH_TOKEN_KEY
} from './constants';

// `secure` cookies are silently dropped on plain http://localhost, so only
// require them when the page itself is served over https.
const isHttps = () =>
    typeof window !== 'undefined' && window.location.protocol === 'https:';

export const setCookie = (key: string, value: string, days: number) => {
    Cookies.set(key, value, {
        expires: days,
        secure: isHttps(),
        sameSite: 'lax',
        path: '/'
    });
};

export const getCookie = (key: string): string | undefined => Cookies.get(key);

export const removeCookie = (key: string) => Cookies.remove(key, { path: '/' });

// === token helpers ===
export const setAccessToken = (token: string) =>
    setCookie(ACCESS_TOKEN_KEY, token, ACCESS_TOKEN_DAYS);
export const getAccessToken = () => getCookie(ACCESS_TOKEN_KEY);
export const removeAccessToken = () => removeCookie(ACCESS_TOKEN_KEY);

export const setRefreshToken = (token: string) =>
    setCookie(REFRESH_TOKEN_KEY, token, REFRESH_TOKEN_DAYS);
export const getRefreshToken = () => getCookie(REFRESH_TOKEN_KEY);
export const removeRefreshToken = () => removeCookie(REFRESH_TOKEN_KEY);

/** Removes every auth cookie. */
export const clearSession = () => {
    removeAccessToken();
    removeRefreshToken();
};
