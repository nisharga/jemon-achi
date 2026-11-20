import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface FraudData {
    status?: boolean;
    apis?: boolean;
    fraud?: boolean;
    message?: string;
    error?: string;
    [key: string]: any;
}

export const fraudApi = createApi({
    reducerPath: 'fraudApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://efraudchecker.zephix.io/api/v1/fraud-checker/'
    }),
    endpoints: (builder) => ({
        getFraudData: builder.query<FraudData, string>({
            query: (phone) => `${phone}`,
            transformResponse: (response: FraudData) => response // API returns raw object
        })
    })
});

export const { useGetFraudDataQuery } = fraudApi;
