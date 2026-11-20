import apiSliceAuth from './api-slice-auth';

const reviewApi = apiSliceAuth.injectEndpoints({
    endpoints: (builder) => ({
        // === create review  ===
        createReview: builder.mutation({
            query: (payload) => ({
                url: `/review`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['REVIEWS']
        }),

        getReviewsByProductId: builder.query({
            query: ({ slug }) => ({
                url: `/review/public/product/${slug}`,
                method: 'GET'
            }),
            providesTags: ['REVIEWS']
        }),

        getReviewRatingByProductId: builder.query({
            query: ({ slug }) => ({
                url: `/review/public/rating/${slug}`,
                method: 'GET'
            }),
            providesTags: ['REVIEWS']
        }),

        // === update review ===
        updateReview: builder.mutation({
            query: ({ id, payload }) => ({
                url: `/review/${id}/helpful`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['REVIEWS']
        })
    })
});

export const {
    useCreateReviewMutation,
    useUpdateReviewMutation,
    useGetReviewsByProductIdQuery,
    useGetReviewRatingByProductIdQuery
} = reviewApi;
