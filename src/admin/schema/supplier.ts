import { z } from 'zod/v3';

export const CreateSupplierSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters.'
    }),
    contact_id: z.string().min(1, {
        message: 'Contact ID is required.'
    }),
    address: z.string().min(5, {
        message: 'Address must be at least 5 characters.'
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.'
    }),
    phone: z.string().min(10, {
        message: 'Phone number must be at least 10 digits.'
    }),
    default_payment_terms: z.enum(
        ['CASH ON DELIVERY', 'NET_7', 'NET_15', 'NET_30', 'NET_60'],
        {
            required_error: 'Please select payment terms.'
        }
    ),
    tax_info: z.string().optional(),
    notes: z.string().optional(),
    type: z.enum(['COMPANY', 'INDIVIDUAL'], {
        required_error: 'Please select a supplier type.'
    })
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;

export const UpdateSupplierSchema = CreateSupplierSchema.partial();
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
