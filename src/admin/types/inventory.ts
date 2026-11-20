import { TProduct, TVariantCombination } from './product';

export type TInventoryTransferHistory = {
    _id: string;
    products: Array<{
        product: TProduct;
        attributes: string[];
        variants: TVariantCombination;
        _id: string;
    }>;
    from: {
        _id: string;
        name: string;
        slug: string;
        location: {
            latitude: number;
            longitude: number;
            _id: string;
        };
        address: {
            division: string;
            district: string;
            thana: string;
            local_address: string;
            _id: string;
        };
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    to: {
        _id: string;
        name: string;
        slug: string;
        location: {
            latitude: number;
            longitude: number;
            _id: string;
        };
        address: {
            division: string;
            district: string;
            thana: string;
            local_address: string;
            _id: string;
        };
        type: string;
        createdAt: string;
        updatedAt: string;
    };
    transferBy: {
        _id: string;
        phone_number: string;
        available_coins: number;
        cancelled_orders: number;
        claimed_coins: any[];
        completed_orders: number;
        createdAt: string;
        favorite_items: any[];
        full_name: string;
        is_verified_number: boolean;
        password: string;
        pending_orders: number;
        returned_orders: number;
        role: string;
        status: string;
        total_orders: number;
        updatedAt: string;
        used_coins_history: any[];
        pos_orders: string[];
    };
    createdAt: string;
    updatedAt: string;
};
