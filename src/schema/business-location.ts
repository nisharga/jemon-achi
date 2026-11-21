import { z } from 'zod/v3';

export const CreateBusinessLocationSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters.'
    }),
    address: z.object({
        division: z.string().optional(),
        district: z.string().min(1, {
            message: 'District is required.'
        }),
        thana: z.string().min(1, {
            message: 'Thana is required.'
        }),
        zip_code: z.string().optional(),
        local_address: z.string().min(5, {
            message: 'Local address must be at least 5 characters.'
        })
    }),
    location: z
        .object({
            latitude: z.number()?.optional(),
            longitude: z.number()?.optional()
        })
        ?.optional(),
    type: z.enum(['OUTLET', 'WAREHOUSE'], {
        required_error: 'Please select a location type.'
    }),
    manager_name: z.string()?.optional(),
    contact_numbers: z.array(z.string())?.optional()
});
