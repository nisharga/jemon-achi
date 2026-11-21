import apiSlice from './api-slice';

const categoryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create category  ===
        createCategory: builder.mutation({
            query: ({ payload }) => ({
                url: `/category`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['CATEGORIES']
        }),
        // === get all categories  ===
        getAllCategories: builder.query({
            query: ({ page = 1, limit = 20 }) => ({
                url: `/category?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: ['CATEGORIES']
        }),
        // === get single category  ===
        getSingleCategory: builder.query({
            query: ({ category_id }) => ({
                url: `/category/${category_id}`,
                method: 'GET'
            }),
            providesTags: ['CATEGORIES']
        }),
        // === update category  ===
        updateCategory: builder.mutation({
            query: ({ payload, category_id }) => ({
                url: `/category/${category_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['CATEGORIES']
        }),
        // === delete category  ===
        deleteCategory: builder.mutation({
            query: ({ category_id }) => ({
                url: `/category/${category_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['CATEGORIES']
        })
    })
});

export const {
    useCreateCategoryMutation,
    useGetAllCategoriesQuery,
    useGetSingleCategoryQuery,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation
} = categoryApi;
