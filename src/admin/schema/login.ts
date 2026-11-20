import { z } from 'zod/v3';

export const LoginSchema = z.object({
    phone_number: z
        .string()
        .min(11, 'Phone number should be 11 digits')
        .max(11, 'Phone number should be 11 digits'),
    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string'
        })
        .min(8, 'Password must be at least 8 characters long')
});
