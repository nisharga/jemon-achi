import apiSlice from './api-slice';

const stockApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === get all stocks ===
        getAllStocks: builder.query({
            query: ({
                page,
                limit,
                sku,
                searchQuery,
                minQty,
                maxQty,
                businessLocationId
            }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page);
                if (limit) params.append('limit', limit);
                if (sku) params.append('sku', sku);
                if (searchQuery) params.append('searchQuery', searchQuery);
                if (minQty) params.append('minQty', minQty);
                if (maxQty) params.append('maxQty', maxQty);
                if (businessLocationId)
                    params.append('businessLocationId', businessLocationId);

                return {
                    url: `/stocks?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['STOCKS']
        }),
        // === get all stocks ===
        getAllStocksSubcategory: builder.query({
            query: ({
                page,
                limit,
                q,
                sku,
                minpPice,
                maxPice,
                // businessLocationId,
                businessLocationIds,
                isPublished,
                categorybyId,
                subCategorybyId,
                sortBy,
                sortOrder
            }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page);
                if (limit) params.append('limit', limit);
                if (q) params.append('q', q);
                if (sku) params.append('sku', sku);
                if (minpPice) params.append('minpPice', minpPice);
                if (maxPice) params.append('maxPice', maxPice);
                // if (businessLocationId)
                //   params.append("businessLocationId", businessLocationId);
                if (businessLocationIds)
                    params.append('businessLocationIds', businessLocationIds);
                if (isPublished) params.append('isPublished', isPublished);
                if (categorybyId) params.append('categorybyId', categorybyId);
                if (subCategorybyId)
                    params.append('subCategorybyId', subCategorybyId);
                if (sortBy) params.append('sortBy', sortBy);
                if (sortOrder) params.append('sortOrder', sortOrder);

                return {
                    url: `/business-location/stock/category/subcategory?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['STOCKS']
        }),

        // ********** === STOCK ADJUSTMENT REALTED APIS === **********
        // ==== create stock adjustment ===
        createStockAdjustment: builder.mutation({
            query: ({ payload }) => ({
                url: `/stocks/adjustment`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['STOCKS', 'STOCK_TRANSFERS', 'STOCK_ADJUSTMENT']
        }),
        // === get all stock adjustment ===
        getAllStockAdjustment: builder.query({
            query: ({
                page,
                limit,
                action,
                search,
                business_location,
                adjust_by,
                startDate,
                endDate
            }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page);
                if (limit) params.append('limit', limit);
                if (action) params.append('action', action);
                if (search) params.append('search', search);
                if (business_location)
                    params.append('business_location', business_location);
                if (adjust_by) params.append('adjust_by', adjust_by);
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);

                return {
                    url: `/stocks/adjustment?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['STOCK_ADJUSTMENT']
        }),

        // ********** === STOCK REPORT REALTED APIS START === **********
        // === get all stock reports ===
        getAllStockReports: builder.query({
            query: ({
                page,
                limit,
                q,
                // businessLocationId,
                businessLocationIds,
                sortBy,
                sortOrder,
                sku
            }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page);
                if (limit) params.append('limit', limit);
                if (q) params.append('q', q);
                if (sku) params.append('sku', sku);
                // if (businessLocationId)
                //   params.append("businessLocationId", businessLocationId);
                if (businessLocationIds)
                    params.append('businessLocationIds', businessLocationIds);
                if (sortBy) params.append('sortBy', sortBy);

                if (sortOrder) params.append('sortOrder', sortOrder);

                return {
                    url: `/business-location/stock/all?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['STOCK_REPORTS']
        }),
        // === get single stock report by variant id ===
        getSingleStockReportByVariantId: builder.query({
            query: ({ variant_id, stockMovementsLimit }) => {
                const params = new URLSearchParams();
                if (stockMovementsLimit)
                    params.append('stockMovementsLimit', stockMovementsLimit);

                return {
                    url: `/stocks/variant/${variant_id}?${params.toString()}`,
                    method: 'GET'
                };
            }
        }),
        // ********** === STOCK REPORT REALTED APIS END === **********

        // ********** === STOCK TRANSFER REALTED APIS START === **********
        // === create stcok api  ===
        createStockTransfer: builder.mutation({
            query: ({ payload }) => ({
                url: `/stocks/transfer`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['STOCK_TRANSFERS']
        }),

        // === get all stcok transfer ===
        getAllStockTransfer: builder.query({
            query: ({ page, limit }) => ({
                url: `/stocks/admin/transfer-history?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: ['STOCK_TRANSFERS']
        })
        // ********** === STOCK TRANSFER REALTED APIS END === **********
    })
});

export const {
    useGetAllStocksQuery,

    // ********** === STOCK ADJUSTMENT REALTED APIS === **********
    useCreateStockAdjustmentMutation,
    useGetAllStockAdjustmentQuery,
    useLazyGetAllStockAdjustmentQuery,

    // ********** === STOCK REPORT REALTED APIS === **********
    useGetAllStockReportsQuery,
    useLazyGetAllStockReportsQuery,
    useGetSingleStockReportByVariantIdQuery,

    // ********** === STOCK TRANSFER REALTED APIS === **********
    useCreateStockTransferMutation,
    useGetAllStockTransferQuery,
    useGetAllStocksSubcategoryQuery
} = stockApi;
