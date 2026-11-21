import { z } from 'zod/v3';

export const createReturnPolicySchema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    return_period_days: z.coerce
        .number()
        .int()
        .min(0, {
            message: 'Return period days must be a non-negative integer.'
        })
        .default(7),
    conditions: z.array(z.string()).default([]),
    is_active: z.boolean().default(true)
});

export const updateReturnPolicySchema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }).optional(),
    description: z
        .string()
        .min(1, { message: 'Description is required.' })
        .optional(),
    return_period_days: z.coerce
        .number()
        .int()
        .min(0, {
            message: 'Return period days must be a non-negative integer.'
        })
        .optional(),
    conditions: z.array(z.string()).optional(),
    is_active: z.boolean().optional()
});
