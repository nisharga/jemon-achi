import apiSlice from './api-slice';

const supplierApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create supplier  ===
        createSupplier: builder.mutation({
            query: ({ payload }) => ({
                url: `/supplier`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['SUPPLIERS']
        }),

        // === get all suppliers  ===
        getAllSuppliers: builder.query({
            query: ({ page, limit }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());

                const queryString = params.toString();
                return {
                    url: `/supplier${queryString ? `?${queryString}` : ''}`, // Fixed URL
                    method: 'GET'
                };
            },
            providesTags: ['SUPPLIERS']
        }),

        // === get single product  ===
        getSingleSupplier: builder.query({
            query: ({ supplier_id }) => ({
                url: `/supplier/${supplier_id}`,
                method: 'GET'
            }),
            keepUnusedDataFor: 0,
            providesTags: ['SUPPLIERS']
        }),

        // === update product  ===
        updateSupplier: builder.mutation({
            query: ({ payload, supplier_id }) => ({
                url: `/supplier/${supplier_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['SUPPLIERS']
        }),

        // === delete product  ===
        deleteSupplier: builder.mutation({
            query: ({ supplier_id }) => ({
                url: `/supplier/${supplier_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['SUPPLIERS']
        })
    })
});

export const {
    useCreateSupplierMutation,
    useGetAllSuppliersQuery,
    useGetSingleSupplierQuery,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation
} = supplierApi;
