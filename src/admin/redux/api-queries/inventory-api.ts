import apiSlice from './api-slice';

const inventoryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInventoryByProductAndOutletId: builder.query({
            query: ({ productId, outletId }) => ({
                url: `/inventories?productId=${productId}&outletId=${outletId}`,
                method: 'GET'
            }),
            providesTags: ['outlet', 'PRODUCTS']
        }),
        getInventoryByProductAndWarehouseId: builder.query({
            query: ({ productId, warehouseId }) => ({
                url: `/inventories?productId=${productId}&warehouseId=${warehouseId}`,
                method: 'GET'
            }),
            providesTags: ['warehouse', 'PRODUCTS']
        }),
        getInventoriesByWarehouseId: builder.query({
            query: ({ warehouseId, limit = 50, page = 1 }) => ({
                url: `/outlets/warehouse/inventory/${warehouseId}?page=${page}&limit=${limit}`,
                // prev url: `/inventories?limit=${limit}&page=${page}&warehouseId=${warehouseId}`,
                method: 'GET'
            }),
            providesTags: ['warehouse', 'PRODUCTS']
        }),
        getInventoriesByOutletId: builder.query({
            query: ({ business_location_id, limit, page, searchQuery }) => ({
                url: `/business-location/inventories/${business_location_id}?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
                method: 'GET'
            }),
            providesTags: ['OUTLET_INVENTORIES']
        }),

        // get all invenotry transfared history
        getAllInventoryTransfaredHistory: builder.query({
            query: ({ limit, page }) => ({
                url: `/inventories/transfer/inventory?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: ['INVENTORY_TRANSFARED_HISTORY']
        }),

        // === new [8/23/25] get all invrntories for a business location ===
        getAllInventories: builder.query({
            query: ({
                page,
                limit,
                searchQuery
                // sku = "",
                // sortOrder = "",
                // sortBy = "",
                // productId = "",
                // variantId = "",
                // categoryId = "",
                // subcategoryId = "",
            }) => ({
                url: `/product/variants/all?page=${page}&limit=${limit}&search=${searchQuery}`,
                method: 'GET'
            }),
            providesTags: ['INVENTORIES']
        }),
        getAllInventoriesForBusinessLocation: builder.query({
            query: ({
                business_location_id,
                page = 1,
                limit = 20,
                searchQuery = '',
                sku = '',
                sortOrder = '',
                sortBy = '',
                productId = '',
                variantId = '',
                categoryId = '',
                subcategoryId = ''
            }) => ({
                url: `/business-location/inventories/${business_location_id}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&productId=${productId}&variantId=${variantId}&categoryId=${categoryId}&subcategoryId=${subcategoryId}&sku=${sku}&searchQuery=${searchQuery}`,
                method: 'GET'
            }),
            providesTags: ['INVENTORIES']
        }),
        getScanInventory: builder.query({
            query: ({ business_location_id, barcode }) => ({
                url: `/business-location/pos/scan/${business_location_id}?barcode=${barcode}`,
                method: 'GET'
            }),
            providesTags: ['INVENTORIES']
        })
    })
});

export const {
    useGetInventoryByProductAndOutletIdQuery,
    useGetInventoryByProductAndWarehouseIdQuery,
    useGetInventoriesByOutletIdQuery,
    useGetInventoriesByWarehouseIdQuery,
    useGetAllInventoryTransfaredHistoryQuery,

    // new
    useGetAllInventoriesQuery,
    useGetAllInventoriesForBusinessLocationQuery,
    useLazyGetScanInventoryQuery
} = inventoryApi;
