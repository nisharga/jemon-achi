import { z } from 'zod/v3';

export const CouponSchema = z.object({
    code: z.string().min(1, 'Required'),
    description: z.string().min(1, 'Required'),
    discountType: z.enum(['PERCENTAGE', 'FLAT']),
    discountValue: z.coerce.number().min(0),
    maxDiscountAmount: z.coerce.number().min(0),
    minOrderAmount: z.coerce.number().min(0),

    // Relations / Applicability
    categoryIds: z.array(z.string()).default([]),
    subcategoryIds: z.array(z.string()).default([]),
    sub_subcategoryIds: z.array(z.string()).default([]),
    productIds: z.array(z.string()).default([]),
    variant: z.array(z.string()).default([]),
    userIds: z.array(z.string()).default([]),

    // Usage & Constraints
    firstOrderOnly: z.boolean().default(false),
    usageLimit: z.coerce.number().optional(),
    usagePerUser: z.coerce.number().optional(),

    // Dates
    startAt: z.coerce.date(),
    expireAt: z.coerce.date(),
    isActive: z.boolean().default(true)
});

export type CouponFormValues = z.infer<typeof CouponSchema>;
