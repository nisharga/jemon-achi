export type TReturnPolicy = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    return_period_days: number;
    conditions: string[];
    is_active: boolean;
    createdAt?: string;
    updatedAt?: string;
};
