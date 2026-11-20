import apiSlice from './api-slice';

const heroSectionApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === Get hero section (public + admin) ===
        getHeroSection: builder.query({
            query: () => ({
                url: '/cms/hero-section',
                method: 'GET'
            }),
            providesTags: ['HERO_SECTION']
        }),

        // === Create/Replace entire hero section (admin) ===
        upsertHeroSection: builder.mutation({
            query: (payload) => ({
                url: '/cms/hero-section',
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: ['HERO_SECTION']
        }),

        // === Update single video item (admin) ===
        updateHeroVideo: builder.mutation({
            query: ({ videoId, payload }) => ({
                url: `/cms/hero-section/${videoId}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['HERO_SECTION']
        }),

        // === Delete single video item (admin) ===
        deleteHeroVideo: builder.mutation({
            query: ({ videoId }) => ({
                url: `/cms/hero-section/${videoId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['HERO_SECTION']
        })
    })
});

export const {
    useGetHeroSectionQuery,
    useUpsertHeroSectionMutation,
    useUpdateHeroVideoMutation,
    useDeleteHeroVideoMutation
} = heroSectionApi;

export default heroSectionApi;
