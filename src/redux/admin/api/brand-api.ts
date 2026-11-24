import apiSlice from './api-slice';

const brandApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all brands (for dropdowns/selects)
        getAllBrands: builder.query({
            query: () => ({
                url: '/brand/all',
                method: 'GET'
            }),
            providesTags: ['BRAND']
        }),

        // Get all brands for admin (with pagination)
        getAllBrandsForAdmin: builder.query({
            query: ({
                page = 1,
                limit = 10,
                searchTerm = ''
            }: {
                page?: number;
                limit?: number;
                searchTerm?: string;
            }) => ({
                url: `/brand/admin/all?page=${page}&limit=${limit}&searchTerm=${searchTerm}`,
                method: 'GET'
            }),
            providesTags: ['BRAND']
        }),

        // Get single brand
        getSingleBrand: builder.query({
            query: (id: string) => ({
                url: `/brand/${id}`,
                method: 'GET'
            }),
            providesTags: ['BRAND']
        }),

        // Create brand
        createBrand: builder.mutation({
            query: (payload: any) => ({
                url: '/brand',
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['BRAND']
        }),

        // Update brand
        updateBrand: builder.mutation({
            query: ({ id, payload }: { id: string; payload: any }) => ({
                url: `/brand/${id}`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: ['BRAND']
        }),

        // Delete brand
        deleteBrand: builder.mutation({
            query: (id: string) => ({
                url: `/brand/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['BRAND']
        })
    })
});

export const {
    useGetAllBrandsQuery,
    useGetAllBrandsForAdminQuery,
    useGetSingleBrandQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation
} = brandApi;
