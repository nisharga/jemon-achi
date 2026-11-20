// editPosSaleSchema.ts
import { z } from 'zod/v3';

export const discountTypeEnum = z.enum(['FLAT', 'PERCENTAGE']);
export const paymentStatusEnum = z.enum(['DUE', 'PAID', 'PARTIAL'] as const);
export const paymentMethodEnum = z.enum([
    'Cash',
    'Advance',
    'Card',
    'Cheque',
    'Bank_Transfer',
    'Other',
    'Bkash',
    'Nagad',
    'Rocket'
] as const);

export const variantCombinationSchema = z
    .object({
        attribute_values: z.record(z.string()),
        sku: z.string(),
        sale_price: z.coerce.number(),
        regular_price: z.coerce.number(),
        barcode: z.string(),
        image: z.string().optional()
    })
    .partial();

export const saleProductSchema = z
    .object({
        product: z.any(),
        quantity: z.coerce.number(),
        selected_variant: variantCombinationSchema,
        total_price: z.coerce.number(),
        total_cost: z.coerce.number(),
        product_discount: z
            .object({
                type: discountTypeEnum,
                value: z.coerce.number()
            })
            .partial()
    })
    .partial();

export const editPosSaleSchema = z
    .object({
        _id: z.string(),
        products: z.array(saleProductSchema),
        sale_date: z.coerce.date(),
        // tax: z.coerce.number(),
        // sale_serial_id: z.coerce.number(),
        invoice_number: z.string(),
        customer_phone: z.string(),
        sale_note: z.string(),
        payment_note: z.string(),
        overall_discount: z
            .object({
                type: discountTypeEnum,
                value: z.coerce.number()
            })
            .partial(),
        total_discount: z.coerce.number(),
        sub_total: z.coerce.number(),
        payment_status: paymentStatusEnum,
        due_amount: z.coerce.number(),
        paid_amount: z.coerce.number(),
        partial_amount: z.coerce.number(),
        total_cost: z.coerce.number(),
        profit: z.coerce.number(),
        total_amount: z.coerce.number(),
        payment_method: paymentMethodEnum,
        payment_account: z.string()
    })
    .partial();
