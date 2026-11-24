import apiSliceAuth from './api-slice-auth';

const productApi = apiSliceAuth.injectEndpoints({
    endpoints: (builder) => ({
        // === create product  ===
        createProduct: builder.mutation({
            query: ({ payload }) => ({
                url: `/product/vendor`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['PRODUCTS', 'VENDORS']
        }),
        // === delete product  ===
        deleteProduct: builder.mutation({
            query: ({ product_id }) => ({
                url: `/product/${product_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['PRODUCTS']
        }),

        // === get single product  ===
        getSingleProductById: builder.query({
            query: ({ product_id }) => ({
                url: `/product/slug/${product_id}`,
                method: 'GET'
            }),
            keepUnusedDataFor: 0
        }),

        // === get single product  ===
        getAllVariantByAProduct: builder.query({
            query: ({ product_id }) => ({
                url: `/product/variant/${product_id}`,
                method: 'GET'
            })
        }),

        // getProductsByVendor: builder.query({
        //  query: ({ page, limit, vendor_id, search_query }) => ({
        //   url: `/product/by-vendor/${vendor_id}?page=${page}&limit=${limit}&search_query={search_query}`,
        //   method: "GET",
        //  }),
        //  keepUnusedDataFor: 0,
        // }),
        // === get single product for admin view ===
        getSingleProductByIdForAdminView: builder.query({
            query: ({ product_id }) => ({
                url: `/product/${product_id}`,
                method: 'GET'
            }),
            keepUnusedDataFor: 0
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
                url: `/variant/by-product/${product_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['PRODUCTS']
        }),

        // === get all search variants ===
        //   getAllSearchVariants: builder.query({
        //    query: ({ page, limit, barcode, searchQuery, product_id }) => ({
        //     url: `/variant/search-by-sku?search_query=${searchQuery}&page=${page}&limit=${limit}&barcode=${barcode}&product_id=${product_id}`,
        //     method: "GET",
        //    }),
        //    providesTags: ["PRODUCTS"],
        //   }),
        getProductByIds: builder.query({
            query: ({ product_ids }) => ({
                url: `/product/ids?ids=${product_ids.join(',')}`,
                method: 'GET'
            })
        }),

        getAllProducts: builder.query({
            query: ({
                searchTerm = '',
                page = 1,
                subcategory = '',
                limit = 10,
                sortBy, // Added
                sortOrder, // Added
                top_selling, // Added
                min_price, // Added
                max_price // Added
            }) => {
                const params = new URLSearchParams();

                // Base params
                if (searchTerm) params.append('q', searchTerm);
                if (subcategory) params.append('subcategory', subcategory);
                params.append('page', page.toString());
                params.append('limit', limit.toString());

                // Sorting & Filters (Only append if they exist)
                if (sortBy) params.append('sortBy', sortBy);
                if (sortOrder) params.append('sortOrder', sortOrder);
                if (top_selling) params.append('top_selling', 'true');
                if (min_price !== undefined)
                    params.append('min_price', min_price.toString());
                if (max_price !== undefined)
                    params.append('max_price', max_price.toString());

                return {
                    url: `/product?${params.toString()}`,
                    method: 'GET'
                };
            },

            // This is critical: The cache key MUST include sortBy/filters
            // so that switching from "Newest" to "Price" doesn't merge them.
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const { page, ...rest } = queryArgs;
                return `${endpointName}-${JSON.stringify(rest)}`;
            },

            forceRefetch: ({ currentArg, previousArg }) => {
                return (
                    currentArg?.page !== previousArg?.page ||
                    currentArg?.sortBy !== previousArg?.sortBy
                );
            },

            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) return newItems;

                // Prevent duplicates by checking IDs
                const existingIds = new Set(
                    currentCache.data.products.map((p: any) => p._id)
                );
                const uniqueNew = newItems.data.products.filter(
                    (p: any) => !existingIds.has(p._id)
                );

                currentCache.data.products.push(...uniqueNew);
                currentCache.data.meta = newItems.data.meta;
            },

            providesTags: ['PRODUCTS']
        }),

        // =================== GET getAllRelatedProducts =========================
        getAllRelatedProducts: builder.query({
            query: ({
                page = 1,
                limit = 10,
                sortBy = 'price', // Default sort key
                sortOrder = 'asc', // Default order
                search,
                min_price,
                max_price,
                category_slug,
                subcategory_slug,
                sub_subcategory_slug,
                subcategory_id
            }) => {
                // 1. Initialize base params
                const queryParams: Record<string, any> = {
                    page,
                    limit,
                    sortBy,
                    sortOrder
                };

                // 2. Add slugs if they exist
                if (category_slug) queryParams.category_slug = category_slug;
                if (subcategory_slug)
                    queryParams.subcategory_slug = subcategory_slug;
                if (sub_subcategory_slug)
                    queryParams.sub_subcategory_slug = sub_subcategory_slug;
                if (subcategory_id) queryParams.subcategory_id = subcategory_id;

                // 3. Add optional filters
                if (search) queryParams.search = search;
                if (min_price !== undefined) queryParams.min_price = min_price;
                if (max_price !== undefined) queryParams.max_price = max_price;

                return {
                    url: `/product/category/subcategory`,
                    method: 'GET',
                    params: queryParams
                };
            },
            providesTags: (result, error, arg) => [
                {
                    type: 'PRODUCTS',
                    id: `RELATED-${arg.category_slug || 'ALL'}`
                }
            ]
        }),

        getRecommendedProducts: builder.query({
            query: ({
                page = 1,
                limit = 10,
                sortBy = 'price', // Default sort key
                sortOrder = 'asc', // Default order
                search,
                min_price,
                max_price,
                category_slug,
                subcategory_slug,
                sub_subcategory_slug,
                subcategory_id,
                skip_products_id // if multiple then please send with ,
            }) => {
                // 1. Initialize base params
                const queryParams: Record<string, any> = {
                    page,
                    limit,
                    sortBy,
                    sortOrder
                };

                // 2. Add slugs if they exist
                if (category_slug) queryParams.category_slug = category_slug;
                if (subcategory_slug)
                    queryParams.subcategory_slug = subcategory_slug;
                if (sub_subcategory_slug)
                    queryParams.sub_subcategory_slug = sub_subcategory_slug;
                if (subcategory_id) queryParams.subcategory_id = subcategory_id;

                // 3. Add optional filters
                if (search) queryParams.search = search;
                if (min_price !== undefined) queryParams.min_price = min_price;
                if (max_price !== undefined) queryParams.max_price = max_price;
                if (skip_products_id !== undefined)
                    queryParams.skip_products_id = skip_products_id;

                return {
                    url: `/product/recommended/all`,
                    method: 'GET',
                    params: queryParams
                };
            },
            providesTags: (result, error, arg) => [
                {
                    type: 'PRODUCTS',
                    id: `RELATED-${arg.category_slug || 'ALL'}`
                }
            ]
        }),

        //   =================== GET PRODUCT BY ID =========================
        getAllProductsByIds: builder.query({
            query: (ids) => {
                // If 'ids' is an array, join them; if it's already a string, use it directly
                const idsParam = Array.isArray(ids) ? ids.join(',') : ids;

                return {
                    url: `/product/ids`,
                    method: 'GET',
                    params: { ids: idsParam }
                };
            },
            // This helps with caching and invalidation
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map(({ _id }: any) => ({
                              type: 'PRODUCTS' as const,
                              id: _id
                          })),
                          { type: 'PRODUCTS', id: 'LIST_BY_IDS' }
                      ]
                    : [{ type: 'PRODUCTS', id: 'LIST_BY_IDS' }]
        }),

        /* getSingleProduct: builder.query({
        query: ({ slug }) => ({
            url: `/product/web/slug/${slug}`,
            method: "GET",
        }),
        providesTags: ["CATEGORIES"],
        }), */
        getStockByProductVariant: builder.query<
            any,
            { productId: string; variantId: string }
        >({
            query: ({ productId, variantId }) => ({
                url: `/stocks/${productId}/${variantId}`,
                method: 'GET'
            }),
            providesTags: (_r, _e, { productId, variantId }) => [
                { type: 'PRODUCTS', id: `${productId}:${variantId}` }
            ]
        }),

        //   =================== get Explore Products =========================
        getExploreProducts: builder.query({
            queryFn: async () => {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const data = {
                    tech: [
                        {
                            id: 1,
                            title: 'Phone Cases',
                            image: 'https://images.dailyobjects.com/marche/colllectionPage/stack-collection/explore-range_tech_phone-case.jpg?tr=cm-pad_crop,v-3'
                        },
                        {
                            id: 2,
                            title: 'Watchbands',
                            image: 'https://images.dailyobjects.com/marche/assets/images/other-2/explore-range_tech_watchbands.jpg?tr=cm-pad_crop,v-3'
                        },
                        {
                            id: 3,
                            title: 'Powerbanks',
                            image: 'https://images.dailyobjects.com/marche/assets/images/other-2/explore-range_tech_powerbank.jpg?tr=cm-pad_crop,v-3'
                        },
                        {
                            id: 4,
                            title: 'Airpod Cases',
                            image: 'https://images.dailyobjects.com/marche/assets/images/other-2/explore-range_tech_airpod-case.jpg?tr=cm-pad_crop,v-3'
                        }
                    ],
                    bags: [/* Add more category data here */]
                };
                return { data };
            }
        }),

        //   =================== get Explore Products =========================
        getFilterExploreProducts: builder.query({
            queryFn: async () => {
                await new Promise((resolve) => setTimeout(resolve, 1500));
                const products = [
                    {
                        id: 1,
                        name: 'Coral Stack Phone Case',
                        price: 1499,
                        originalPrice: 1799,
                        image: 'https://images.dailyobjects.com/marche/product-images/1101/coral-stack-phone-case-cover-for-iphone-17-images/Coral-Stack-Phone-Case-iPhone-17.png?tr=cm-pad_resize,v-3'
                    },
                    {
                        id: 2,
                        name: 'Indigo Stack Phone Case',
                        price: 1499,
                        originalPrice: 1799,
                        image: 'https://images.dailyobjects.com/marche/product-images/1101/indigo-stack-phone-case-cover-for-iphone-17-images/Indigo-Stack-Phone-Case-iPhone-17.png?tr=cm-pad_resize,v-3'
                    },
                    {
                        id: 3,
                        name: 'Mint Stack Phone Case',
                        price: 1499,
                        originalPrice: 1799,
                        image: 'https://images.dailyobjects.com/marche/product-images/1101/mint-stack-phone-case-cover-for-iphone-17-images/Mint-Stack-Phone-Case-iPhone-17.png?tr=cm-pad_resize,v-3'
                    },
                    {
                        id: 4,
                        name: 'Carbon Stack Phone Case',
                        price: 1499,
                        originalPrice: 1799,
                        image: 'https://images.dailyobjects.com/marche/product-images/1101/carbon-stack-phone-case-cover-for-iphone-17-images/Carbon-Stack-Phone-Case-iPhone-17.png?tr=cm-pad_resize,v-3'
                    }
                ];
                return { data: products };
            }
        }),

        //   =================== GET PRODUCT DETAILS =========================
        // query: (slug) => `/products/${slug}`, // Actual API call

        getProductDetail: builder.query({
            query: ({ slug }) => ({
                url: `/product/slug/${slug}`,
                method: 'GET'
            })
        })
    })
});

export const {
    useCreateProductMutation,
    useGetSingleProductByIdQuery,
    useGetAllVariantByAProductQuery,
    useGetSingleProductByIdForAdminViewQuery,
    useUpdateVariantsByProductIdMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetProductByIdsQuery,
    useGetAllProductsQuery,
    useGetAllRelatedProductsQuery,
    useGetAllProductsByIdsQuery,
    useGetStockByProductVariantQuery,
    useGetRecommendedProductsQuery,
    useGetExploreProductsQuery,
    useGetFilterExploreProductsQuery,
    useGetProductDetailQuery

    //  useGetProductsByVendorQuery,
    //  useGetAllSearchVariantsQuery,
} = productApi;

// import apiSliceAuth from "./api-slice-auth";

// const productApi = apiSliceAuth.injectEndpoints({
//     endpoints: (builder) => ({
//         // === create product  ===
//         createProduct: builder.mutation({
//             query: ({ payload }) => ({
//                 url: `/product`,
//                 method: "POST",
//                 body: payload,
//             }),
//             invalidatesTags: ["PRODUCTS", "VENDORS"],
//         }),
//         // === delete product  ===
//         deleteProduct: builder.mutation({
//             query: ({ product_id }) => ({
//                 url: `/product/${product_id}`,
//                 method: "DELETE",
//             }),
//             invalidatesTags: ["PRODUCTS"],
//         }),

//         // === get single product  ===
//         getSingleProductById: builder.query({
//             query: ({ product_id }) => ({
//                 url: `/product/${product_id}`,
//                 method: "GET",
//             }),
//             keepUnusedDataFor: 0,
//         }),
//         // getProductsByVendor: builder.query({
//         //  query: ({ page, limit, vendor_id, search_query }) => ({
//         //   url: `/product/by-vendor/${vendor_id}?page=${page}&limit=${limit}&search_query={search_query}`,
//         //   method: "GET",
//         //  }),
//         //  keepUnusedDataFor: 0,
//         // }),
//         // === get single product for admin view ===
//         getSingleProductByIdForAdminView: builder.query({
//             query: ({ product_id }) => ({
//                 url: `/product/${product_id}`,
//                 method: "GET",
//             }),
//             keepUnusedDataFor: 0,
//         }),
//         // === update product  ===
//         updateProduct: builder.mutation({
//             query: ({ payload, product_id }) => ({
//                 url: `/product/${product_id}`,
//                 method: "PATCH",
//                 body: payload,
//             }),
//             invalidatesTags: ["PRODUCTS"],
//         }),
//         // === update product  ===
//         updateVariantsByProductId: builder.mutation({
//             query: ({ payload, product_id }) => ({
//                 url: `/variant/by-product/${product_id}`,
//                 method: "PATCH",
//                 body: payload,
//             }),
//             invalidatesTags: ["PRODUCTS"],
//         }),

//         // === get all search variants ===
//         //   getAllSearchVariants: builder.query({
//         //    query: ({ page, limit, barcode, searchQuery, product_id }) => ({
//         //     url: `/variant/search-by-sku?search_query=${searchQuery}&page=${page}&limit=${limit}&barcode=${barcode}&product_id=${product_id}`,
//         //     method: "GET",
//         //    }),
//         //    providesTags: ["PRODUCTS"],
//         //   }),
//         getProductByIds: builder.query({
//             query: ({ product_ids }) => ({
//                 url: `/product/web/by-ids?ids=${product_ids.join(",")}`,
//                 method: "GET",
//             }),
//         }),

//     }),
// });

// export const {
//     useCreateProductMutation,
//     useGetSingleProductByIdQuery,
//     useGetSingleProductByIdForAdminViewQuery,
//     useUpdateVariantsByProductIdMutation,
//     useUpdateProductMutation,
//     useDeleteProductMutation,
//     useGetProductByIdsQuery
//     //  useGetProductsByVendorQuery,
//     //  useGetAllSearchVariantsQuery,
// } = productApi;
