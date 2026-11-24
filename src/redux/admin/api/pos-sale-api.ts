import {
    PosSaleRequest,
    PosSaleResponse,
    PosScanResponse
} from '@/types/admin/pos';
import apiSlice from './api-slice';

const posSaleApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // == Scan a product by barcode ==
        scanProduct: builder.query({
            query: ({ barcode, outletId }) =>
                `/pos/scan?barcode=${encodeURIComponent(
                    barcode
                )}&outletId=${encodeURIComponent(outletId)}`,
            transformResponse: (response: PosScanResponse) => response
        }),

        // == Create a new sale transaction ==
        createSale: builder.mutation<PosSaleResponse, PosSaleRequest>({
            query: (payload) => ({
                url: '/pos/sale',
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['POS_SALES', 'SEARCH_VARIANTS']
        }),

        // == Search users by phone ==
        searchUsersByPhone: builder.query({
            query: (phone) =>
                `/user/users/regx-phone/${encodeURIComponent(phone)}`
        }),

        // === Get a sale by id ===
        getOutletSaleById: builder.query({
            query: ({ pos_sale_id }) => ({
                url: `/pos/sale/${pos_sale_id}`,
                method: 'GET'
            }),
            providesTags: ['POS_SALES']
        }),

        // ============== //

        // === get all pos sales  ===
        getAllPosSales: builder.query({
            query: ({
                page,
                limit,
                startDate,
                endDate,
                business_location_id,
                sortBy,
                sortOrder,
                payment_method,
                payment_status,
                sale_serial_id,
                q,
                productName,
                sku,
                barcode,
                minProfit,
                maxProfit,
                minDue,
                maxDue,
                minPaid,
                maxPaid,
                created_by
            }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());
                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (business_location_id)
                    params.append('business_location_id', business_location_id);
                if (sortBy) params.append('sortBy', sortBy);
                if (sortOrder) params.append('sortOrder', sortOrder);
                if (payment_method)
                    params.append('payment_method', payment_method);
                if (payment_status)
                    params.append('payment_status', payment_status);
                if (sale_serial_id)
                    params.append('sale_serial_id', sale_serial_id);
                if (q) params.append('q', q);
                if (productName) params.append('productName', productName);
                if (sku) params.append('sku', sku);
                if (barcode) params.append('barcode', barcode);
                if (minProfit) params.append('minProfit', minProfit);
                if (maxProfit) params.append('maxProfit', maxProfit);
                if (minDue) params.append('minDue', minDue);
                if (maxDue) params.append('maxDue', maxDue);
                if (minPaid) params.append('minPaid', minPaid);
                if (maxPaid) params.append('maxPaid', maxPaid);
                if (created_by) params.append('created_by', created_by);

                return {
                    url: `/pos/sale?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['POS_SALES']
        }),
        // === get single sale ===
        getSinglePosSale: builder.query({
            query: ({ pos_sale_id }) => ({
                url: `/pos/sale/${pos_sale_id}`,
                method: 'GET'
            })
        }),
        // === edit pos sale ===
        editPosSale: builder.mutation({
            query: ({ pos_sale_id, payload }) => ({
                url: `/pos/sale/${pos_sale_id}`,
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: ['POS_SALES', 'SEARCH_VARIANTS']
        }),
        // === get pos sale report ===
        getPosSalesReport: builder.query({
            query: ({
                startDate,
                endDate,
                business_location_id,
                created_by
            }) => {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (business_location_id)
                    params.append('business_location_id', business_location_id);
                if (created_by) params.append('created_by', created_by);

                return {
                    url: `/pos/admin/report?${params.toString()}`,
                    method: 'GET'
                };
            }
        }),
        // === delete pos sale ===
        deletePosSale: builder.mutation({
            query: ({ pos_sale_id }) => ({
                url: `/pos/admin/sale/${pos_sale_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['POS_SALES', 'SEARCH_VARIANTS']
        }),
        // === pos sales retrunt ===
        posSaleReturn: builder.mutation({
            query: ({ payload, sale_id }) => ({
                url: `/pos/sale/return/${sale_id}`,
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: ['POS_SALES', 'SEARCH_VARIANTS']
        })
    })
});

export const {
    useScanProductQuery,
    useLazyScanProductQuery,
    useCreateSaleMutation,
    useSearchUsersByPhoneQuery,
    useLazySearchUsersByPhoneQuery,
    useGetOutletSaleByIdQuery,

    useGetAllPosSalesQuery,
    useLazyGetAllPosSalesQuery,
    useGetSinglePosSaleQuery,
    useEditPosSaleMutation,
    useGetPosSalesReportQuery,
    useDeletePosSaleMutation,
    usePosSaleReturnMutation
} = posSaleApi;
