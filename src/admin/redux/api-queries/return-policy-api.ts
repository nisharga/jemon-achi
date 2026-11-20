import apiSlice from './api-slice';

const returnPolicyApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create return policy ===
        createReturnPolicy: builder.mutation({
            query: ({ payload }) => ({
                url: `/return-policy`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['RETURN_POLICIES']
        }),
        // === get all return policies ===
        getAllReturnPolicies: builder.query({
            query: ({ page = 1, limit = 20, search = '' }) => ({
                url: `/return-policy?page=${page}&limit=${limit}&search=${search}`,
                method: 'GET'
            }),
            providesTags: ['RETURN_POLICIES']
        }),
        // === get active return policies for dropdown ===
        getActiveReturnPolicies: builder.query({
            query: () => ({
                url: `/return-policy/public`,
                method: 'GET'
            }),
            providesTags: ['RETURN_POLICIES']
        }),
        // === get single return policy ===
        getSingleReturnPolicy: builder.query({
            query: ({ id }) => ({
                url: `/return-policy/${id}`,
                method: 'GET'
            }),
            providesTags: ['RETURN_POLICIES']
        }),
        // === update return policy ===
        updateReturnPolicy: builder.mutation({
            query: ({ payload, id }) => ({
                url: `/return-policy/${id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['RETURN_POLICIES']
        }),
        // === delete return policy ===
        deleteReturnPolicy: builder.mutation({
            query: ({ id }) => ({
                url: `/return-policy/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['RETURN_POLICIES']
        }),
        // === toggle return policy status ===
        toggleReturnPolicyStatus: builder.mutation({
            query: ({ id }) => ({
                url: `/return-policy/${id}/toggle-status`,
                method: 'PATCH'
            }),
            invalidatesTags: ['RETURN_POLICIES']
        })
    })
});

export const {
    useCreateReturnPolicyMutation,
    useGetAllReturnPoliciesQuery,
    useGetActiveReturnPoliciesQuery,
    useGetSingleReturnPolicyQuery,
    useUpdateReturnPolicyMutation,
    useDeleteReturnPolicyMutation,
    useToggleReturnPolicyStatusMutation
} = returnPolicyApi;
