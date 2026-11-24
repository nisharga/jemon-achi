import apiSlice from './api-slice';

const assignedOrderApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === get all assigned orders  ===
        getAllAssignedOrders: builder.query({
            query: ({ page, limit }) => ({
                url: `/assigned-orders?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: ['ASSIGNED_ORDERS', 'ORDERS']
        })
    })
});

export const { useGetAllAssignedOrdersQuery } = assignedOrderApi;
