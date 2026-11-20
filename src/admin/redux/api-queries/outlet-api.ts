import apiSlice from './api-slice';

const outletApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllOutletAndWarehouse: builder.query({
            query: () => ({
                url: `/outlets`,
                method: 'GET'
            }),
            providesTags: ['OUTLET_AND_WAREHOUSE']
        }),
        getAllOutlet: builder.query({
            query: () => ({
                url: `/outlets/outlets`,
                method: 'GET'
            }),
            providesTags: ['outlet']
        }),
        getAllWarehouse: builder.query({
            query: () => ({
                url: `/outlets/warehouses`,
                method: 'GET'
            }),
            providesTags: ['warehouse']
        }),
        updateInventoryForWarehouse: builder.mutation({
            query: ({ payload }) => ({
                url: `/inventories`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['warehouse']
        }),
        updateInventoryWarehouseToOutlet: builder.mutation({
            query: ({ payload }) => ({
                url: `/inventories`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['outlet']
        })
    })
});

export const {
    useGetAllOutletAndWarehouseQuery,
    useGetAllOutletQuery,
    useGetAllWarehouseQuery,
    useUpdateInventoryForWarehouseMutation,
    useUpdateInventoryWarehouseToOutletMutation
} = outletApi;
