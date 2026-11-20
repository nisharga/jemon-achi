'use client';

import { getAccessToken } from '@/admin/auth/cookies';
import { ENV } from '@/admin/constants/env';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: ENV.NEXT_PUBLIC_BASE_SERVER_API,
    credentials: 'include',
    prepareHeaders: (headers) => {
        const accessToken = getAccessToken();
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return headers;
    }
});

const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQuery,
    endpoints: () => ({}),
    tagTypes: [
        'USER_PROFILE',
        'WEBSITE_SETTINGS',
        'BANNERS',
        'CATEGORIES',
        'SUB_CATEGORIES',
        'SUB_CATEGORIES_BY_CATEGORY_ID',
        'PRODUCTS',
        'FEATURED_PRODUCTS',
        'ASSIGNED_ORDERS',
        'ORDERS',
        'ORDER',
        'OUTLET_AND_WAREHOUSE',
        'INVENTORY_TRANSFARED_HISTORY',
        'STAFFS',
        'STAFF',
        'CUSTOMERS',
        'ORDER_COURIER_STATUS',
        'outlet',
        'warehouse',

        // NEW
        'SUPPLIERS',
        'BUSINESS_LOCATIONS',
        'PURCHASES',
        'PURCHASE',
        'POS_SALES',
        'STOCK_TRANSFERS',
        'STOCKS',
        'STOCK_ADJUSTMENT',
        'OUTLET_INVENTORIES',
        'INVENTORIES',
        'STOCK_REPORTS',
        'SEARCH_VARIANTS',
        'REPEAT_CUSTOMER',
        'OFFER_PAGE',
        'HERO_SECTION',
        'HOMEPAGE',
        'ROLE',
        'ROLES',
        'COUPONS',
        'REVIEWS',
        'FAQS',
        'TOP_BAR_MESSAGES',
        'RETURN_POLICIES',
        'BRAND'
    ]
});

export default apiSlice;
