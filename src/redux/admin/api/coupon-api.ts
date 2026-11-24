import apiSlice from './api-slice';

const couponApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create coupon ===
        createCoupon: builder.mutation({
            query: (payload) => ({
                url: `/coupon`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['COUPONS']
        }),

        // === get all coupons (Admin) ===
        getAllCoupons: builder.query({
            query: ({ page, limit, searchQuery }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());
                if (searchQuery) params.append('searchQuery', searchQuery);

                return {
                    url: `/coupon/admin/all?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['COUPONS']
        }),

        // === get active coupons ===
        getActiveCoupons: builder.query({
            query: () => ({
                url: `/coupon/admin/active`,
                method: 'GET'
            }),
            providesTags: ['COUPONS']
        }),

        // === get expired coupons ===
        getExpiredCoupons: builder.query({
            query: () => ({
                url: `/coupon/admin/expired`,
                method: 'GET'
            }),
            providesTags: ['COUPONS']
        }),

        // === get single coupon by ID ===
        getSingleCouponById: builder.query({
            query: (coupon_id) => ({
                url: `/coupon/${coupon_id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'COUPONS', id }]
        }),

        // === toggle coupon status (Active/Inactive) ===
        toggleCouponStatus: builder.mutation({
            query: (coupon_id) => ({
                url: `/coupon/toggle-status/${coupon_id}`,
                method: 'PATCH'
            }),
            invalidatesTags: ['COUPONS']
        }),

        // === delete coupon ===
        deleteCoupon: builder.mutation({
            query: (coupon_id) => ({
                url: `/coupon/${coupon_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['COUPONS']
        })
    })
});

export const {
    useCreateCouponMutation,
    useGetAllCouponsQuery,
    useGetActiveCouponsQuery,
    useGetExpiredCouponsQuery,
    useGetSingleCouponByIdQuery,
    useToggleCouponStatusMutation,
    useDeleteCouponMutation
} = couponApi;
