import type { IApiResponse, TUser } from '@/types';
import { apiSlice } from './api-slice';

// Login itself lives in `src/auth/login-request.ts` (plain fetch) so the
// login pages stay static and Redux-free. This file covers authenticated calls.
const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === current user (by bearer token) ===
        getUserProfile: builder.query<IApiResponse<TUser>, void>({
            query: () => ({ url: '/user', method: 'GET' }),
            providesTags: ['USER_PROFILE']
        })
    })
});

export const { useGetUserProfileQuery } = authApi;
