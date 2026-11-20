import apiSliceAuth from './api-slice-auth';

const orderApi = apiSliceAuth.injectEndpoints({
    endpoints: (builder) => ({
        // === get single vendor  ===
        getSingleTrackOrder: builder.query({
            query: ({ track_id }) => ({
                url: `/order/track-by-sl/${track_id}`,
                method: 'GET'
            })
        }),

        // === create location ===
        couponValidate: builder.mutation({
            query: ({ payload }) => ({
                url: `/coupon/validate`,
                method: 'POST',
                body: payload
            })
        }),

        // === get single vendor  ===
        getSingleCheckDeliveryCharge: builder.query({
            query: ({ phone_no }) => ({
                url: `/order/customer/check-delivery-charge-required/${phone_no}`,
                method: 'GET'
            })
        })
    })
});

export const {
    useGetSingleTrackOrderQuery,
    useCouponValidateMutation,
    useGetSingleCheckDeliveryChargeQuery
} = orderApi;

export default orderApi;
