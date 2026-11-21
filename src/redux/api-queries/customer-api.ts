import apiSlice from './api-slice';

const customerApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create customer ===
        createCustomer: builder.mutation({
            query: (payload) => ({
                url: `/user/customer/create`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['CUSTOMERS']
        }),

        // === get all cutomers ===
        getAllCustomers: builder.query({
            query: ({ page, limit, role, searchQuery }) => ({
                url: `/user/admin/all/roles?limit=${limit}&page=${page}&role=${role}${
                    searchQuery ? `&searchQuery=${searchQuery}` : ''
                }`,
                method: 'GET'
            }),
            providesTags: ['CUSTOMERS']
        }),

        // === update business location ===
        updateCustomers: builder.mutation({
            query: ({ payload, ussr_id }) => ({
                url: `/user/admin/change-password/${ussr_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['CUSTOMERS']
        })
    })
});

export const {
    useCreateCustomerMutation,
    useGetAllCustomersQuery,
    useLazyGetAllCustomersQuery,
    useUpdateCustomersMutation
} = customerApi;
