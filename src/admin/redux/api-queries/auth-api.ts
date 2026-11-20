import apiSlice from './api-slice';

const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === register ===
        register: builder.mutation({
            query: ({ payload }) => ({
                url: `/user/register`,
                method: 'POST',
                body: payload
            })
        }),
        // === login ===
        login: builder.mutation({
            query: ({ payload }) => ({
                url: `/user/admin/login`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['USER_PROFILE']
        }),
        // === get user profile by token ===
        getUserProfile: builder.query({
            query: () => ({
                url: `/user`,
                method: 'GET'
            }),
            providesTags: ['USER_PROFILE']
        }),
        // === verify OTP ===
        verifyOTP: builder.mutation({
            query: ({ payload }) => ({
                url: `/client/verify-otp`,
                method: 'PATCH',
                body: payload
            })
        }),
        // === resend OTP [not working write now] ===
        resendOTP: builder.mutation({
            query: ({ payload }) => ({
                url: `/auth/client/otp-resend`,
                method: 'PATCH',
                body: payload
            })
        })
    })
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useGetUserProfileQuery,
    useVerifyOTPMutation,
    useResendOTPMutation
} = authApi;
