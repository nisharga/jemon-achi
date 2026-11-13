import { z } from 'zod';

export const LoginSchema = z.object({
    phone_number: z
        .string()
        .trim()
        .length(11, 'Phone number should be 11 digits')
        .regex(/^\d+$/, 'Phone number must contain only digits'),
    password: z.string().min(8, 'Password must be at least 8 characters long')
});

export type TLoginSchema = z.infer<typeof LoginSchema>;
