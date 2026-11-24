import { number } from 'zod/v3';
import apiSlice from './api-slice';

export enum CATEGORY_STATUS_ENUM {
    PENDING_APPROVAL = 'pending_approval',
    APPROVED = 'approved',
    DISABLED = 'disabled',
    REJECTED = 'rejected'
}

export const categoriesData = [
    {
        name: 'Electronics',
        path: '/categories/electronics',
        subcategories: [
            {
                name: 'Mobile Phones',
                path: '/categories/electronics/mobile-phones'
            },
            { name: 'Laptops', path: '/categories/electronics/laptops' },
            { name: 'Cameras', path: '/categories/electronics/cameras' }
        ]
    },
    {
        name: 'Fashion',
        path: '/categories/fashion',
        subcategories: [
            { name: 'Men', path: '/categories/fashion/men' },
            { name: 'Women', path: '/categories/fashion/women' },
            { name: 'Kids', path: '/categories/fashion/kids' }
        ]
    },
    {
        name: 'Home & Kitchen',
        path: '/categories/home-kitchen',
        subcategories: [
            { name: 'Furniture', path: '/categories/home-kitchen/furniture' },
            { name: 'Decor', path: '/categories/home-kitchen/decor' },
            { name: 'Appliances', path: '/categories/home-kitchen/appliances' }
        ]
    },
    {
        name: 'Sports & Outdoors',
        path: '/categories/sports-outdoors',
        subcategories: [
            { name: 'Fitness', path: '/categories/sports-outdoors/fitness' },
            { name: 'Cycling', path: '/categories/sports-outdoors/cycling' },
            { name: 'Camping', path: '/categories/sports-outdoors/camping' }
        ]
    },
    {
        name: 'Books',
        path: '/categories/books',
        subcategories: [
            { name: 'Fiction', path: '/categories/books/fiction' },
            { name: 'Non-fiction', path: '/categories/books/non-fiction' },
            { name: 'Children', path: '/categories/books/children' }
        ]
    }
];

export const categoriesDataNew = [
    {
        id: 'cat1',
        name: 'iPhone',
        path: '/category/iphone',
        sections: [
            {
                title: 'Explore iPhone',
                links: [
                    { name: 'Explore All iPhone', path: '/iphone' },
                    { name: 'iPhone 17 Pro', path: '/iphone-17-pro' },
                    { name: 'iPhone 17', path: '/iphone-17' }
                ]
            },
            {
                title: 'Shop iPhone',
                links: [
                    { name: 'Shop iPhone', path: '/shop/iphone' },
                    { name: 'iPhone Accessories', path: '/shop/accessories' },
                    { name: 'Apple Trade In', path: '/shop/trade-in' }
                ]
            },
            {
                title: 'More from iPhone',
                links: [
                    { name: 'iPhone Support', path: '/support/iphone' },
                    { name: 'AppleCare+', path: '/support/applecare' },
                    { name: 'iOS 26', path: '/ios' }
                ]
            }
        ]
    }
    // Add other categories like Mac, iPad here...
];

const categoryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // 1. Existing Get All Categories
        getAllCategories: builder.query({
            query: () => ({
                url: `/category/published/all`,
                method: 'GET'
            }),
            providesTags: ['CATEGORIES']
        }),

        // 2. New Get Products by Category ID
        getProductsByCategory: builder.query({
            query: ({ categoryId, page = 1, limit = 30 }) => {
                const params: Record<string, any> = {
                    category_id: categoryId,
                    page,
                    limit
                };
                return {
                    // Using the URL you provided
                    url: `/product/category/subcategory`,
                    method: 'GET',
                    params // Passes the ID as query params
                };
            },
            providesTags: (result, error, arg) => [
                { type: 'PRODUCTS', id: arg }
            ]
        }),

        // === create category  ===
        createCategory: builder.mutation({
            query: ({ payload }) => ({
                url: `/category`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['CATEGORIES']
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

        // === update category status ===
        updateCategoryStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/category/${id}/status`,
                method: 'PATCH',
                body: { status }
            }),
            invalidatesTags: ['CATEGORIES']
        }),

        // === get all categories  ===
        getAllSubCategoryByCategorySlug: builder.query({
            query: ({ slug }) => ({
                url: `/sub-category/by-category-slug/${slug}`,
                method: 'GET'
            }),
            providesTags: ['CATEGORIES']
        }),

        // === get all sub sub category  ===
        getAllSubSubCategoryBySubCategorySlug: builder.query({
            query: ({ slug }) => ({
                url: `/sub-category/sub-subcategory/by-subcategory-slug/${slug}`,
                method: 'GET'
            }),
            providesTags: ['CATEGORIES']
        })
    })
});

export const {
    useCreateCategoryMutation,
    useGetSingleCategoryQuery,
    useUpdateCategoryMutation,
    useUpdateCategoryStatusMutation,
    useGetAllCategoriesQuery,
    useGetProductsByCategoryQuery,
    useGetAllSubCategoryByCategorySlugQuery,
    useGetAllSubSubCategoryBySubCategorySlugQuery
} = categoryApi;

// typescript for API's
