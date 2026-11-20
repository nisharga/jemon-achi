import { z } from 'zod/v3';

const itemSchema = z.object({
    variant: z.string({ required_error: 'Variant ID is required' }),
    product: z.string({ required_error: 'Product ID is required' }),
    qty: z.number({ required_error: 'Quantity is required' }).default(1)
});

const expenseAppliedSchema = z.object({
    type: z.string({ required_error: 'Expense type is required' }),
    amount: z
        .number({ required_error: 'Expense amount is required' })
        .nonnegative(),
    note: z.string().optional()
});

export const StockTransferSchema = z.object({
    from: z.string({
        required_error: 'From business location is required'
    }),
    to: z.string({ required_error: 'To business location is required' }),
    items: z
        .array(itemSchema, { required_error: 'Items are required' })
        .min(1, 'At least one item is required'),
    expenses_applied: z.array(expenseAppliedSchema).optional()
});
