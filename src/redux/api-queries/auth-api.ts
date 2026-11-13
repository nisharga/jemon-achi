import type { IApiResponse, TUser } from '@/types';
import { apiSlice } from './api-slice';

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

const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === admin login ===
        login: builder.mutation<IApiResponse<ILoginResponse>, ILoginPayload>({
            query: (payload) => ({
                url: '/user/admin/login',
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['USER_PROFILE']
        }),

        // === current user (by bearer token) ===
        getUserProfile: builder.query<IApiResponse<TUser>, void>({
            query: () => ({ url: '/user', method: 'GET' }),
            providesTags: ['USER_PROFILE']
        })
    })
});

export const { useLoginMutation, useGetUserProfileQuery } = authApi;
