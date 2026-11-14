import { API_BASE_URL } from '@/configs/env';
import type { IApiResponse, TUser } from '@/types';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ILoginPayload {
    phone_number: string;
    password: string;
}

export interface ILoginResponse {
    access_token: string;
    refresh_token: string;
    /** the logged-in user, as returned by the backend */
    data?: TUser;
}

/** Backend login endpoint per login page. */
export const LOGIN_ENDPOINTS = {
    admin: '/user/admin/login', // staff → dashboard
    user: '/user/login' // customers → profile
} as const;

export type TLoginVariant = keyof typeof LOGIN_ENDPOINTS;

/**
 * One-shot login call with plain `fetch`.
 *
 * The login pages deliberately do not use Redux: creating a store calls
 * `Math.random()`, which keeps Next.js from prerendering the page, so the
 * form would only appear after JavaScript loads (slow LCP). Errors are thrown
 * in RTK Query's `FetchBaseQueryError` shape so `getApiErrorMessage` works.
 */
export const loginRequest = async (
    variant: TLoginVariant,
    payload: ILoginPayload
): Promise<IApiResponse<ILoginResponse>> => {
    let res: Response;
    try {
        res = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINTS[variant]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
    } catch (cause) {
        throw {
            status: 'FETCH_ERROR',
            error: String(cause)
        } satisfies FetchBaseQueryError;
    }

    const body: unknown = await res.json().catch(() => undefined);
    if (!res.ok) {
        throw { status: res.status, data: body } satisfies FetchBaseQueryError;
    }
    return body as IApiResponse<ILoginResponse>;
};
