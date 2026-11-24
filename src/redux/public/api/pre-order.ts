import apiSliceAuth from './api-slice-auth';

const preOrderApi = apiSliceAuth.injectEndpoints({
    endpoints: (builder) => ({
        // === create a pre-order (public) ===
        createPreOrder: builder.mutation({
            query: ({ payload }) => ({
                url: `/pre-order`,
                method: 'POST',
                body: payload
            })
        }),

        // === public pre-order tracking by serial / invoice number ===
        getPreOrderTracking: builder.query({
            query: ({ serial }) => ({
                url: `/pre-order/track/${serial}`,
                method: 'GET'
            })
        })
    })
});

export const { useCreatePreOrderMutation, useGetPreOrderTrackingQuery } =
    preOrderApi;

export default preOrderApi;
