import { jwtDecode, type JwtPayload } from 'jwt-decode';

/** Claims the backend puts in its access token. */
export interface IJwtUser extends JwtPayload {
    id?: string;
    phone_number?: string;
    role?: string;
}

/**
 * Decodes (does NOT verify) the access token. Only the backend holds the
 * signing secret, so it remains the real authority on every API call.
 * Returns null for missing or malformed tokens.
 */
export const getDecodedUser = (
    accessToken?: string | null
): IJwtUser | null => {
    if (!accessToken) return null;
    try {
        return jwtDecode<IJwtUser>(accessToken);
    } catch {
        return null;
    }
};

/** True when the token has an `exp` claim that is already in the past. */
export const isTokenExpired = (user: IJwtUser | null): boolean => {
    if (!user?.exp) return false;
    return user.exp * 1000 <= Date.now();
};
