'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v3';
import { Button } from '@/admin/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/admin/components/ui/form';
import { Input } from '@/admin/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { Textarea } from '@/admin/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCreateSupplierMutation } from '@/admin/redux/api-queries/supplier-slice';
import { CreateSupplierSchema } from '@/admin/schema/supplier';

type FormValues = z.infer<typeof CreateSupplierSchema>;

export function CreateSupplierForm() {
    const router = useRouter();

    // === RTK Query mutation ===
    const [createSupplier, { isLoading: isSubmitting }] =
        useCreateSupplierMutation();

    // === form default values ===
    const form = useForm<FormValues>({
        resolver: zodResolver(CreateSupplierSchema),
        defaultValues: {
            name: '',
            contact_id: '',
            address: '',
            email: '',
            phone: '',
            default_payment_terms: 'CASH ON DELIVERY',
            tax_info: '',
            notes: '',
            type: 'INDIVIDUAL'
        }
    });

    // === handle create supplier ===
    const handleCreateSupplier = async (values: FormValues) => {
        try {
            const payload = values;

            // Use RTK Query mutation
            const result: any = await createSupplier({ payload });

            if (result?.data?.success) {
                toast.success(
                    result.data.message || 'Supplier created successfully!'
                );
                router.replace('/admin/suppliers/all');
            } else if (result?.error) {
                // Handle RTK Query errors
                const errorMessage =
                    result.error?.data?.message ||
                    result.error?.error ||
                    'Failed to create supplier!';
                toast.error(errorMessage);

                // Show validation errors if available
                if (result.error?.data?.errors) {
                    const validationErrors = Object.entries(
                        result.error.data.errors
                    )
                        .map(
                            ([field, messages]) =>
                                `${field}: ${(messages as string[]).join(', ')}`
                        )
                        .join('\n');
                    toast.error(validationErrors);
                }
            }
        } catch (error: any) {
            console.log('CREATE SUPPLIER ERROR: ', error);

            // Show meaningful message
            if (error?.data?.errorMessages) {
                const err = error.data.errorMessages.map(
                    (errMessage: { path: string; message: string }) =>
                        errMessage?.message
                );

                if (err && err.length > 0) {
                    const errorMessage = err.join('\n');
                    toast.error(errorMessage);
                }
            } else if (error?.message) {
                toast.error(error.message);
            } else {
                toast.error('Something went wrong! Try again.');
            }
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleCreateSupplier)}
                className='space-y-6'
            >
                <div className='grid gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl md:grid-cols-2 lg:p-6 xl:grid-cols-4'>
                    {/* Basic Information */}
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Supplier Name{' '}
                                    <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter supplier name'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='contact_id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Contact ID{' '}
                                    <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='e.g., 1025'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='type'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Supplier Type{' '}
                                    <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select supplier type' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='COMPANY'>
                                            Company
                                        </SelectItem>
                                        <SelectItem value='INDIVIDUAL'>
                                            Individual
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='default_payment_terms'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Payment Terms{' '}
                                    <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select payment terms' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='CASH ON DELIVERY'>
                                            Cash on Delivery
                                        </SelectItem>
                                        <SelectItem value='NET_7'>
                                            Net 7 Days
                                        </SelectItem>
                                        <SelectItem value='NET_15'>
                                            Net 15 Days
                                        </SelectItem>
                                        <SelectItem value='NET_30'>
                                            Net 30 Days
                                        </SelectItem>
                                        <SelectItem value='NET_60'>
                                            Net 60 Days
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Contact Information */}
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Email{' '}
                                    <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type='email'
                                        placeholder='supplier@example.com'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Phone{' '}
                                    <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='+8801911223344'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='address'
                        render={({ field }) => (
                            <FormItem className='xl:col-span-2'>
                                <FormLabel>
                                    Address{' '}
                                    <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='32/A, Chawk Bazar, Chattogram'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Additional Information */}
                    <FormField
                        control={form.control}
                        name='tax_info'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tax Information</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='NID: 1987654321'
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormDescription>
                                    e.g., NID, TIN, VAT number
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='notes'
                        render={({ field }) => (
                            <FormItem className='xl:col-span-3'>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder='e.g., Supplies fresh fish daily'
                                        className='min-h-[80px]'
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='ms-auto w-fit'>
                    <Button
                        type='submit'
                        variant='default'
                        size='lg'
                        className='min-w-[150px]'
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />{' '}
                                Creating...
                            </>
                        ) : (
                            'Create Supplier'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
