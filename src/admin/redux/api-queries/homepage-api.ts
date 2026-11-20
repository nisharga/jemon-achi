import apiSlice from './api-slice';

const homepageApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === Get homepage (public + admin) ===
        getHomepage: builder.query({
            query: (populate = 'summary') => ({
                url: `/cms/homepage?populate=${populate}`,
                method: 'GET'
            }),
            providesTags: ['HOMEPAGE']
        }),

        // === Shop by Category ===
        upsertShopByCategory: builder.mutation({
            query: (payload) => ({
                url: '/cms/homepage/shop-by-category',
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: ['HOMEPAGE']
        }),

        // === Best Selling ===
        upsertBestSelling: builder.mutation({
            query: (payload) => ({
                url: '/cms/homepage/best-selling',
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: ['HOMEPAGE']
        }),

        // === New Arrivals ===
        upsertNewArrivals: builder.mutation({
            query: (payload) => ({
                url: '/cms/homepage/new-arrivals',
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: ['HOMEPAGE']
        }),

        updateNewArrivalGroup: builder.mutation({
            query: ({ groupId, payload }) => ({
                url: `/cms/homepage/new-arrivals/${groupId}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['HOMEPAGE']
        }),

        deleteNewArrivalGroup: builder.mutation({
            query: ({ groupId }) => ({
                url: `/cms/homepage/new-arrivals/${groupId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['HOMEPAGE']
        }),

        // === Leather Section ===
        upsertLeatherSection: builder.mutation({
            query: (payload) => ({
                url: '/cms/homepage/leather-section',
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: ['HOMEPAGE']
        })
    })
});

export const {
    useGetHomepageQuery,
    useUpsertShopByCategoryMutation,
    useUpsertBestSellingMutation,
    useUpsertNewArrivalsMutation,
    useUpdateNewArrivalGroupMutation,
    useDeleteNewArrivalGroupMutation,
    useUpsertLeatherSectionMutation
} = homepageApi;

export default homepageApi;
