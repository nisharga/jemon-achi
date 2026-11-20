import apiSlice from './api-slice';

const topBarApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === Get all top bar messages (admin) ===
        getAllTopBarMessages: builder.query({
            query: () => ({
                url: `/cms/admin/top-bar-messages`,
                method: 'GET'
            }),
            providesTags: ['TOP_BAR_MESSAGES']
        }),

        // === Add top bar message ===
        addTopBarMessage: builder.mutation({
            query: (data) => ({
                url: `/cms/admin/top-bar-messages`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['TOP_BAR_MESSAGES']
        }),

        // === Update top bar message ===
        updateTopBarMessage: builder.mutation({
            query: ({ messageId, ...data }) => ({
                url: `/cms/admin/top-bar-messages/${messageId}`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: ['TOP_BAR_MESSAGES']
        }),

        // === Delete top bar message ===
        deleteTopBarMessage: builder.mutation({
            query: ({ messageId }) => ({
                url: `/cms/admin/top-bar-messages/${messageId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['TOP_BAR_MESSAGES']
        }),

        // === Toggle top bar message ===
        toggleTopBarMessage: builder.mutation({
            query: ({ messageId }) => ({
                url: `/cms/admin/top-bar-messages/${messageId}/toggle`,
                method: 'PATCH'
            }),
            invalidatesTags: ['TOP_BAR_MESSAGES']
        })
    })
});

export const {
    useGetAllTopBarMessagesQuery,
    useAddTopBarMessageMutation,
    useUpdateTopBarMessageMutation,
    useDeleteTopBarMessageMutation,
    useToggleTopBarMessageMutation
} = topBarApi;
