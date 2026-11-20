import apiSlice from './api-slice';

const purchaseApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create purchase  ===
        createPurchase: builder.mutation({
            query: ({ payload }) => ({
                url: `/purchase`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['PURCHASES', 'SEARCH_VARIANTS']
        }),
        // === get all purchases  ===
        getAllPurchases: builder.query({
            query: ({
                supplier,
                business_location,
                status,
                purchase_number,
                page,
                limit
            }) => ({
                url: `/purchase?supplier=${supplier}&business_location=${business_location}&status=${status}&purchase_number=${purchase_number}&page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: ['PURCHASES']
        }),
        // === get single purchase ===
        getSinglePurchase: builder.query({
            query: ({ purchase_id }) => ({
                url: `/purchase/${purchase_id}`,
                method: 'GET'
            }),
            providesTags: (result, error, { purchase_id }) => [
                { type: 'PURCHASE', id: purchase_id }
            ]
        }),
        // === edit purchase ===
        editPurchase: builder.mutation({
            query: ({ purchase_id, payload }) => ({
                url: `/purchase/${purchase_id}`,
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: (result, error, { purchase_id }) => [
                'PURCHASES',
                'SEARCH_VARIANTS',
                { type: 'PURCHASE', id: purchase_id }
            ]
        })
    })
});

export const {
    useCreatePurchaseMutation,
    useGetAllPurchasesQuery,
    useGetSinglePurchaseQuery,
    useEditPurchaseMutation
} = purchaseApi;
