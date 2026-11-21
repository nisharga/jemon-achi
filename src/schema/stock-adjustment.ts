import { z } from 'zod/v3';

export const productSchema = z.object({
    product_note: z.string().optional(),
    stock: z.string(),
    selected_variant: z.object({
        attributes: z.array(z.string()),
        attribute_values: z.record(z.string(), z.string()),
        regular_price: z.number(),
        sale_price: z.number(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        image: z.string().optional().nullable(),
        product: z.string()
    }),
    product: z.string(),
    quantity: z.number()
});

export const StockAdjustmentSchema = z.object({
    business_location: z.string(),
    action: z.enum(['DEDUCTION', 'ADDITION']),
    products: z.array(productSchema).min(1),
    note: z.string().optional()
});
