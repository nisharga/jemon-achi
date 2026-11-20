import { z } from 'zod/v3';

// Define the Zod schema for the user profile JSON
export const staffSchema = z
    .object({
        full_name: z.string().min(1, 'Full name is required'),

        phone_number: z
            .string()
            .min(11, 'Phone number should be 11 digits')
            .max(11, 'Phone number should be 11 digits'),

        email: z
            .string()
            .min(1, {
                message: 'Email is required'
            })
            .email({
                message: 'Invalid email'
            }),

        role: z.string(), // This will hold the name
        role_ref: z.string(), // This will hold the _id

        outlet: z.string().optional(),

        password: z
            .string({
                required_error: 'Password is required',
                invalid_type_error: 'Password must be a string'
            })
            .min(8, 'Password must be at least 8 characters long'),

        confirm_Password: z
            .string({
                required_error: 'Confirm password is required',
                invalid_type_error: 'Confirm password must be a string'
            })
            .min(8, 'Confirm password must be at least 8 characters long'),

        gender: z.enum(['MALE', 'FEMALE'], {
            required_error: 'Gender is required',
            invalid_type_error: 'Invalid gender value'
        })
    })
    .refine((data) => data.password === data.confirm_Password, {
        message: "Passwords don't match",
        path: ['confirm_Password']
    });

export const updateStaffSchema = z.object({
    full_name: z.string().optional(),

    phone_number: z
        .string()
        .min(11, 'Phone number should be 11 digits')
        .max(11, 'Phone number should be 11 digits'),

    email: z.string().optional(),

    role: z.string().optional(), // This will hold the name
    role_ref: z.string().optional(), // This will hold the _id

    outlet: z.string().optional(),

    gender: z.string().optional(),

    password: z
        .string()
        /*  .min(8, "Password must be at least 8 characters long") */
        .optional()
});
