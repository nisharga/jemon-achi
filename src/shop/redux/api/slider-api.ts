import apiSlice from './api-slice';

export const slides = [
    {
        id: 1,
        image: '/sample_banner.png'
    },
    {
        id: 2,
        image: '/sample_banner.png'
    },
    {
        id: 3,
        image: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg'
    },
    {
        id: 4,
        image: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg'
    },
    {
        id: 5,
        image: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg'
    },
    {
        id: 6,
        image: '/sample_banner.png'
    }
];

export const sideCards = [
    {
        id: 1,
        image: 'https://res.cloudinary.com/dlxfa1n08/image/upload/v1751185565/image_4_kakzm5.png'
    },
    {
        id: 2,
        image: 'https://res.cloudinary.com/dlxfa1n08/image/upload/v1751177016/image_3_veify2.png'
    }
];

const sliderApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create category  ===
        getAllSlides: builder.query({
            query: () => ({
                url: `/cms/banners`,
                method: 'GET'
            }),
            providesTags: ['SLIDER']
        }),

        getAllSlideCard: builder.query({
            async queryFn() {
                // ⏳ simulate 1s loading
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return {
                    data: sideCards
                };
            },
            providesTags: ['SLIDER']
        }),

        getAllSlidesVideo: builder.query({
            query: () => ({
                url: `/cms/hero-section`,
                method: 'GET'
            }),
            providesTags: ['SLIDER']
        })
    })
});

export const {
    useGetAllSlidesQuery,
    useGetAllSlideCardQuery,
    useGetAllSlidesVideoQuery
} = sliderApi;
