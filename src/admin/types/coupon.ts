export interface ICoupon {
    _id: string;
    code: string;
    description: string; // HTML string from FormEditor
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    maxDiscountAmount: number;
    minOrderAmount: number;

    // Relations (Stored as IDs)
    categoryIds: string[];
    subcategoryIds: string[];
    sub_subcategoryIds: string[];
    productIds: string[];
    variant: string[];
    userIds: string[];

    // Usage tracking
    firstOrderOnly: boolean;
    usageLimit: number;
    usagePerUser: number;
    usedCount: number;
    usedBy: string[]; // Typically an array of User IDs

    // Status & Dates
    isActive: boolean;
    startAt: string; // ISO Date String
    expireAt: string; // ISO Date String

    // Metadata
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// Partial type for API requests (e.g., for Update/Patch)
export type TUpdateCoupon = Partial<
    Omit<ICoupon, '_id' | 'createdAt' | 'updatedAt' | '__v'>
>;
