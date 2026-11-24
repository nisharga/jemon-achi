import apiSlice from './api-slice';

const publicApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === Dropdown search products ===
        searchProductsDropdown: builder.query({
            query: ({ search_query, fields, is_published }) => {
                const query = new URLSearchParams();
                if (is_published !== undefined)
                    query.append('is_published', String(is_published));
                if (search_query) query.append('search_query', search_query);
                if (fields) query.append('fields', fields);

                return {
                    url: `/product?${query.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['PRODUCTS']
        }),

        // === Get product by slug ===
        getProductBySlug: builder.query({
            query: (slug) => ({
                url: `/product/slug/${slug}`,
                method: 'GET'
            }),
            providesTags: ['PRODUCTS']
        }),

        // === Published products with filters ===
        getPublishedProducts: builder.query({
            query: ({
                page,
                limit,
                sortBy,
                sortOrder,
                search_query,
                category,
                min_price,
                max_price
            }) => {
                const query = new URLSearchParams();
                if (page) query.append('page', page);
                if (limit) query.append('limit', limit);
                if (sortBy) query.append('sortBy', sortBy);
                if (sortOrder) query.append('sortOrder', sortOrder);
                if (search_query) query.append('search_query', search_query);
                if (category) query.append('category', category);
                if (min_price !== undefined)
                    query.append('min_price', min_price);
                if (max_price !== undefined)
                    query.append('max_price', max_price);

                return {
                    url: `/product?${query.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['PRODUCTS']
        }),

        // === Published products with filters ===
        getCategoryProducts: builder.query({
            query: ({
                id,
                page,
                limit,
                subcategory,
                sortBy,
                sortOrder,
                search_query,
                category,
                min_price,
                max_price
            }) => {
                const query = new URLSearchParams();
                if (page) query.append('page', page);
                if (limit) query.append('limit', limit);
                if (subcategory) query.append('subcategory', subcategory);
                if (sortBy) query.append('sortBy', sortBy);
                if (sortOrder) query.append('sortOrder', sortOrder);
                if (search_query) query.append('search_query', search_query);
                if (category) query.append('category', category);
                if (min_price !== undefined)
                    query.append('min_price', min_price);
                if (max_price !== undefined)
                    query.append('max_price', max_price);

                return {
                    url: `/product/${id}?${query.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['PRODUCTS']
        }),

        // === Get product by slug ===
        getCmsHomePage: builder.query({
            query: () => ({
                url: `/cms/homepage?populate=full`,
                method: 'GET'
            })
        }),

        // === Infinite Scroll Random Products ===
        getRandomProductsInfinite: builder.query({
            query: ({ page = 1, limit = 20 }) => {
                const params = new URLSearchParams();
                params.append('page', String(page));
                params.append('limit', String(limit));
                return {
                    url: `/product/public/random?${params.toString()}`,
                    method: 'GET'
                };
            },
            // 1. One cache entry for every page (pages are merged below).
            serializeQueryArgs: ({ endpointName }) => endpointName,
            // 2. Take the products array from page 2+ and append it onto page 1
            merge: (currentCacheData, responseData, { arg }) => {
                // If it's the first page load, cleanly initialize or reset the data state
                if (arg.page === 1) {
                    return responseData;
                }

                // Safely extract the product lists from the response nested structure
                const incomingProducts = responseData?.data?.products || [];
                const existingProducts = currentCacheData?.data?.products || [];

                // Return the updated cache payload structure
                return {
                    ...responseData,
                    data: {
                        ...responseData?.data,
                        products: [...existingProducts, ...incomingProducts]
                    }
                };
            },
            // 3. Force a network fetch only when the requested page changes upward
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
            providesTags: ['PRODUCTS']
        })
    })
});

export const {
    useSearchProductsDropdownQuery,
    useGetProductBySlugQuery,
    useGetPublishedProductsQuery,
    useGetCategoryProductsQuery,
    useGetCmsHomePageQuery,
    useGetRandomProductsInfiniteQuery
} = publicApi;

export default publicApi;
