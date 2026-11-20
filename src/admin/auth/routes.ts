// all public routes goes here
export const AUTH_ROUTES = ['/', '/register', '/verify-otp'];

// default redirect after login
export const DEFAULT_LOGIN_REDIRECT = '/admin/overview';

// allowed user roles
export const ALLOWED_USER_ROLES = [
    'FOUNDER',
    'SUPER_ADMIN',
    'ADMIN',
    'MODERATOR',
    'SALES_EXECUTIVE',
    'SUPPORT_ADMIN',
    'CUSTOMER_SUPPORT',
    'CUSTOMER_EXECUTIVE',
    // "OUTLET_MANAGER",
    'WAREHOUSE_MANAGER',
    'INVENTORY_MANAGER',
    'ACCOUNT_MANAGER'
];

// allowed routes for inventory manager
export const ALLOWED_INVENTORY_MANAGER_ROUTES = [
    '/admin/overview',
    '/admin/outlets-and-warehouse',

    // inventory manager views
    '/admin/inventory/view/warehouse',
    '/admin/inventory/view/outlet',

    // product routes
    '/admin/products',
    '/admin/create-product',
    '/admin/update-product/',
    '/admin/inventory/warehouse-update',
    '/admin/inventory/outlet-update',
    '/admin/inventory/transfer-history',
    '/admin/product-details',

    // category sub category routes
    '/admin/categories',
    '/admin/sub-categories',
    '/admin/add-new-category',
    '/admin/add-new-sub-category',
    '/admin/update-category',
    '/admin/update-sub-category'
];
