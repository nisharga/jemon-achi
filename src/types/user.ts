export const USER_ROLE = {
    // Platform roles
    FOUNDER: 'FOUNDER',
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',

    // Sales & Support roles
    SALES_EXECUTIVE: 'SALES_EXECUTIVE',
    SUPPORT_ADMIN: 'SUPPORT_ADMIN',
    CUSTOMER_SUPPORT: 'CUSTOMER_SUPPORT',
    CUSTOMER_EXECUTIVE: 'CUSTOMER_EXECUTIVE',

    // Management roles
    OUTLET_MANAGER: 'OUTLET_MANAGER',
    WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
    INVENTORY_MANAGER: 'INVENTORY_MANAGER',
    ACCOUNT_MANAGER: 'ACCOUNT_MANAGER',

    // Regular account (the backend also lets these log in to the admin API)
    USER: 'USER'
} as const;

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type TUserStatus =
    'ACTIVE' | 'INACTIVE' | 'DELETED' | 'BANNED' | 'PENDING';

export type TUser = {
    _id: string;
    full_name: string;
    phone_number: string;
    email?: string;
    profile_url?: string;
    role: TUserRole;
    permissions?: string[];
    status?: TUserStatus;
    createdAt?: string;
    updatedAt?: string;
};
