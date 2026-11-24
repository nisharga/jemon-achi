import { API_BASE_URL } from '@/configs/storefront';
import {
    getAccessToken,
    getRefreshToken,
    saveLogin
} from '@/lib/customer-session';
import { clearSession } from '@/auth/cookies';
import type {
    ApiResponse,
    Customer,
    LoginResult,
    Order,
    OrderList,
    RefreshResult,
    SendOtpResult,
    UpdateProfileInput
} from '@/types/public/customer';
import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';

// ---------------------------------------------------------------------------
// How every request is sent
// ---------------------------------------------------------------------------

/** Sends a request with the customer's access token (if logged in). */
const sendRequest = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
        const token = getAccessToken();
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return headers;
    }
});

/**
 * Only one token refresh runs at a time. If several requests fail together,
 * they all wait for the same refresh instead of each starting their own.
 */
let refreshInProgress: Promise<boolean> | null = null;

const refreshTokens = async (
    api: Parameters<BaseQueryFn>[1],
    extraOptions: object
): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const result = await sendRequest(
        {
            url: '/customer/refresh-token',
            method: 'POST',
            body: { refresh_token: refreshToken }
        },
        api,
        extraOptions
    );

    const tokens = (result.data as ApiResponse<RefreshResult> | undefined)
        ?.data;
    if (!tokens) return false;

    saveLogin(tokens);
    return true;
};

/**
 * Sends the request. If the access token has expired (401), gets new tokens
 * with the refresh token and tries once more. If that also fails the login is
 * over, so the cookies are removed.
 */
const sendRequestWithRefresh: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await sendRequest(args, api, extraOptions);

    if (result.error?.status === 401) {
        refreshInProgress ??= refreshTokens(api, extraOptions).finally(() => {
            refreshInProgress = null;
        });
        const refreshed = await refreshInProgress;

        if (refreshed) {
            result = await sendRequest(args, api, extraOptions);
        } else {
            clearSession();
        }
    }

    return result;
};

// ---------------------------------------------------------------------------
// Customer endpoints
// ---------------------------------------------------------------------------

const customerApi = createApi({
    reducerPath: 'customerApi',
    baseQuery: sendRequestWithRefresh,
    tagTypes: ['Profile', 'Orders'],
    endpoints: (builder) => ({
        // Step 1 of login: text a 6-digit code to the phone.
        sendOtp: builder.mutation<SendOtpResult, { phone_number: string }>({
            query: (body) => ({
                url: '/customer/otp/send',
                method: 'POST',
                body
            }),
            transformResponse: (response: ApiResponse<SendOtpResult>) =>
                response.data
        }),

        // Step 2 of login: check the code; the reply holds the tokens.
        verifyOtp: builder.mutation<
            LoginResult,
            { phone_number: string; otp: string }
        >({
            query: (body) => ({
                url: '/customer/otp/verify',
                method: 'POST',
                body
            }),
            transformResponse: (response: ApiResponse<LoginResult>) =>
                response.data
        }),

        getMyProfile: builder.query<Customer, void>({
            query: () => '/customer/me',
            transformResponse: (response: ApiResponse<Customer>) =>
                response.data,
            providesTags: ['Profile']
        }),

        updateMyProfile: builder.mutation<Customer, UpdateProfileInput>({
            query: (body) => ({
                url: '/customer/me',
                method: 'PATCH',
                body
            }),
            transformResponse: (response: ApiResponse<Customer>) =>
                response.data,
            invalidatesTags: ['Profile']
        }),

        getMyOrders: builder.query<OrderList, { page: number; limit: number }>({
            query: ({ page, limit }) =>
                `/order/customer/my-order?page=${page}&limit=${limit}`,
            transformResponse: (response: ApiResponse<OrderList>) =>
                response.data,
            providesTags: ['Orders']
        }),

        getMyOrder: builder.query<Order, string>({
            query: (orderId) => `/customer/orders/${orderId}`,
            transformResponse: (response: ApiResponse<Order>) => response.data,
            providesTags: ['Orders']
        })
    })
});

export const {
    useSendOtpMutation,
    useVerifyOtpMutation,
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useGetMyOrdersQuery,
    useGetMyOrderQuery
} = customerApi;

export default customerApi;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * Turns an API error into a sentence for the customer. The backend already
 * writes friendly messages, e.g. "Please wait 53 seconds before requesting a
 * new code.", so we show those as they are.
 */
export const getErrorMessage = (error: unknown): string => {
    const apiError = error as
        { status?: number | string; data?: { message?: string } } | undefined;

    if (apiError?.data?.message) return apiError.data.message;
    if (apiError?.status === 'FETCH_ERROR') {
        return 'Cannot reach the server. Please check your internet connection.';
    }
    return 'Something went wrong. Please try again.';
};
