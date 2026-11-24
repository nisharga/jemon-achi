'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v3';
import { Button } from '@/components/ui/admin-button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/admin-form';
import { Input } from '@/components/ui/admin-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
    useGetSingleSupplierQuery,
    useUpdateSupplierMutation
} from '@/redux/admin/api/supplier-slice';
import { CreateSupplierSchema } from '@/schema/supplier';
import { useEffect } from 'react';

type FormValues = z.infer<typeof CreateSupplierSchema>;

export function CreateSupplierForm() {
    const router = useRouter();

    const params = useParams();
    const supplierId = params?.id;
    console.log('params: ', supplierId);

    // === get product data by id ===
    const { data, isLoading } = useGetSingleSupplierQuery(
        {
            supplier_id: supplierId
        },
        {
            skip: !supplierId
        }
    );
    const supplier = data?.data;
    console.log('supplier: ', supplier);

    // === RTK Query mutation ===
    const [updateSupplier, { isLoading: isSubmitting }] =
        useUpdateSupplierMutation();

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

    const {
        formState: { dirtyFields }
    } = form;

    // === handle create supplier ===
    const handleUpdateSupplier = async (values: FormValues) => {
        try {
            // 2. Filter to get only changed values
            const changedValues = Object.keys(dirtyFields).reduce(
                (acc, key) => {
                    const field = key as keyof FormValues;
                    acc[field] = values[field] as any;
                    return acc;
                },
                {} as Partial<FormValues>
            );

            // Don't call the API if nothing changed
            if (Object.keys(changedValues).length === 0) {
                toast.info('No changes detected.');
                return;
            }

            await updateSupplier({
                supplier_id: supplierId,
                payload: changedValues // Send only the delta
            }).unwrap(); // Using unwrap() is cleaner for try/catch

            toast.success('Supplier updated successfully!');
            router.replace('/admin/suppliers/all');
        } catch (error: any) {
            console.log('error: ', error);
            // ... your existing error handling
        }
    };

    //  Monitor the supplier data
    useEffect(() => {
        if (supplier) {
            form.reset({
                name: supplier.name || '',
                contact_id: supplier.contact_id?.toString() || '',
                address: supplier.address || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                // Fix Enum: Ensure 'BUSINESS' from API becomes 'COMPANY' for the form
                type:
                    supplier.type === 'BUSINESS'
                        ? 'COMPANY'
                        : supplier.type || 'INDIVIDUAL',
                // Fix Enum: Ensure the value is a valid member of your Zod enum
                default_payment_terms:
                    supplier.default_payment_terms || 'CASH ON DELIVERY',
                tax_info: supplier.tax_info || '',
                notes: supplier.notes || ''
            });
        }
    }, [supplier, form]);

    if (isLoading) {
        return 'Loading...';
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleUpdateSupplier)}
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
                            'Update Supplier'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
