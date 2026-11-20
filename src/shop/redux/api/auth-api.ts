import apiSlice from './api-slice';
import Cookies from 'js-cookie';
import apiSliceAuth from './api-slice-auth';

const authApi = apiSliceAuth.injectEndpoints({
    endpoints: (builder) => ({
        // === register ===
        register: builder.mutation({
            query: ({ payload }) => ({
                url: `/user`,
                method: 'POST',
                body: payload
            })
        }),
        // === login ===
        login: builder.mutation({
            query: (payload) => ({
                // payload contains { phone_number, password }
                url: `/user/login`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['CLIENT_PROFILE']
        }),
        // === get client profile by token ===
        getCurrentProfile: builder.query({
            query: () => ({
                url: `/user/auth`,
                method: 'GET'
            }),
            providesTags: ['CLIENT_PROFILE']
        }),

        // === get client profile by token ===
        logout: builder.mutation({
            query: () => ({
                url: `/user/logout`,
                method: 'DELETE'
            }),
            invalidatesTags: ['CLIENT_PROFILE']
        }),

        // === verify OTP ===
        verifyOTP: builder.mutation({
            query: ({ payload }) => ({
                url: `/client/verify-otp`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['CLIENT_PROFILE']
        }),
        // === resend OTP [not working write now] ===
        resendOTP: builder.mutation({
            query: ({ payload }) => ({
                url: `/auth/client/otp-resend`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['CLIENT_PROFILE']
        }),

        getUserInfo: builder.query({
            query: () => ({
                url: `/user`,
                method: 'GET'
            }),
            keepUnusedDataFor: 300
            // providesTags: ["CLIENT_PROFILE"],
        }),

        // === get my order ===
        getMyOrder: builder.query({
            query: () => ({
                url: `/order/customer/my-order`,
                method: 'GET'
            }),
            providesTags: ['CLIENT_PROFILE']
        })
    })
});

export const {
    useRegisterMutation,
    useGetUserInfoQuery,
    useLoginMutation,
    useGetCurrentProfileQuery,
    useVerifyOTPMutation,
    useResendOTPMutation,
    useLogoutMutation,
    useGetMyOrderQuery
} = authApi;
