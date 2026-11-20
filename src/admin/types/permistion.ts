export enum PermissionEnum {
    ORDER_CREATE = 'order.create',
    ORDER_DELETE = 'order.delete',
    ORDER_UPDATE = 'order.update',
    ORDER_VIEW = 'order.view',
    ORDER_RETURN = 'order.return',

    PRODUCT_CREATE = 'product.create',
    PRODUCT_DELETE = 'product.delete',
    PRODUCT_UPDATE = 'product.update',
    PRODUCT_VIEW = 'product.view',

    USER_CREATE = 'user.create',
    USER_UPDATE = 'user.update',
    USER_DELETE = 'user.delete',
    USER_VIEW = 'user.view',

    STOCK_CREATE = 'stock.create',
    STOCK_UPDATE = 'stock.update',
    STOCK_DELETE = 'stock.delete',
    STOCK_VIEW = 'stock.view',
    STOCK_TRANSFER = 'stock.transfer',

    PURCHASE_CREATE = 'purchase.create',
    PURCHASE_UPDATE = 'purchase.update',
    PURCHASE_DELETE = 'purchase.delete',
    PURCHASE_VIEW = 'purchase.view',

    REPORT_VIEW = 'report.view',

    MANAGE_PERMISSIONS = 'manage-permissions',

    CMS_CREATE = 'cms.create',
    CMS_UPDATE = 'cms.update',
    CMS_DELETE = 'cms.delete',
    CMS_VIEW = 'cms.view',

    COURIER_CREATE = 'courier.create',
    COURIER_UPDATE = 'courier.update',
    COURIER_DELETE = 'courier.delete',
    COURIER_VIEW = 'courier.view',

    SUPPLIER_CREATE = 'supplier.create',
    SUPPLIER_UPDATE = 'supplier.update',
    SUPPLIER_DELETE = 'supplier.delete',
    SUPPLIER_VIEW = 'supplier.view',

    BUSINESSES_LOCATIONS_CREATE = 'business_locations.create',
    BUSINESSES_LOCATIONS_UPDATE = 'business_locations.update',
    BUSINESSES_LOCATIONS_DELETE = 'business_locations.delete',
    BUSINESSES_LOCATIONS_VIEW = 'business_locations.view',

    POS_CREATE = 'pos.create',
    POS_UPDATE = 'pos.update',
    POS_DELETE = 'pos.delete',
    POS_VIEW = 'pos.view',

    OVERVIEW_CREATE = 'overview.create',
    OVERVIEW_UPDATE = 'overview.update',
    OVERVIEW_DELETE = 'overview.delete',
    OVERVIEW_VIEW = 'overview.view',

    PURCHASE_VALUE_VIEW = 'purchase.value.view',
    POTENTIAL_PROFIT_VIEW = 'potential.profit.view',

    ROLE_CREATE = 'role.create',
    ROLE_UPDATE = 'role.update',
    ROLE_DELETE = 'role.delete',
    ROLE_VIEW = 'role.view',

    FAQ_CREATE = 'faq.create',
    FAQ_UPDATE = 'faq.update',
    FAQ_DELETE = 'faq.delete',
    FAQ_VIEW = 'faq.view',

    REVIEW_CREATE = 'review.create',
    REVIEW_UPDATE = 'review.update',
    REVIEW_DELETE = 'review.delete',
    REVIEW_VIEW = 'review.view',

    COUPON_CREATE = 'coupon.create',
    COUPON_UPDATE = 'coupon.update',
    COUPON_DELETE = 'coupon.delete',
    COUPON_VIEW = 'coupon.view'
}

export enum PermissionGroup {
    ORDER = 'Order',
    PRODUCT = 'Product',
    USER = 'User',
    REPORT = 'Report',
    PAYMENT = 'Payment',
    ADMIN = 'Admin'
}

export type UserPermissions = keyof typeof PermissionEnum;
