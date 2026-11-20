import { TProduct, TVariantCombination } from './product';

// === Barcode Scan API Response ===
export interface PosScanVariant {
    attribute_values: Record<string, string>;
    sku: string;
    barcode: string;
    regular_price: number;
    sale_price: number;
    image?: string;
    total_sold?: number;
    available_quantity: number;
    _id: string;
}

export interface VariantItem {
    productId: string;
    productName: string;
    thumbnail?: string;
    variant: PosScanVariant;
}

export interface CartItemUI {
    // fields the API needs:
    product: string;
    quantity: number;
    product_discount: { type: DiscountCalculationType; value: number | null };
    selected_variant: PosScanVariant;
    // UI‐only metadata:
    productName: string;
    thumbnail?: string;
}

export interface PosScanProduct {
    _id: string;
    name: string;
    price: number;
    stock: number;
    variants: PosScanVariant[];
}

export interface PosScanResponse {
    success: boolean;
    data: {
        product: TProduct;
        variant: PosScanVariant;
    };
    message?: string;
}

// === Discount Types ===
export enum DiscountCalculationType {
    PERCENTAGE = 'PERCENTAGE',
    FLAT = 'FLAT'
}

// === Sale API Request Payload ===
export interface PosSaleProductPayload {
    product: string; // Product ID
    quantity: number;
    product_discount: {
        type: DiscountCalculationType;
        value: number;
    };
    selected_variant: PosScanVariant;
}

export interface IPosSaleProduct {
    _id: string;
    product: TProduct | string;
    quantity: number;
    total_price: number;
    selected_variant: TVariantCombination;
    product_discount: { type: DiscountCalculationType; value: number };
}

export interface PosOverallDiscountPayload {
    type: DiscountCalculationType;
    value: number;
}

export enum PaymentMethod {
    Cash = 'Cash',
    Advance = 'Advance',
    Card = 'Card',
    Cheque = 'Cheque',
    Bank_Transfer = 'Bank_Transfer',
    Other = 'Other',
    Bkash = 'Bkash',
    Nagad = 'Nagad',
    Rocket = 'Rocket'
}

export interface PosSaleRequest {
    customer_phone?: string;
    customer_name?: string;
    business_location: string;
    sale_date?: any; // ISO date string, defaults to now if omitted
    products: PosSaleProductPayload[];
    overall_discount?: PosOverallDiscountPayload;
    paid_amount: number;
    payment_method: PaymentMethod;
    tax?: number;
    payment_account?: string;
    sale_note?: string;
    payment_note?: string;
}

// === Sale API Response ===
export interface PosSaleResponse {
    success: boolean;
    data: {
        saleId: string;
        invoiceNumber: string;
        total_amount: number;
        paid_amount: number;
        change_amount: number;
        outstanding_amount: number;
        sale_date: string;
    };
    message?: string;
}

export type CartItemPatch = {
    quantity?: number;
    product_discount?: {
        type?: DiscountCalculationType;
        value?: number | null; // allow blank in UI
    };
};
