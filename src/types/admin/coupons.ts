export type TCoupons = {
    promo_code: string;
    status?: string;
    min_amount: number;
    discount: number;
    total_used?: number;
    is_public: boolean;
    expiredAt?: string;
};
