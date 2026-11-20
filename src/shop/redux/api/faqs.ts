import apiSliceAuth from './api-slice-auth';

const faqApi = apiSliceAuth.injectEndpoints({
    endpoints: (builder) => ({
        //   =================== GET FAQs =========================
        getFAQs: builder.query({
            query: ({ slug }) => ({
                url: `/faq/public/product/${slug}`,
                method: 'GET'
            }),
            providesTags: ['FAQS']
        }),

        //   =================== CREATE FAQs =========================
        createFAQ: builder.mutation({
            query: ({ payload }) => ({
                url: `/faq/public`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['FAQS']
        })

        //   =================== GET REVIEWS =========================
        /* getReviewsByProductId: builder.query({
        queryFn: async (productId) => {
            await new Promise((resolve) => setTimeout(resolve, 2500));
            
            // Simulated Review Data
            const data = {
            overallRating: 4.4,
            totalReviews: 476,
            recommendationRate: 78, // 104 out of 133
            snapshot: [
                { stars: 5, count: 372 },
                { stars: 4, count: 32 },
                { stars: 3, count: 14 },
                { stars: 2, count: 18 },
                { stars: 1, count: 40 },
            ],
            mostHelpfulFavorable: {
                rating: 5,
                title: "Love This!!!",
                author: "Horselady",
                date: "3 years ago",
                content: "Love this!!!! Finally, a cord long enough to use while talking on the phone and t...",
                helpfulCount: 5,
                verified: true
            },
            mostHelpfulCritical: {
                rating: 2,
                title: "Slow Charging",
                author: "Slow charge",
                date: "4 years ago",
                content: "I own an iPhone 13 Pro Max. I purchased an otterBox Defender case for my...",
                helpfulCount: 26,
                verified: true
            }
            };
            return { data };
        }
    }), */
    })
});

export const { useGetFAQsQuery, useCreateFAQMutation } = faqApi;
