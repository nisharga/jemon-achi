import apiSliceAuth from './api-slice-auth';

const offerApi = apiSliceAuth.injectEndpoints({
    endpoints: (builder) => ({
        // === get single vendor  ===
        getCmsOffer: builder.query({
            query: () => ({
                url: `/cms/offer-page`,
                method: 'GET'
            })
        }),

        getBankOffers: builder.query({
            queryFn: async () => {
                // Simulating API Delay
                await new Promise((resolve) => setTimeout(resolve, 2200));
                const offers = [
                    {
                        id: 1,
                        bankLogo: '/logo/bank1.png',
                        title: 'EXTRA 10% OFF ON RBL BANK',
                        subtitle: 'Up to ₹500 on orders above ₹1999'
                    },
                    {
                        id: 2,
                        bankLogo: '/logo/bank2.png',
                        title: 'UP TO ₹500 CASHBACK',
                        subtitle: 'On a minimum order value of ₹999'
                    }
                ];
                return { data: offers };
            }
        }),

        getCommunityPosts: builder.query({
            queryFn: async () => {
                await new Promise((resolve) => setTimeout(resolve, 2200));
                const posts = [
                    {
                        id: 1,
                        handle: '@stanitech',
                        url: 'https://cdn.shopify.com/s/files/1/0384/6721/files/495688187_18004120640716614_1808024626679360779_n.jpg?v=1749076440&width=1400&height=1750&crop=center'
                    },
                    {
                        id: 2,
                        handle: '@macmike1000',
                        url: 'https://cdn.shopify.com/s/files/1/0384/6721/files/573581055_18542137474000944_204466175019363595_n.jpg?v=1762368117&width=1000&height=1251&crop=center'
                    },
                    {
                        id: 3,
                        handle: '@ulresch',
                        url: 'https://cdn.shopify.com/s/files/1/0384/6721/files/474845760_18260749327276873_7118848936092788204_n.jpg?v=1749076440&width=1400&height=1750&crop=center'
                    },
                    {
                        id: 4,
                        handle: '@macmike1000',
                        url: 'https://cdn.shopify.com/s/files/1/0384/6721/files/491016345_18040613657572173_629885074616068274_n.jpg?v=1749076558&width=1400&height=1750&crop=center'
                    }
                ];
                return { data: posts };
            }
        })

        // === create location ===
        /* couponValidate: builder.mutation({
    query: ({ payload }) => ({
      url: `/coupon/validate`,
      method: "POST",
      body: payload,
    }), 
  }),  */

        // === get single vendor  ===
        /*  getSingleCheckDeliveryCharge: builder.query({
   query: ({ phone_no }) => ({
    url: `/order/customer/check-delivery-charge-required/${phone_no}`,
    method: "GET",
   }),
  }),  */
    })
});

export const {
    useGetBankOffersQuery,
    useGetCommunityPostsQuery,
    useGetCmsOfferQuery
} = offerApi;

export default offerApi;
