import { z } from 'zod/v3';

export const createSubCategorySchema = z.object({
    name_en: z.string().min(1, { message: 'English name is required.' }),
    name_bn: z.string().min(1, { message: 'Bengali name is required.' }),
    description_en: z.string().optional(),
    description_bn: z.string().optional(),
    category: z.string().min(1, { message: 'Category ID is required.' })
});

export const updateSubCategorySchema = z.object({
    name_en: z
        .string()
        .min(1, { message: 'English name is required.' })
        .optional(),
    name_bn: z
        .string()
        .min(1, { message: 'Bengali name is required.' })
        .optional(),
    description_en: z.string().optional(),
    description_bn: z.string().optional(),
    category: z.string().optional()
});
