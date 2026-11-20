import apiSlice from './api-slice';

export const topBarApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get top bar messages (public)
        getTopBarMessages: builder.query({
            query: () => ({
                url: '/cms/top-bar-messages',
                method: 'GET'
            }),
            providesTags: ['TOP_BAR_MESSAGES']
        })
    })
});

export const { useGetTopBarMessagesQuery } = topBarApi;
