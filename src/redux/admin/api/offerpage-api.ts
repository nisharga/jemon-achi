import apiSlice from './api-slice';

const offerPageApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ✅ GET offer page (frontend + admin)
        getOfferPage: builder.query({
            query: () => ({
                url: '/cms/offer-page',
                method: 'GET'
            }),
            providesTags: ['OFFER_PAGE']
        }),

        // ✅ PUT offer page (admin – create / update / partial update)
        putOfferPage: builder.mutation({
            query: (payload) => ({
                url: '/cms/offer-page',
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: ['OFFER_PAGE']
        })
    })
});

export const { useGetOfferPageQuery, usePutOfferPageMutation } = offerPageApi;

export default offerPageApi;
