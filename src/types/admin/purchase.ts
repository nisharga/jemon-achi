import { IBusiness_location } from './business-location';
import { TProduct, TVariantCombination } from './product';
import { TSupplier } from './supplier';
import { TUser } from './user';

export interface IPurchase {
    _id: string;
    created_by: TUser; // "User" // req.user.id same
    received_by: TUser; // "User" // req.user.id same
    received_at: Date;
    business_location: IBusiness_location;
    purchase_number: number; // incremental
    supplier: TSupplier;
    status: PURCHASE_STATUS_ENUM;
    total_cost: number;
    items: IPurchaseItem[];
    expenses_applied: IExpenseApplied[];
    attachments?: string[];
    created_at: Date;
    updated_at: Date;
    purchase_date: Date;
    additional_notes?: string;
}

export interface IPurchaseItem {
    variant: TVariantCombination; // "VariantCombination"
    product: TProduct;
    qty: number;
    unit_cost: number;
    discount: number;
    tax: number;
    lot_number?: string;
    expiry_date?: Date;
}

export interface IExpenseApplied {
    type: string;
    amount: number;
    note: string;
}

export enum PURCHASE_STATUS_ENUM {
    DRAFT = 'draft',
    ORDERED = 'ordered',
    RECEIVED = 'received',
    CANCELLED = 'cancelled'
}

export const PURCHASE_STATUSES = [
    PURCHASE_STATUS_ENUM.DRAFT,
    PURCHASE_STATUS_ENUM.ORDERED,
    PURCHASE_STATUS_ENUM.RECEIVED,
    PURCHASE_STATUS_ENUM.CANCELLED
];
