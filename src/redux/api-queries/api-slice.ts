import { getAccessToken } from '@/auth/cookies';
import { API_BASE_URL } from '@/configs/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/** Every cache tag used across feature API files. Add new domains here. */
export const API_TAGS = ['USER_PROFILE'] as const;
export type TApiTag = (typeof API_TAGS)[number];

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
        const accessToken = getAccessToken();
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return headers;
    }
});

/**
 * Single RTK Query root. Feature files (`auth-api.ts`, …) add their endpoints
 * with `apiSlice.injectEndpoints(...)`; nothing is defined here directly.
 */
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: API_TAGS,
    endpoints: () => ({})
});
