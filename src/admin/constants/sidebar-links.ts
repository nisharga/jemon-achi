export const SIDEBAR_LINKS = [
    {
        title: 'Dashboard',
        label: 'dashboard',
        url: '#',
        items: [
            { title: 'Overview', url: '/admin/overview' },
            { title: 'Fraud Checker', url: '/admin/fraud-checker' }
            //    {
            //     title: "Reseller and Investor",
            //     url: "/admin/reseller-and-investor-overview",
            //    },
        ]
    },
    {
        title: 'Website Orders',
        label: 'website_orders',
        url: '#',
        items: [
            { title: 'All Orders', url: '/admin/orders' },
            // { title: "New Orders", url: "/admin/new-orders" },
            //  { title: "Assigned Orders", url: "/admin/assigned-orders" },
            { title: 'Create Order', url: '/admin/create-order' }
            //  { title: "Sales Executive", url: "/admin/sales-executive" },
            // { title: "Delivered Orders", url: "/admin/delivered-orders" },
            // { title: "Cancelled Orders", url: "/admin/cancelled-orders" },
            // { title: "Returned Orders", url: "/admin/returned-orders" },
            // { title: "Failed Orders", url: "/admin/failed-orders" },
            // { title: "Incomplete Orders Track", url: "/admin/incomplete-orders" },
            // { title: "No Response", url: "/admin/no-response" },
        ]
    },
    /* {
  title: "POS Sales",
  label: "pos_sales",
  url: "#",
  items: [
   { title: "All Sale", url: "/admin/pos/all" },
   { title: "Create POS Sale", url: "/admin/pos/create" },
   // { title: "POS Sale Report", url: "/admin/pos/report" },
  ],
 }, */
    {
        title: 'Products',
        label: 'products', // [📌 IF YOU CHANGE THIS, MAKE SURE TO UPDATE THE LOGIC IN THE APP-SIDEBAR COMPONENT]
        url: '#',
        items: [
            { title: 'All Products', url: '/admin/products' },
            { title: 'Create Product', url: '/admin/create-product' },
            { title: 'Stocks Report', url: '/admin/check-outlet-stocks' },
            { title: 'Print Barcode', url: '/admin/download-barcode' },
            { title: 'Product Reviews', url: '/admin/product-reviews' },
            { title: 'Product Faqs', url: '/admin/product-faqs' },
            { title: 'Return Policies', url: '/admin/return-policies' },
            { title: 'All Brands', url: '/admin/all-brands' }
            //    {
            //     title: "Update Warehouse Inventory",
            //     url: "/admin/inventory/warehouse-update",
            //    },
            //    {
            //     title: "Update Outlet Inventory",
            //     url: "/admin/inventory/outlet-update",
            //    },
            //    {
            //     title: "Inventory Transfer History",
            //     url: "/admin/inventory/transfer-history",
            //    },
        ]
    },
    {
        title: 'Purchases',
        label: 'purchases', // [📌 IF YOU CHANGE THIS, MAKE SURE TO UPDATE THE LOGIC IN THE APP-SIDEBAR COMPONENT]
        url: '#',
        items: [
            { title: 'All Purchase', url: '/admin/purchase/all' },
            { title: 'Add Purchase', url: '/admin/purchase/create' }
        ]
    },
    {
        title: 'Stock Transfers',
        label: 'stock_transfers', // [📌 IF YOU CHANGE THIS, MAKE SURE TO UPDATE THE LOGIC IN THE APP-SIDEBAR COMPONENT]
        url: '#',
        items: [
            { title: 'All Stock Transfers', url: '/admin/stock-transfer/all' },
            { title: 'Add Stock Transfer', url: '/admin/stock-transfer/create' }
        ]
    },
    {
        title: 'Stock Adjustments',
        label: 'stock_adjustments', // [📌 IF YOU CHANGE THIS, MAKE SURE TO UPDATE THE LOGIC IN THE APP-SIDEBAR COMPONENT]
        url: '#',
        items: [
            {
                title: 'All Stock Adjustments',
                url: '/admin/stock-adjustment/all'
            },
            {
                title: 'Add Stock Adjustment',
                url: '/admin/stock-adjustment/create'
            }
        ]
    },
    {
        title: 'Categories & Subcategories',
        label: 'categories_subcategories',
        url: '#',
        items: [
            { title: 'All Categories', url: '/admin/categories' },
            { title: 'All Subcategories', url: '/admin/sub-categories' },
            { title: 'Create Category', url: '/admin/add-new-category' },
            { title: 'Create Subcategory', url: '/admin/add-new-sub-category' }
        ]
    },

    {
        title: 'Business Locations',
        label: 'business_locations',
        url: '#',
        items: [
            {
                title: 'All Business Locations',
                url: '/admin/business-location/all'
            },
            {
                title: 'Add Business Location',
                url: '/admin/business-location/create'
            }
        ]
    },
    {
        title: 'Supplier',
        label: 'supplier',
        url: '#',
        items: [
            {
                title: 'All Suppliers',
                url: '/admin/suppliers/all'
            },
            {
                title: 'Add Suppliers',
                url: '/admin/suppliers/create'
            }
        ]
    },
    //  {
    //   title: "Coupons",
    //   label: "coupons",
    //   url: "#",
    //   items: [
    //    { title: "All Coupons", url: "/admin/coupons" },
    //    { title: "Add New Coupon", url: "/admin/add-new-coupon" },
    //    { title: "Private Coupons", url: "/admin/private-coupons" },
    //    { title: "Public Coupons", url: "/admin/public-coupons" },
    //    { title: "Active Coupons", url: "/admin/active-coupons" },
    //    { title: "Expired Coupons", url: "/admin/expired-coupons" },
    //   ],
    //  },
    {
        title: 'Customers',
        label: 'customers',
        url: '#',
        items: [
            { title: 'All Customers', url: '/admin/customers' },
            { title: 'Create Customer', url: '/admin/create-customer' }
        ]
    },
    {
        title: 'Coupon',
        label: 'coupon',
        url: '#',
        items: [
            { title: 'Create Coupon', url: '/admin/create-coupon' },
            { title: 'All Coupons', url: '/admin/coupons' }
        ]
    },
    {
        title: 'Content Management',
        label: 'content_management',
        url: '#',
        items: [
            //  { title: "Banner Update", url: "/admin/banner-update" },
            { title: 'Header', url: '/admin/header' },
            { title: 'Hero Section', url: '/admin/hero-section' },
            //    { title: "Featured Products", url: "/admin/featured-products" },
            { title: 'Global Offer', url: '/admin/offer-page' },
            {
                title: 'Shop by Category',
                url: '/admin/homepage/shop-by-category'
            },
            { title: 'Best Selling', url: '/admin/homepage/best-selling' },
            { title: 'New Arrivals', url: '/admin/homepage/new-arrivals' },
            { title: 'Leather Section', url: '/admin/homepage/leather-section' }
            //  {
            //   title: "Homepage Management",
            //   url: "#",
            //   items: [
            //    { title: "Shop by Category", url: "/admin/homepage/shop-by-category" },
            //    { title: "Best Selling", url: "/admin/homepage/best-selling" },
            //    { title: "New Arrivals", url: "/admin/homepage/new-arrivals" },
            //    { title: "Leather Section", url: "/admin/homepage/leather-section" },
            //   ],
            //  },
        ]
    },
    {
        title: 'Manage Staffs and Roles',
        label: 'staffs',
        url: '#',
        items: [
            { title: 'Manage Staffs', url: '/admin/staffs' },
            { title: 'Manage Roles', url: '/admin/role' }
        ]
    }
];
