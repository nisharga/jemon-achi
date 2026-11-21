import { PURCHASE_STATUS_ENUM } from '@/types/purchase';
import { z } from 'zod/v3';

const purchaseItemSchema = z.object({
    variant: z.string({ required_error: 'Variant ID is required' }),
    product: z.string({ required_error: 'Product ID is required' }),
    qty: z.number({ required_error: 'Quantity is required' }).default(1),
    unit_cost: z.coerce
        .number({ required_error: 'Unit cost is required' })
        .nonnegative(),
    discount: z.coerce.number({ required_error: 'Discount is required' }).min(0)
    // tax: z.number().optional().default(0),
    // lot_number: z.string().optional(),
    // expiry_date: z.coerce.date().optional(),
});

const expenseAppliedSchema = z.object({
    type: z.string({ required_error: 'Expense type is required' }),
    amount: z
        .number({ required_error: 'Expense amount is required' })
        .nonnegative(),
    note: z.string().optional()
});

export const PurchaseSchema = z.object({
    business_location: z.string({
        required_error: 'Business location is required'
    }),
    supplier: z.string({ required_error: 'Supplier is required' }),
    items: z
        .array(purchaseItemSchema, { required_error: 'Items are required' })
        .min(1, 'At least one item is required'),
    expenses_applied: z.array(expenseAppliedSchema).optional(),
    attachments: z.array(z.string()).optional(),
    status: z.enum(
        Object.values(PURCHASE_STATUS_ENUM) as [string, ...string[]]
    ),
    total_cost: z.coerce.number().optional(),
    purchase_date: z.date({
        required_error: 'Purchase date is required'
    })
});

export const EditPurchaseSchema = z.object({
    business_location: z.string().optional(),
    supplier: z.string().optional(),
    items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
    expenses_applied: z.array(expenseAppliedSchema).optional(),
    attachments: z.array(z.string()).optional(),
    total_cost: z.coerce.number().optional(),
    purchase_date: z.date({
        required_error: 'Purchase date is required'
    })
});
