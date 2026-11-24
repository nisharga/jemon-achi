import { PermissionEnum } from '@/types/admin/permistion';

export const USER_PERMISSIONS = {
    order: [
        PermissionEnum.ORDER_CREATE,
        PermissionEnum.ORDER_DELETE,
        PermissionEnum.ORDER_UPDATE,
        PermissionEnum.ORDER_VIEW,
        PermissionEnum.ORDER_RETURN
    ],

    product: [
        PermissionEnum.PRODUCT_CREATE,
        PermissionEnum.PRODUCT_DELETE,
        PermissionEnum.PRODUCT_UPDATE,
        PermissionEnum.PRODUCT_VIEW
    ],

    purchase: [
        PermissionEnum.PURCHASE_CREATE,
        PermissionEnum.PURCHASE_UPDATE,
        PermissionEnum.PURCHASE_DELETE,
        PermissionEnum.PURCHASE_VIEW
    ],

    stock: [
        PermissionEnum.STOCK_CREATE,
        PermissionEnum.STOCK_UPDATE,
        PermissionEnum.STOCK_DELETE,
        PermissionEnum.STOCK_VIEW,
        PermissionEnum.STOCK_TRANSFER
    ],

    pos: [
        PermissionEnum.POS_CREATE,
        PermissionEnum.POS_UPDATE,
        PermissionEnum.POS_DELETE,
        PermissionEnum.POS_VIEW
    ],

    courier: [
        PermissionEnum.COURIER_CREATE,
        PermissionEnum.COURIER_UPDATE,
        PermissionEnum.COURIER_DELETE,
        PermissionEnum.COURIER_VIEW
    ],

    supplier: [
        PermissionEnum.SUPPLIER_CREATE,
        PermissionEnum.SUPPLIER_UPDATE,
        PermissionEnum.SUPPLIER_DELETE,
        PermissionEnum.SUPPLIER_VIEW
    ],

    business_locations: [
        PermissionEnum.BUSINESSES_LOCATIONS_CREATE,
        PermissionEnum.BUSINESSES_LOCATIONS_UPDATE,
        PermissionEnum.BUSINESSES_LOCATIONS_DELETE,
        PermissionEnum.BUSINESSES_LOCATIONS_VIEW
    ],

    user: [
        PermissionEnum.USER_CREATE,
        PermissionEnum.USER_UPDATE,
        PermissionEnum.USER_DELETE,
        PermissionEnum.USER_VIEW
    ],

    role: [
        PermissionEnum.ROLE_CREATE,
        PermissionEnum.ROLE_UPDATE,
        PermissionEnum.ROLE_DELETE,
        PermissionEnum.ROLE_VIEW
    ],

    cms: [
        PermissionEnum.CMS_CREATE,
        PermissionEnum.CMS_UPDATE,
        PermissionEnum.CMS_DELETE,
        PermissionEnum.CMS_VIEW
    ],

    faq: [
        PermissionEnum.FAQ_CREATE,
        PermissionEnum.FAQ_UPDATE,
        PermissionEnum.FAQ_DELETE,
        PermissionEnum.FAQ_VIEW
    ],

    review: [
        PermissionEnum.REVIEW_CREATE,
        PermissionEnum.REVIEW_UPDATE,
        PermissionEnum.REVIEW_DELETE,
        PermissionEnum.REVIEW_VIEW
    ],

    coupon: [
        PermissionEnum.COUPON_CREATE,
        PermissionEnum.COUPON_UPDATE,
        PermissionEnum.COUPON_DELETE,
        PermissionEnum.COUPON_VIEW
    ],

    report: [PermissionEnum.REPORT_VIEW],

    manage_permissions: [PermissionEnum.MANAGE_PERMISSIONS],

    overview: [
        PermissionEnum.OVERVIEW_CREATE,
        PermissionEnum.OVERVIEW_UPDATE,
        PermissionEnum.OVERVIEW_DELETE,
        PermissionEnum.OVERVIEW_VIEW
    ],

    overview_and_amount_access: [
        PermissionEnum.OVERVIEW_VIEW,
        PermissionEnum.PURCHASE_VALUE_VIEW,
        PermissionEnum.POTENTIAL_PROFIT_VIEW
    ]
};
