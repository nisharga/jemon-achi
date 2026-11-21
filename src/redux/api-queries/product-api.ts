import apiSlice from './api-slice';

const productApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create product  ===
        createProduct: builder.mutation({
            query: ({ payload }) => ({
                url: `/product`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['PRODUCTS']
        }),
        deleteVariantsByProductId: builder.mutation({
            query: (payload) => ({
                url: `/product/variant/by-product/${payload?.productId}`,
                method: 'DELETE',
                body: payload
            }),
            invalidatesTags: ['PRODUCTS']
        }),
        // === get all products  ===
        getAllProducts: builder.query({
            query: ({
                page,
                limit,
                searchQuery,
                sku,
                businessLocationId,
                categoryId,
                subcategoryId
            }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());
                if (searchQuery) params.append('searchQuery', searchQuery);
                if (sku) params.append('sku', sku);
                if (businessLocationId)
                    params.append('businessLocationId', businessLocationId);
                if (categoryId) params.append('categoryId', categoryId);
                if (subcategoryId)
                    params.append('subcategoryId', subcategoryId);
                return {
                    url: `/product/admin/all?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['PRODUCTS', 'outlet', 'warehouse'],
            keepUnusedDataFor: 0
        }),

        // === get single product  ===
        getSingleProductById: builder.query({
            query: ({ product_id }) => ({
                url: `/product/${product_id}`,
                method: 'GET'
            }),
            keepUnusedDataFor: 0,
            providesTags: ['PRODUCTS']
        }),
        // === get single product for admin view ===
        getSingleProductByIdForAdminView: builder.query({
            query: ({ product_id }) => ({
                url: `/product/admin/products/${product_id}`,
                method: 'GET'
            }),
            keepUnusedDataFor: 0,
            providesTags: ['PRODUCTS']
        }),
        // === update product  ===
        updateProduct: builder.mutation({
            query: ({ payload, product_id }) => ({
                url: `/product/${product_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['PRODUCTS']
        }),
        // === update product  ===
        updateVariantsByProductId: builder.mutation({
            query: ({ payload, product_id }) => ({
                url: `/product/variant/${product_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['PRODUCTS', 'SEARCH_VARIANTS']
        }),
        // === delete product  ===
        deleteProduct: builder.mutation({
            query: ({ product_id }) => ({
                url: `/product/${product_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['PRODUCTS']
        }),
        // === publish/unpublish product ===
        publishProduct: builder.mutation({
            query: ({ product_id, payload }) => ({
                url: `/product/admin/publish/${product_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['PRODUCTS']
        }),
        // === get all search variants ===
        getAllSearchVariants: builder.query({
            // query: ({ page, limit, barcode, searchQuery, product_id }) => ({
            //   url: `/product/admin/variants?page=${page}&limit=${limit}&barcode=${barcode}&searchQuery=${searchQuery}&product_id=${product_id}`,
            //   method: "GET",
            // }),
            query: ({ page, limit, barcode, searchQuery, product_id }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());
                if (searchQuery) params.append('searchQuery', searchQuery);
                if (barcode) params.append('barcode', barcode);
                if (product_id) params.append('product_id', product_id);

                return {
                    url: `/product/admin/variants?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['SEARCH_VARIANTS']
        }),

        // === get single product  ===
        getAllProductVariant: builder.query({
            query: ({ product_id }) => ({
                url: `/product/variant/${product_id}`,
                method: 'GET'
            }),
            providesTags: ['PRODUCTS']
        })
    })
});

export const {
    useCreateProductMutation,
    useGetAllProductsQuery,
    useGetSingleProductByIdQuery,
    useGetSingleProductByIdForAdminViewQuery,
    useUpdateProductMutation,
    useUpdateVariantsByProductIdMutation,
    useDeleteProductMutation,
    usePublishProductMutation,
    useGetAllSearchVariantsQuery,
    useGetAllProductVariantQuery,
    useDeleteVariantsByProductIdMutation
} = productApi;
