import apiSlice from './api-slice';

const bannerApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create banner  ===
        createBanner: builder.mutation({
            query: ({ payload }) => ({
                url: `/cms/add/banner`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['BANNERS']
        }),

        createMobileBanner: builder.mutation({
            query: ({ payload }) => ({
                url: `/cms/add/banner/mobile`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['BANNERS']
        }),

        createFeaturedProducts: builder.mutation({
            query: ({ payload }) => ({
                url: `/cms/admin/featured-products`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['BANNERS']
        }),

        // === get all banners  ===
        getAllBanners: builder.query({
            query: () => ({
                url: `/cms/banners`,
                method: 'GET'
            }),
            providesTags: ['BANNERS']
        }),
        // === delete banner  ===
        deleteBanner: builder.mutation({
            query: ({ banner_id }) => ({
                url: `/cms/delete-banner/${banner_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['BANNERS']
        }),
        deleteMobileBanner: builder.mutation({
            query: ({ banner_id }) => ({
                url: `/cms/delete-banner/mobile/${banner_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['BANNERS']
        }),
        deleteFeaturedBanner: builder.mutation({
            query: ({ banner_id }) => ({
                url: `/cms/admin/featured-products/${banner_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['BANNERS']
        })
    })
});

export const {
    useCreateBannerMutation,
    useCreateFeaturedProductsMutation,
    useGetAllBannersQuery,
    useDeleteBannerMutation,
    useCreateMobileBannerMutation,
    useDeleteMobileBannerMutation,
    useDeleteFeaturedBannerMutation
} = bannerApi;
