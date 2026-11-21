import apiSlice from './api-slice';

const subcategoryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create sub category  ===
        createSubCategory: builder.mutation({
            query: ({ payload }) => ({
                url: `/sub-category`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['SUB_CATEGORIES']
        }),

        // === create sub sub category  ===
        createSubSubCategory: builder.mutation({
            query: ({ payload }) => ({
                url: `/sub-category/sub-subcategory/create`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['SUB_CATEGORIES']
        }),
        // === get all sub categories  ===
        getAllSubCategories: builder.query({
            query: ({ page = 1, limit = 20 }) => ({
                url: `/sub-category?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: ['SUB_CATEGORIES']
        }),

        // === get all sub categories by category id  ===
        getAllSubCategoriesByCategoryId: builder.query({
            query: ({ category_id, page = 1, limit = 100 }) => ({
                url: `/sub-category/by-category/${category_id}?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: ['SUB_CATEGORIES_BY_CATEGORY_ID']
        }),
        getAllSubSubCategoriesByCategoryId: builder.query({
            query: ({ category_id, page = 1, limit = 100 }) => ({
                url: `/sub-category/sub-subcategory/by-subcategory-id/${category_id}?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: ['SUB_CATEGORIES_BY_CATEGORY_ID']
        }),

        // === get single sub category  ===
        getSingleSubCategory: builder.query({
            query: ({ sub_category_id }) => ({
                url: `/sub-category/${sub_category_id}`,
                method: 'GET'
            }),
            providesTags: ['SUB_CATEGORIES']
        }),
        // === update sub category  ===
        updateSubCategory: builder.mutation({
            query: ({ payload, sub_category_id }) => ({
                url: `/sub-category/${sub_category_id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['SUB_CATEGORIES']
        }),
        // === delete sub category  ===
        deleteSubCategory: builder.mutation({
            query: ({ sub_category_id }) => ({
                url: `/sub-category/${sub_category_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['SUB_CATEGORIES', 'SUB_CATEGORIES_BY_CATEGORY_ID']
        }),
        // === delete sub sub category  ===
        deleteSubSubCategory: builder.mutation({
            query: ({ sub_subcategory_id }) => ({
                url: `/sub-category/sub-subcategory/${sub_subcategory_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['SUB_CATEGORIES', 'SUB_CATEGORIES_BY_CATEGORY_ID']
        }),
        // === get single sub category  ===
        getAllSubCategory: builder.query({
            query: () => ({
                url: `/sub-category`,
                method: 'GET'
            }),
            providesTags: ['SUB_CATEGORIES']
        })
    })
});

export const {
    useCreateSubCategoryMutation,
    useCreateSubSubCategoryMutation,
    useGetAllSubCategoriesQuery,
    useGetAllSubCategoriesByCategoryIdQuery,
    useGetAllSubSubCategoriesByCategoryIdQuery,
    useGetSingleSubCategoryQuery,
    useUpdateSubCategoryMutation,
    useGetAllSubCategoryQuery,
    useDeleteSubCategoryMutation,
    useDeleteSubSubCategoryMutation
} = subcategoryApi;
