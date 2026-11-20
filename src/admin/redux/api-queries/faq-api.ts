import apiSlice from './api-slice';

const faqApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === get all faqs === ?${params.toString()}
        getAllFaqs: builder.query({
            query: ({ page = 1, limit = 10, searchQuery }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', limit.toString());
                if (searchQuery) params.append('searchQuery', searchQuery);
                return {
                    url: `/faq/admin/all`,
                    method: 'GET'
                };
            },
            providesTags: ['FAQS']
        }),

        // === create coupon ===
        createFaq: builder.mutation({
            query: (payload) => ({
                url: `/faq/admin`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['FAQS']
        }),

        // === Get Single Role by ID ===
        getFaqBySlug: builder.query({
            query: ({ slug }) => ({
                url: `/faq/${slug}`,
                method: 'GET'
            }),
            providesTags: (result, error, slug) => [
                'FAQS',
                { type: 'FAQS', slug }
            ]
        }),

        // === update faqs ===
        updateFaq: builder.mutation({
            query: ({ payload, faq_id }) => ({
                url: `/faq/admin/public-faq-action/${faq_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['FAQS']
        }),

        // === deleteReview ===
        deleteFaq: builder.mutation({
            query: ({ faq_id }) => ({
                url: `/faq/admin/${faq_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['FAQS']
        })

        // === updateStatus ===
        /* updateStatus: builder.mutation({
      query: ({ payload, review_id }) => ({
        url: `/review/admin/${review_id}/status`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["REVIEWS"],
    }), */

        // === reviewAdmin ===
        /*  reviewAdmin: builder.mutation({
      query: ({ payload, review_id }) => ({
        url: `/review/admin/${review_id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["REVIEWS"],
    }), */
    })
});

export const {
    useGetAllFaqsQuery,
    useCreateFaqMutation,
    useUpdateFaqMutation,
    useDeleteFaqMutation,
    useGetFaqBySlugQuery
} = faqApi;
