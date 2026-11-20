'use client';
import type { Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/admin/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from '@/admin/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { Switch } from '@/admin/components/ui/switch';
import { MultiSelect } from '@/admin/components/ui/multi-select';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { useGetAllCategoriesQuery } from '@/admin/redux/api-queries/category-api';
import {
    useGetAllSubCategoriesByCategoryIdQuery,
    useGetAllSubSubCategoriesByCategoryIdQuery
} from '@/admin/redux/api-queries/subcategory-api';
import { FormEditor, FormInput } from '@/admin/components/form-items';
import { CouponSchema, CouponFormValues } from '@/admin/schema/coupon';
import {
    useGetAllProductsQuery,
    useGetAllProductVariantQuery
} from '@/admin/redux/api-queries/product-api';
import { FormDatePicker } from '@/admin/components/form-items/form-date-picker';
import { useCreateCouponMutation } from '@/admin/redux/api-queries/coupon-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const CreateCouponForm = () => {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<
        string | undefined
    >(undefined);
    const [selectedSubCategory, setSelectedSubCategory] = useState<
        string | undefined
    >(undefined);

    // New state to track the product selected in the dropdown to fetch its variants
    const [lastSelectedProductId, setLastSelectedProductId] = useState<
        string | undefined
    >(undefined);

    // === Categories API ===
    const { data: categoriesData } = useGetAllCategoriesQuery({
        page: 1,
        limit: 100
    });
    const categoryOptions =
        categoriesData?.data?.data?.map((cat: any) => ({
            label: cat?.name_en,
            value: cat?._id
        })) || [];

    const { data: subCategoriesData } = useGetAllSubCategoriesByCategoryIdQuery(
        { category_id: selectedCategory },
        { skip: !selectedCategory }
    );
    const subCategoryOptions =
        subCategoriesData?.data?.map((sub: any) => ({
            label: sub?.name_en,
            value: sub?._id
        })) || [];

    const { data: subSubCategoriesData } =
        useGetAllSubSubCategoriesByCategoryIdQuery(
            { category_id: selectedSubCategory },
            { skip: !selectedSubCategory }
        );
    const subSubCategoryOptions =
        subSubCategoriesData?.data?.sub_subcategories?.map((ss: any) => ({
            label: ss?.name_en,
            value: ss?._id
        })) || [];

    // === Product & Variant API ===
    const { data: productData } = useGetAllProductsQuery({ limit: 100 }); // Adjust search as needed
    const productOptions =
        productData?.data?.data?.map((pd: any) => ({
            label: pd?.name,
            value: pd?._id
        })) || [];

    const { data: variantData } = useGetAllProductVariantQuery(
        { product_id: lastSelectedProductId },
        { skip: !lastSelectedProductId }
    );

    // === API Hooks ===
    const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();

    // Mapping variants to show attributes like "Size: 40, Color: Red"
    const variantOptions =
        variantData?.data?.map((v: any) => {
            const labels = Object.entries(v.attribute_values || {})
                .map(([key, val]) => `${key}: ${val}`)
                .join(' - ');

            return {
                label: labels || v.sku || v._id,
                value: v._id
            };
        }) || [];

    const form = useForm<CouponFormValues>({
        // @hookform/resolvers v5+ types input/output separately; the form uses the output type.
        resolver: zodResolver(CouponSchema) as Resolver<CouponFormValues>,
        defaultValues: {
            code: '',
            description: '',
            discountType: 'FLAT',
            discountValue: 0,
            maxDiscountAmount: 0,
            minOrderAmount: 0,
            categoryIds: [],
            subcategoryIds: [],
            sub_subcategoryIds: [],
            productIds: [],
            variant: [],
            userIds: [],
            firstOrderOnly: false,
            usageLimit: 50,
            usagePerUser: 0,
            isActive: true,
            startAt: new Date(),
            expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
    });

    const discountType = form.watch('discountType');
    const discountValue = form.watch('discountValue');

    useEffect(() => {
        if (discountType === 'FLAT') {
            // Sync maxDiscountAmount with discountValue when in FLAT mode
            form.setValue('maxDiscountAmount', discountValue);
        }
    }, [discountType, discountValue, form]);

    // === Handle Submission ===
    const onSubmit = async (data: CouponFormValues) => {
        try {
            // 1. Create a deep copy of the data to avoid mutating the form state directly
            const payload = { ...data };

            // 2. Handle Hierarchy for Categories
            // If Sub-Sub exists, clear Category and Sub
            if (
                payload.sub_subcategoryIds &&
                payload.sub_subcategoryIds.length > 0
            ) {
                payload.categoryIds = [];
                payload.subcategoryIds = [];
            }
            // Otherwise, if Sub exists, clear Category
            else if (
                payload.subcategoryIds &&
                payload.subcategoryIds.length > 0
            ) {
                payload.categoryIds = [];
                payload.sub_subcategoryIds = []; // Ensure sub-sub is empty
            }
            // Otherwise, just keep Category as is (Sub and Sub-Sub are already empty)
            else {
                payload.subcategoryIds = [];
                payload.sub_subcategoryIds = [];
            }

            // 3. Handle Hierarchy for Products/Variants
            // If Variants are selected, clear Product IDs
            if (payload.variant && payload.variant.length > 0) {
                payload.productIds = [];
            }
            // Otherwise, if only Product IDs exist, variant remains []
            else {
                payload.variant = [];
            }

            const res: any = await createCoupon(payload).unwrap();

            if (res?.success) {
                toast.success(res?.message || 'Coupon created successfully!');
                form.reset();
                router.push('/admin/coupons');
            }
        } catch (error: any) {
            console.error('CREATE COUPON ERROR:', error);
            toast.error(error?.data?.message || 'Failed to create coupon.');
        }
    };

    /* const res: any = await createCoupon(data).unwrap();

      if (res?.success) {
        toast.success(res?.message || "Coupon created successfully!");
        form.reset();
        router.push("/admin/coupons"); // Redirect to list page
      } */

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='w-full space-y-6'
            >
                {/* Basic Information */}
                <div className='grid gap-6 rounded-lg bg-background p-6 shadow'>
                    <FormInput
                        control={form.control}
                        name='code'
                        label='Coupon Code'
                        placeholder='NEWYEAR2026'
                    />

                    <div className='grid gap-4 md:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='discountType'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl className='!w-full'>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select type' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='PERCENTAGE'>
                                                Percentage
                                            </SelectItem>
                                            <SelectItem value='FLAT'>
                                                Flat Amount
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='isActive'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Active Status</FormLabel>
                                    <div className='flex items-center justify-between rounded-md border px-3 py-2'>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className='grid gap-4 md:grid-cols-2'>
                        <FormInput
                            control={form.control}
                            name='discountValue'
                            label='Discount Value'
                            type='number'
                        />

                        <FormInput
                            control={form.control}
                            name='maxDiscountAmount'
                            label='Max Discount Amount'
                            type='number'
                            className={
                                discountType === 'PERCENTAGE' ? '' : 'hidden'
                            }
                        />
                    </div>

                    <FormEditor
                        control={form.control}
                        name='description'
                        label='Description'
                        form={form}
                    />
                </div>

                {/* Dates Section */}
                <div className='rounded-lg bg-background p-6 shadow'>
                    <div className='mb-4 flex items-center gap-2 border-b pb-2 text-lg font-medium text-primary'>
                        Validity Period{' '}
                        <div className='text-sm font-normal'>
                            (by default 7 days)
                        </div>
                    </div>
                    <div className='grid gap-6 md:grid-cols-2'>
                        <FormDatePicker
                            control={form.control}
                            name='startAt'
                            label='Start Date'
                        />
                        <FormDatePicker
                            control={form.control}
                            name='expireAt'
                            label='Expiry Date'
                        />
                    </div>
                </div>

                {/* Categories Section */}
                <div className='rounded-lg bg-background p-6 shadow'>
                    <div className='mb-4 border-b pb-2 text-lg font-medium text-primary'>
                        Category Targeting (Optional)
                    </div>
                    <div className='grid gap-6 md:grid-cols-3'>
                        <FormField
                            control={form.control}
                            name='categoryIds'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categories</FormLabel>
                                    <MultiSelect
                                        options={categoryOptions}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setSelectedCategory(
                                                val[val.length - 1]
                                            );
                                        }}
                                        defaultValue={field.value}
                                    />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='subcategoryIds'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sub-Categories</FormLabel>
                                    <MultiSelect
                                        options={subCategoryOptions}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setSelectedSubCategory(
                                                val[val.length - 1]
                                            );
                                        }}
                                        defaultValue={field.value}
                                    />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='sub_subcategoryIds'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sub-Sub-Categories</FormLabel>
                                    <MultiSelect
                                        options={subSubCategoryOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* NEW: Products & Variants Section */}
                <div className='rounded-lg bg-background p-6 shadow'>
                    <div className='mb-4 border-b pb-2 text-lg font-medium text-primary'>
                        Product & Variant Targeting (Optional)
                    </div>
                    <div className='grid gap-6 md:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='productIds'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Products</FormLabel>
                                    <MultiSelect
                                        options={productOptions}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setLastSelectedProductId(
                                                val[val.length - 1]
                                            ); // Fetch variants for the last picked product
                                        }}
                                        defaultValue={field.value}
                                        placeholder='Choose products...'
                                    />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='variant'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Select Specific Variants
                                    </FormLabel>
                                    <MultiSelect
                                        options={variantOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={
                                            lastSelectedProductId
                                                ? 'Choose variants...'
                                                : 'Select a product first'
                                        }
                                        disabled={!lastSelectedProductId}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Constraints */}
                <div className='rounded-lg bg-background p-6 shadow'>
                    <div className='mb-4 border-b pb-2 text-lg font-medium text-primary'>
                        Additional Info (Optional)
                    </div>
                    <div className='grid gap-6 md:grid-cols-3'>
                        <FormInput
                            control={form.control}
                            name='usageLimit'
                            label='Total Usage Limit'
                            type='number'
                        />

                        <FormInput
                            control={form.control}
                            name='usagePerUser'
                            label='Usage Per User'
                            type='number'
                        />
                        <FormInput
                            control={form.control}
                            name='minOrderAmount'
                            label='Min Order Amount'
                            type='number'
                        />
                        <div className='col-span-3 flex gap-2'>
                            <FormField
                                control={form.control}
                                name='firstOrderOnly'
                                render={({ field }) => (
                                    <FormItem className='flex flex-1 items-center justify-between rounded-md border p-3'>
                                        <FormLabel className='m-0'>
                                            First Order Only?
                                        </FormLabel>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className='flex justify-end'>
                    <Button type='submit' size='xl'>
                        Save Coupon
                        {isCreating && (
                            <Loader size={16} className='ml-2 animate-spin' />
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CreateCouponForm;
