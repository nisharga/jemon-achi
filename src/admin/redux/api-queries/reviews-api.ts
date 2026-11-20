import apiSlice from './api-slice';

const reviewsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === get all reviews === ?${params.toString()}
        getAllReviews: builder.query({
            query: ({ page = 1, limit = 10, searchQuery }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', limit.toString());
                if (searchQuery) params.append('searchQuery', searchQuery);
                return {
                    url: `/review`,
                    method: 'GET'
                };
            },
            providesTags: ['REVIEWS']
        }),

        // === Get Single Role by ID ===
        getReviewById: builder.query({
            query: ({ review_id }) => ({
                url: `/review/${review_id}`,
                method: 'GET'
            }),
            providesTags: (result, error, slug) => [
                'REVIEWS',
                { type: 'REVIEWS', slug }
            ]
        }),

        // === update business location ===
        updateReview: builder.mutation({
            query: ({ payload, review_id }) => ({
                url: `/review/admin/${review_id}/helpful`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['REVIEWS']
        }),

        // === deleteReview ===
        deleteReview: builder.mutation({
            query: ({ review_id }) => ({
                url: `/review/admin/${review_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['REVIEWS']
        }),

        // === updateStatus ===
        updateStatus: builder.mutation({
            query: ({ payload, review_id }) => ({
                url: `/review/admin/${review_id}/status`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['REVIEWS']
        }),

        // === reviewAdmin ===
        reviewAdmin: builder.mutation({
            query: ({ payload, review_id }) => ({
                url: `/review/admin/${review_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['REVIEWS']
        })
    })
});

export const {
    useGetAllReviewsQuery,
    useGetReviewByIdQuery,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
    useUpdateStatusMutation,
    useReviewAdminMutation
} = reviewsApi;
