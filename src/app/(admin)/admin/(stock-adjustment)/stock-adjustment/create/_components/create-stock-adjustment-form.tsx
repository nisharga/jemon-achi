'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod/v3';
import { Button } from '@/components/ui/admin-button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/admin-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Loader, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllBusinessLocationsQuery } from '@/redux/api-queries/business-location-api';
import { Input } from '@/components/ui/admin-input';
import useDebounce from '@/hooks/use-debounce';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import {
    useCreateStockAdjustmentMutation,
    useGetAllStocksQuery
} from '@/redux/api-queries/stock-api';
import { StockAdjustmentSchema } from '@/schema/stock-adjustment';
import { Label } from '@/components/ui/admin-label';
import { Textarea } from '@/components/ui/textarea';

// --- Interfaces ---
interface ProductItem {
    stock: string;
    product: string;
    quantity: number;
    old_quantity: number;
    product_note?: string;
    selected_variant: {
        _id: string;
        attributes: string[];
        attribute_values: Record<string, string>;
        regular_price: number;
        sale_price: number;
        sku?: string;
        barcode?: string;
        image: string | null;
        product: string;
    };
    product_name?: string;
    variant_name?: string;
}

const CreateStockAdjustmentForm = () => {
    const router = useRouter();

    // === api query states ===
    const [searchProduct, setSearchProduct] = useState('');
    const debouncedSearchVariant = useDebounce(searchProduct, 500);
    const [selectedBusinessLocation, setSelectedBusinessLocation] =
        useState('');
    const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
    //  console.log(selectedProducts, "selectedProducts");
    // === API Queries ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map((bl: any) => ({
            label: bl?.name,
            value: bl?._id
        })) || [];

    const {
        data: searchVariantsData,
        isLoading: isSearchProductLoading,
        isError: isSearchProductError,
        error: searchProductError
    } = useGetAllStocksQuery(
        {
            page: 1,
            limit: 20,
            sku: debouncedSearchVariant,
            businessLocationId: selectedBusinessLocation
        },
        {
            skip: !selectedBusinessLocation
        }
    );

    const searchVariants = searchVariantsData?.data?.data || [];

    const groupedSearchResults =
        searchVariants.reduce((acc: Record<string, any>, item: any) => {
            const rootSKU = item?.product?.sku;
            if (!acc[rootSKU]) {
                acc[rootSKU] = {
                    productName: item?.product?.name,
                    rootSKU,
                    variants: []
                };
            }
            acc[rootSKU].variants.push(item);
            return acc;
        }, {}) || {};

    const groupedResultsArray = Object.values(groupedSearchResults);

    const [createStockAdjustment, { isLoading: isCreateAdjustmentLoading }] =
        useCreateStockAdjustmentMutation();

    // === Form ===
    const form = useForm<z.infer<typeof StockAdjustmentSchema>>({
        resolver: zodResolver(StockAdjustmentSchema),
        defaultValues: {
            business_location: '',
            action: 'DEDUCTION',
            products: [],
            note: ''
        }
    });

    // === Handlers ===
    const handleAddProductToForm = (items: any | any[]) => {
        const variantsArray = Array.isArray(items) ? items : [items];

        const newItems: ProductItem[] = variantsArray.map((item) => {
            const variantDisplay = Object.values(
                item?.variant?.attribute_values || {}
            ).join(' - ');

            return {
                stock: item?._id,
                product: item?.product?._id,
                quantity: 0,
                old_quantity: item?.available_quantity,
                product_note: '',
                selected_variant: {
                    ...item?.variant,
                    regular_price: item?.variant?.regular_price,
                    sale_price: item?.variant?.sale_price,
                    sku: item?.variant?.sku
                },
                product_name: item?.product?.name,
                variant_name: variantDisplay
            };
        });

        setSelectedProducts((prev) => {
            const existing = [...prev];
            newItems.forEach((ni) => {
                const found = existing.find(
                    (p) => p.stock === ni.stock && p.product === ni.product
                );
                if (!found) existing.push(ni);
            });
            return existing;
        });

        setSearchProduct('');
    };

    const handleRemoveProduct = (index: number) => {
        setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
    };

    const actionType = form.watch('action');

    const handleUpdateProductField = (
        index: number,
        field: keyof ProductItem,
        value: any
    ) => {
        setSelectedProducts((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    useEffect(() => {
        const formattedProducts = selectedProducts.map((item) => ({
            stock: item.stock,
            product: item.product,
            quantity: item.quantity,
            product_note: item.product_note || '',
            selected_variant: {
                ...item.selected_variant,
                sku: item.selected_variant?.sku ?? '',
                barcode: item.selected_variant?.barcode ?? ''
            }
        }));
        form.setValue('products', formattedProducts);
    }, [selectedProducts, form]);

    const handleSubmitStockAdjustment = async (
        data: z.infer<typeof StockAdjustmentSchema>
    ) => {
        try {
            if (!data.business_location) {
                toast.error('Please select business location!');
                return;
            }

            if (selectedProducts?.length === 0) {
                toast.error('Please add at least one product.');
                return;
            }

            const res: any = await createStockAdjustment({ payload: data });
            if (res?.data?.success) {
                toast.success('Stock adjustment successful!');
                router.push('/admin/stock-adjustment/all');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Stock adjustment failed!'
                );
            } else {
                toast.error('An unexpected error occurred.');
            }
        } catch (error: any) {
            const errorMessage =
                error?.data?.errorMessages
                    ?.map((e: any) => e.message)
                    .join('\n') || 'Something went wrong!';
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (isSearchProductError) {
            toast.error(
                `Error fetching products: ${
                    (searchProductError as any)?.data?.message ||
                    'Please try again.'
                }`
            );
        }
    }, [isSearchProductError, searchProductError]);

    // === Render ===
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmitStockAdjustment)}
                // onSubmit={form.handleSubmit(
                //   (payload) => {
                //     console.log("✅ payload", payload);
                //   },
                //   (errors) => {
                //     console.log("❌ validation errors", errors);
                //   }
                // )}
                className='w-full space-y-6'
            >
                <div className='grid gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl md:grid-cols-2 lg:p-6'>
                    {/* Business Location */}
                    <FormField
                        control={form.control}
                        name='business_location'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Business Location</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setSelectedBusinessLocation(value);
                                    }}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select business location' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {businessLocationOptions.map(
                                            (loc: any) => (
                                                <SelectItem
                                                    key={loc.value}
                                                    value={loc.value}
                                                >
                                                    {loc.label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Adjustment Action */}
                    <FormField
                        control={form.control}
                        name='action'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Action</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select action' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='DEDUCTION'>
                                            Deduct Stock
                                        </SelectItem>
                                        <SelectItem value='ADDITION'>
                                            Add Stock
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Search Products */}
                <div className='space-y-4 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl lg:p-6'>
                    <div className='relative mx-auto max-w-2xl space-y-2'>
                        <Label>Search for Products/Stocks</Label>
                        <Input
                            value={searchProduct}
                            onChange={(e) => setSearchProduct(e.target.value)}
                            placeholder='Search by product name or SKU'
                            disabled={!selectedBusinessLocation}
                        />

                        {searchProduct && (
                            <div className='absolute top-full z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border bg-background'>
                                {isSearchProductLoading ? (
                                    <div className='py-4 text-center'>
                                        <Loader className='mx-auto animate-spin' />
                                    </div>
                                ) : searchVariants.length === 0 ? (
                                    <div className='py-4 text-center text-muted-foreground'>
                                        No products found.
                                    </div>
                                ) : (
                                    groupedResultsArray.map(
                                        (group: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className='border-b last:border-0'
                                            >
                                                <div
                                                    onClick={() =>
                                                        handleAddProductToForm(
                                                            group.variants
                                                        )
                                                    }
                                                    className='flex cursor-pointer justify-between bg-muted/40 px-3 py-2 text-sm font-medium hover:bg-primary/10'
                                                >
                                                    {group.productName} (
                                                    {group.rootSKU})
                                                    <Plus className='h-4 w-4' />
                                                </div>
                                                {group.variants.map(
                                                    (item: any) => {
                                                        const variantDisplay =
                                                            Object.values(
                                                                item?.variant
                                                                    ?.attribute_values ||
                                                                    {}
                                                            ).join(' - ');
                                                        return (
                                                            <div
                                                                key={item._id}
                                                                onClick={() =>
                                                                    handleAddProductToForm(
                                                                        item
                                                                    )
                                                                }
                                                                className='flex cursor-pointer justify-between px-4 py-2 text-sm hover:bg-muted/50'
                                                            >
                                                                {
                                                                    item
                                                                        ?.product
                                                                        ?.name
                                                                }{' '}
                                                                (
                                                                {variantDisplay}
                                                                ) (
                                                                {
                                                                    item
                                                                        ?.variant
                                                                        ?.sku
                                                                }
                                                                )
                                                                <Plus className='h-4 w-4' />
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Products Table */}
                    {selectedProducts.length > 0 && (
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>
                                Selected Products
                            </h3>
                            <div className='overflow-hidden rounded-lg border'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>
                                                {actionType === 'DEDUCTION' ? (
                                                    <span className='text-red-500'>
                                                        Deduct
                                                    </span>
                                                ) : (
                                                    <span className='text-green-500'>
                                                        Add
                                                    </span>
                                                )}{' '}
                                                Qty Value
                                            </TableHead>
                                            <TableHead>Regular Price</TableHead>
                                            <TableHead>Note</TableHead>
                                            <TableHead />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedProducts.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <p className='text-sm font-medium'>
                                                        {item.product_name} (
                                                        {item.variant_name})
                                                    </p>
                                                    <p className='text-xs text-muted-foreground'>
                                                        SKU:{' '}
                                                        {
                                                            item
                                                                .selected_variant
                                                                .sku
                                                        }
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type='number'
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const value =
                                                                e.target.value;
                                                            const newValue =
                                                                value === ''
                                                                    ? ''
                                                                    : Number(
                                                                          value
                                                                      ) || 0;
                                                            handleUpdateProductField(
                                                                idx,
                                                                'quantity',
                                                                newValue
                                                            );
                                                        }}
                                                        className='w-20 text-center text-sm'
                                                    />
                                                    <span className='text-xs'>
                                                        Current Stock:{' '}
                                                        {item.old_quantity}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type='number'
                                                        value={
                                                            item
                                                                .selected_variant
                                                                .regular_price
                                                        }
                                                        onChange={(e) => {
                                                            const value =
                                                                e.target.value;

                                                            const newVariant = {
                                                                ...item.selected_variant,
                                                                regular_price:
                                                                    value === ''
                                                                        ? ''
                                                                        : Number(
                                                                              value
                                                                          )
                                                            };
                                                            handleUpdateProductField(
                                                                idx,
                                                                'selected_variant',
                                                                newVariant
                                                            );
                                                        }}
                                                        className='w-20 text-sm'
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={
                                                            item.product_note
                                                        }
                                                        onChange={(e) =>
                                                            handleUpdateProductField(
                                                                idx,
                                                                'product_note',
                                                                e.target.value
                                                            )
                                                        }
                                                        className='w-full text-sm'
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() =>
                                                            handleRemoveProduct(
                                                                idx
                                                            )
                                                        }
                                                        className='text-destructive'
                                                    >
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Overall Note */}
                    <FormField
                        control={form.control}
                        name='note'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reason</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder='Reason for this adjustment'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Submit */}
                <div className='flex justify-end'>
                    <Button
                        type='submit'
                        size='xl'
                        variant='green'
                        disabled={isCreateAdjustmentLoading}
                    >
                        {isCreateAdjustmentLoading ? (
                            <>
                                <Loader className='mr-2 animate-spin' />
                                Processing...
                            </>
                        ) : (
                            'Add Stock Adjustment'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CreateStockAdjustmentForm;
