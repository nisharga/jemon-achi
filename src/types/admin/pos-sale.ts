import { IBusiness_location } from './business-location';
import { TProduct } from './product';
import { TUser } from './user';

// Variant combination for selected attribute values (e.g., Size: M, Color: Red)
export interface IVariantCombination {
    attribute_values: {
        [key: string]: string; // e.g., { Size: "M", Color: "Red" }
    };
    sku: string;
    sale_price: number;
    regular_price: number;
    barcode: string;
    image?: string; // optional: image for this variant
}
export type IPOSSale = {
    _id: string;
    user: TUser;
    products: ISaleProduct[];
    business_location: IBusiness_location;
    sale_date: Date;
    tax: number;

    sale_serial_id: number;
    invoice_number: string;
    customer_phone?: string;
    sale_note?: string;
    payment_note?: string;

    overall_discount: { type: 'PERCENTAGE' | 'FLAT'; value: number };
    total_discount: number;
    sub_total: number;
    payment_status: 'DUE' | 'PAID' | 'PARTIAL';
    due_amount: number;
    paid_amount: number;
    partial_amount: number;
    total_cost: number;
    profit: number;
    total_amount: number;
    payment_method:
        | 'Cash'
        | 'Advance'
        | 'Card'
        | 'Cheque'
        | 'Bank_Transfer'
        | 'Other'
        | 'Bkash'
        | 'Nagad'
        | 'Rocket';
    payment_account?: string;
    created_by?: any[];
};

// Enum for payment type
export enum PaymentType {
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
    FULL_PAYMENT = 'FULL_PAYMENT'
}

// Enum for discount type
export enum DiscountType {
    FLAT = 'FLAT',
    PERCENTAGE = 'PERCENTAGE'
}

export const PAYMENT_STATUSES = ['DUE', 'PAID', 'PARTIAL'];
export const PAYMENT_METHODS = [
    'Cash',
    'Advance',
    'Card',
    'Cheque',
    'Bkash',
    'Nagad',
    'Rocket',
    'Other'
];

// Interface for product in order
export interface ISaleProduct {
    _id: string;
    product: TProduct;
    quantity: number;
    selected_variant: IVariantCombination;
    total_price: number;
    total_cost: number;
    product_discount: {
        type: DiscountType;
        value: number;
    };
}
