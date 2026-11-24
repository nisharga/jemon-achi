import type { Key } from 'react';
import { IBusiness_location } from './business-location';
import { TCoupons } from './coupons';
import { TProduct } from './product';
import { TTransaction } from './transaction';
import { IRoles, TUser } from './user';

// Variant combination for selected attribute values (e.g., Size: M, Color: Red)
export interface IVariantCombination {
    attribute_values: {
        [key: string]: string; // e.g., { Size: "M", Color: "Red" }
    };
    sku: string;
    image?: string; // optional: image for this variant
}

export type TOrder = {
    [x: string]: any;
    logs: any;
    status_history: any;
    _id: string;
    user: TUser;
    order_by: TUser['role'];
    payment_info: TTransaction;
    products: {
        product: TProduct;
        total_quantity: number;
        selected_variant?: IVariantCombination;
        discount_amount: number;
        discount_type: DiscountType; // "FLAT" or "PERCENTAGE"
        total_discount: number; // if discount type is percentage then calculate the discount depend on total price or if discount_type FLAT then total_discount = discount_amount
        total_price: number; // total_quantity *  price
        coin_per_order: number;
        shipping_cost: number; // one pice shipping cost
        shipping_cost_per_unit: number;
        total_shipping_cost: number; // if more then one product then (((total_quantity - 1) * shipping_cost_per_unit ) + shipping_cost  )
        is_free_delivery: boolean;
        status?: string;
    }[];
    status: string;
    transfer_to_courier: boolean;
    order_date: Date;
    order_serial_id: number;
    invoice_number: string;
    consignment_id?: number;
    tracking_code?: string;
    confirmed_date?: Date;
    courier_note?: string;
    courier_cod_amount?: number;
    estimated_delivery_time?: string;
    customer_name: string;
    customer_phone: string;
    customer_secondary_phone?: string;
    delivery_address: {
        division: string;
        district: string;
        thana: string;
        address: string;
    };
    assigned_business_location?: IBusiness_location;
    order_note?: string;
    system_message?: string[]; // system messages for the order, e.g., "Order confirmed", "Order dispatched"
    applied_coupon_discount?: number;
    coupon?: TCoupons;
    applied_coins_discount?: number;
    coins_used?: number;
    advance_payment_amount?: number; // applicable when delivery charge is free or big amount
    sub_total: number; // actual price of all products without discounts
    delivery_charge: number;
    total_discount: number; // total discount applied on the order and coins redeemed
    discount_logs?: {
        _id: Key | null | undefined;
        discount_type: DiscountType;
        discount_amount: number;
        applied_at: Date;
    }[];
    total_amount: number; // total amount after applying all discounts and delivery charges (sub_total - total_discount + delivery_charge)
    payable_amount: number; // amount to be paid by the customer after discounts and delivery charges if COD then here will be only delivery charge
    paid_amount: number; // total amount paid by the customer it will be update when payment successful
    is_assigned_to_business_location: boolean;
    is_delivery_charge_paid: boolean;
    COD: number; // Cash on Delivery amount, applicable when payment_type is CASH_ON_DELIVERY
    payment_type: 'CASH_ON_DELIVERY' | 'FULL_PAYMENT';
    manual_payment_info: IManualPaymentInfo;
    admin_notes: {
        note: string;
        added_at: Date;
        added_by: {
            _id: string;
            full_name: string;
            role: IRoles;
        };
        _id: string;
    }[];
    // "Have you called?" action tracking
    is_called?: boolean;
    call_logs?: {
        _id: string;
        called_by: string;
        called_by_name: string;
        called_at: Date;
    }[];
};

// Enum for order status
export enum OrderStatus {
    INCOMPLETE = 'INCOMPLETE', // When the customer places an order and needed to admin review
    PLACED = 'PLACED', // When the customer places an order and needed to admin review
    IN_REVIEW = 'IN_REVIEW', // Order is being verified/handled and assign to a branch
    HANDED_OVER_TO_COURIER = 'HANDED_OVER_TO_COURIER', // Courier has received the package
    IN_TRANSIT = 'IN_TRANSIT', // In courier transit. when courier authority change the status of the order and confirmed
    DELIVERED = 'DELIVERED', // Customer received the package
    RETURN_REQUESTED = 'RETURN_REQUESTED', // Customer initiated return
    RETURNED = 'RETURNED', // Returned and received
    CANCELLED = 'CANCELLED', // Order was cancelled
    FAILED = 'FAILED', // payment was failed
    // DELIVERING = "DELIVERING", // Payment failed or fulfillment failed
    NO_RESPONSE = 'NO_RESPONSE',
    PARTIAL = 'PARTIAL',
    PENDING_RETURN = 'PENDING_RETURN',
    PRE_ORDER = 'PRE_ORDER',
    PROCESSING = 'PROCESSING',
    AWAITING_STOCK = 'AWAITING_STOCK', // Order placed but items are out of stock, waiting for admin to accept/decline
    ACCEPTED = 'ACCEPTED' // Awaiting stock order accepted by admin, will be processed normally
}

export const orderStatusList: OrderStatus[] = [
    OrderStatus.INCOMPLETE,
    OrderStatus.NO_RESPONSE,
    OrderStatus.PLACED,
    OrderStatus.IN_REVIEW,
    OrderStatus.HANDED_OVER_TO_COURIER,
    OrderStatus.IN_TRANSIT,
    OrderStatus.DELIVERED,
    OrderStatus.RETURN_REQUESTED,
    OrderStatus.RETURNED,
    OrderStatus.CANCELLED,
    OrderStatus.FAILED,
    OrderStatus.PARTIAL,
    OrderStatus.PENDING_RETURN,
    OrderStatus.PRE_ORDER,
    OrderStatus.PROCESSING,
    OrderStatus.AWAITING_STOCK,
    OrderStatus.ACCEPTED
];

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

// Interface for manual payment info (for FULL_PAYMENT)
interface IManualPaymentInfo {
    sender_number?: string;
    trxId?: string;
    paid_amount?: number;
    files?: string[];
}
