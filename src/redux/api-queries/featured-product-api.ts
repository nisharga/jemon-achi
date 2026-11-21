import apiSlice from './api-slice';

const featuredProductApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create featured product  ===
        createFeaturedProduct: builder.mutation({
            query: ({ payload }) => ({
                url: `/cms/admin/featured-products`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['FEATURED_PRODUCTS']
        }),
        // === get all featured products  ===
        getAllFeaturedProducts: builder.query({
            query: () => ({
                url: `/cms/featured-products`,
                method: 'GET'
            }),
            providesTags: ['FEATURED_PRODUCTS']
        }),
        // === delete featured product  ===
        deleteFeaturedProduct: builder.mutation({
            query: ({ variant_id }) => ({
                url: `/cms/admin/featured-products/${variant_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['FEATURED_PRODUCTS']
        })
    })
});

export const {
    useCreateFeaturedProductMutation,
    useGetAllFeaturedProductsQuery,
    useDeleteFeaturedProductMutation
} = featuredProductApi;
