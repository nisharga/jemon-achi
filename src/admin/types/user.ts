export type IAddress = {
    division: string;
    district: string;
    thana: string;
    local_address: string;
};

type IUsedCoins = {
    coins: number;
    discount: number;
    reference: {
        name: 'ORDER';
        id: string;
    };
};

type IClaimedCoins = {
    coins: number;
    discount: number;
    reference: {
        name: 'ORDER';
        id: string;
    };
};

// export const USER_ROLE = {
//   USER: "USER",
//   RESELLER: "RESELLER",
//   INVESTOR: "INVESTOR",
//   SUPER_ADMIN: "SUPER_ADMIN",
//   ADMIN: "ADMIN",
//   OUTLET_MANAGER: "OUTLET_MANAGER",
//   INVENTORY_MANAGER: "INVENTORY_MANAGER",
//   OUTLET_STAFF: "OUTLET_STAFF",
//   GUEST: "GUEST",
// } as const;

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
    ACCOUNT_MANAGER: 'ACCOUNT_MANAGER'
} as const;

export enum UserRoleEnum {
    // Platform roles
    FOUNDER = 'FOUNDER',
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',

    // Sales & Support roles
    SALES_EXECUTIVE = 'SALES_EXECUTIVE',
    SUPPORT_ADMIN = 'SUPPORT_ADMIN',
    CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
    CUSTOMER_EXECUTIVE = 'CUSTOMER_EXECUTIVE',

    // Management roles
    OUTLET_MANAGER = 'OUTLET_MANAGER',
    WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
    INVENTORY_MANAGER = 'INVENTORY_MANAGER',
    ACCOUNT_MANAGER = 'ACCOUNT_MANAGER'
}

export type IRoles = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type IStatus =
    | 'ACTIVE'
    | 'INACTIVE'
    | 'DELETED'
    | 'BANNED'
    | 'PENDING'
    | 'pending'
    | 'approved';

export type TUser = {
    _id: string;
    full_name: string;
    phone_number: string;
    email?: string;
    profile_url?: string;
    role: IRoles;
    outlet?: any;
    address?: IAddress;
    userType: string;
    password: string;
    status: IStatus;
    is_verified_number: boolean;
    date_of_birth?: string;
    gender?: string;
    default_delivery_address?: IAddress;
    permanent_address?: IAddress;
    favorite_items?: string[];
    available_coins?: number;
    used_coins_history?: IUsedCoins[];
    claimed_coins?: IClaimedCoins[];
    total_orders?: number;
    pending_orders?: number;
    completed_orders?: number;
    returned_orders?: number;
    cancelled_orders?: number;
    incomplete_orders?: number;
    last_order_date?: string;
    last_active?: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
    role_ref?: string;
    rating?: number;
    verifiedPurchase?: boolean;
    question?: string;
    createdBy?: string;
    product: {
        name: string;
        thumbnail: string;
        slug: string;
    };
    media: {
        url: string;
    }[];
    title: string;
    content: string;
};

//

export interface IRole {
    _id: string;
    role_name: string;
    permissions: any[] | string[];
    created_by: string;
    createdAt: string; // or Date if you parse it
    updatedAt: string;
    __v: number;
}

// Useful for when you are creating a role and don't have the ID or timestamps yet
export type IRoleCreatePayload = Pick<IRole, 'role_name' | 'permissions'>;
