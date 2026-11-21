'use client';
import type { Resolver } from 'react-hook-form';

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
import { EditPurchaseSchema } from '@/schema/purchase';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { CalendarIcon, Loader, Trash2, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllSuppliersQuery } from '@/redux/api-queries/supplier-slice';
import type { TSupplier } from '@/types/supplier';
import { useGetAllBusinessLocationsQuery } from '@/redux/api-queries/business-location-api';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/admin-utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/admin-input';
import { useGetAllSearchVariantsQuery } from '@/redux/api-queries/product-api';
import useDebounce from '@/hooks/use-debounce';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    useEditPurchaseMutation,
    useGetSinglePurchaseQuery
} from '@/redux/api-queries/purchase-slice';
import { useRouter } from 'next/navigation';
import { IPurchase } from '@/types/purchase';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';

interface PurchaseItem {
    variant: string;
    product: string;
    qty: number;
    unit_cost: number;
    discount: number;
    // Optional display fields for UI
    product_name?: string;
    variant_name?: string;
    sku?: string;
}

interface ExpenseItem {
    type: string;
    amount: number;
    note?: string;
}

const EditPurchaseForm = ({ id }: { id: string }) => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.PURCHASE_VIEW,
            PermissionEnum.PURCHASE_UPDATE
        ]
    });

    // === router ===
    const router = useRouter();

    // === search variant state ===
    const [searchProduct, setSearchProduct] = useState<string>('');
    const debouncedSearchVariant = useDebounce(searchProduct);

    const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);
    const [selectedExpenses, setSelectedExpenses] = useState<ExpenseItem[]>([]);

    // === get single purchase ===
    const { data: singlePurchaseData, isLoading } = useGetSinglePurchaseQuery(
        { purchase_id: id },
        { skip: !id }
    );
    const purchase: IPurchase = singlePurchaseData?.data;

    // === get all suppliers ===
    const { data: suppliersData } = useGetAllSuppliersQuery({});
    const supplierOptions =
        suppliersData?.data?.map((supplier: TSupplier) => ({
            label: supplier?.name,
            value: supplier?._id
        })) || [];

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map(
            (businessLocation: any) => ({
                label: businessLocation?.name,
                value: businessLocation?._id
            })
        ) || [];

    // === get all search variants ===
    const { data: searchVariantsData, isLoading: isSearchProductLoading } =
        useGetAllSearchVariantsQuery({
            page: 1,
            limit: 20,
            barcode: '',
            searchQuery: debouncedSearchVariant,
            product_id: ''
        });
    const searchVariants = searchVariantsData?.data?.data;
    // Group by product.sku (root SKU)
    const groupedVariants =
        searchVariants?.reduce((acc: any, item: any) => {
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

    // New sorting logic for each variant group
    Object.values(groupedVariants).forEach((group: any) => {
        group.variants.sort((a: any, b: any) => {
            // Extract the numeric part of the variant name
            const aVariant = Object.values(a.attribute_values).join(' - ');
            const bVariant = Object.values(b.attribute_values).join(' - ');

            const getNumericValue = (str: string) => {
                const match = str.match(/\d+/);
                return match ? parseInt(match[0], 10) : Infinity; // Use Infinity for non-numeric names
            };

            const aNum = getNumericValue(aVariant);
            const bNum = getNumericValue(bVariant);

            // Sort numerically first
            if (aNum !== bNum) {
                return aNum - bNum;
            }

            // Then sort by the full variant name alphabetically
            return aVariant.localeCompare(bVariant);
        });
    });

    const groupedSearchResults = Object.values(groupedVariants);

    // === edit purchase api mutation ===
    const [editPurchase, { isLoading: isEditPurchaseLoading }] =
        useEditPurchaseMutation();

    // === form default values ===
    const form = useForm<z.infer<typeof EditPurchaseSchema>>({
        // @hookform/resolvers v5+ types input/output separately; the form uses the output type.
        resolver: zodResolver(EditPurchaseSchema) as Resolver<
            z.infer<typeof EditPurchaseSchema>
        >,
        defaultValues: {
            supplier: '',
            business_location: '',
            purchase_date: new Date() || '',
            items: [],
            expenses_applied: []
        }
    });

    // === handle edit purchase ===
    const handleEditPurchase = async (
        data: z.infer<typeof EditPurchaseSchema>
    ) => {
        const payload = data;

        try {
            const res: any = await editPurchase({ purchase_id: id, payload });
            if (res?.data?.success) {
                toast.success('Puchase edited!');
                router.replace('/admin/purchase/all');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to edit purchase!'
                );
            }
        } catch (error: any) {
            console.log('EDIT PURCHASE ERROR: ', error);

            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );

            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            } else {
                toast.error('Something went wrong! Try again.');
            }
        }
    };

    // === handle select product ===
    const handleSelectProduct = (items: any | any[]) => {
        const variantsArray = Array.isArray(items) ? items : [items];

        const newItems: PurchaseItem[] = variantsArray.map((item) => {
            const variant = Object.entries(item?.attribute_values || {})
                ?.map(([, value]) => value)
                .join(' - ');

            return {
                variant: item?._id,
                product: item?.product?._id,
                qty: 1,
                unit_cost: 0,
                discount: 0,
                product_name: item?.product?.name,
                variant_name: variant,
                sku: item?.sku
            };
        });

        setSelectedItems((prev) => [...prev, ...newItems]);
        setSearchProduct('');
    };

    // === handle item remove ===
    const handleRemoveItem = (index: number) => {
        setSelectedItems((prev) => prev.filter((_, i) => i !== index));
    };

    // === handle item update ===
    const handleUpdateItem = (
        index: number,
        field: keyof PurchaseItem,
        value: any
    ) => {
        setSelectedItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    // === handle add expense ===
    const handleAddExpense = () => {
        const newExpense: ExpenseItem = {
            type: '',
            amount: 0,
            note: ''
        };
        setSelectedExpenses((prev) => [...prev, newExpense]);
    };

    // === handle remove expense ===
    const handleRemoveExpense = (index: number) => {
        setSelectedExpenses((prev) => prev.filter((_, i) => i !== index));
    };

    // === handle update expense ===
    const handleUpdateExpense = (
        index: number,
        field: keyof ExpenseItem,
        value: any
    ) => {
        setSelectedExpenses((prev) =>
            prev.map((expense, i) =>
                i === index ? { ...expense, [field]: value } : expense
            )
        );
    };

    // === use effects to update form values ===
    useEffect(() => {
        const formattedItems = selectedItems.map(({ ...item }) => item);
        form.setValue('items', formattedItems);
    }, [selectedItems, form]);

    useEffect(() => {
        form.setValue('expenses_applied', selectedExpenses);
    }, [selectedExpenses, form]);

    const parseSku = (skuRaw: string = '') => {
        const sku = (skuRaw ?? '').toString().trim();
        const [rootPart, ...rest] = sku.split('-');
        const root = (rootPart || '').trim().toUpperCase();
        const suffixRaw = (rest.join('-') || '').trim();
        const suffixDigitsMatch = suffixRaw.match(/\d+/);
        const suffixNum = suffixDigitsMatch
            ? parseInt(suffixDigitsMatch[0], 10)
            : NaN;
        return {
            root,
            suffixNum: Number.isFinite(suffixNum) ? suffixNum : NaN,
            suffixRaw
        };
    };

    // Apply unit_cost to all variants that share the same root SKU
    const handleCostToApplyAll = (skuOrRoot: string, unit_cost: any) => {
        const targetRoot = parseSku(skuOrRoot).root;
        setSelectedItems((prev) =>
            prev.map((item) => {
                const itemRoot = parseSku(item.sku).root;
                return itemRoot === targetRoot ? { ...item, unit_cost } : item;
            })
        );
    };

    // Apply discount to all variants that share the same root SKU
    const handleDiscountToApplyAll = (skuOrRoot: string, discount: any) => {
        const targetRoot = parseSku(skuOrRoot).root;
        setSelectedItems((prev) =>
            prev.map((item) => {
                const itemRoot = parseSku(item.sku).root;
                return itemRoot === targetRoot ? { ...item, discount } : item;
            })
        );
    };

    // === reset form with default values ===
    const { reset } = form;
    useEffect(() => {
        if (purchase) {
            const purchaseDate = purchase?.purchase_date
                ? new Date(purchase?.purchase_date)
                : new Date();

            reset({
                supplier: purchase?.supplier?._id || '',
                business_location: purchase?.business_location?._id || '',
                purchase_date: purchaseDate
            });
        }
    }, [purchase, reset]);

    useEffect(() => {
        if (purchase) {
            const mappedItems =
                purchase?.items?.map((item: any) => ({
                    variant: item?.variant?._id,
                    product: item?.product?._id,
                    qty: item?.qty,
                    unit_cost: item?.unit_cost,
                    discount: item?.discount,
                    product_name: item?.product?.name,
                    variant_name: Object?.entries(
                        item?.variant?.attribute_values || {}
                    )
                        ?.map(([, value]) => value)
                        .join(' - '),
                    sku: item?.variant?.sku
                })) || [];
            setSelectedItems(mappedItems);

            const mappedExpenses =
                purchase?.expenses_applied?.map((exp: any) => ({
                    type: exp?.type,
                    amount: exp?.amount,
                    note: exp?.note
                })) || [];
            setSelectedExpenses(mappedExpenses);
        }
    }, [purchase]);

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading || isLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleEditPurchase)}
                className='w-full space-y-6'
            >
                <div className='grid gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl md:grid-cols-2 lg:p-6 xl:grid-cols-4'>
                    {/* ===== supplier field ===== */}
                    <FormField
                        control={form.control}
                        name='supplier'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                    }}
                                    defaultValue={
                                        // field.value !== undefined ? field.value : undefined
                                        purchase?.supplier?._id
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a supplier' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {supplierOptions?.map(
                                            (
                                                supplier: {
                                                    label: string;
                                                    value: string;
                                                },
                                                index: number
                                            ) => (
                                                <SelectItem
                                                    key={index}
                                                    value={supplier?.value}
                                                >
                                                    {supplier?.label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* ===== business location field ===== */}
                    <FormField
                        control={form.control}
                        name='business_location'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Business Location</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                    }}
                                    defaultValue={
                                        // field.value !== undefined ? field.value : undefined
                                        purchase?.business_location?._id
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select business location' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {businessLocationOptions?.map(
                                            (
                                                businessLocation: {
                                                    label: string;
                                                    value: string;
                                                },
                                                index: number
                                            ) => (
                                                <SelectItem
                                                    key={index}
                                                    value={
                                                        businessLocation?.value
                                                    }
                                                >
                                                    {businessLocation?.label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* ===== purchase date field ===== */}
                    <FormField
                        control={form.control}
                        name='purchase_date'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>Purchase Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'h-9 w-full pl-3 text-left font-normal md:text-sm',
                                                    !field.value &&
                                                        'text-muted-foreground'
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className='w-auto p-0'
                                        align='start'
                                    >
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() ||
                                                date < new Date('1900-01-01')
                                            }
                                            captionLayout='dropdown'
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl lg:p-6'>
                    <div className='space-y-4'>
                        <div className='mx-auto max-w-2xl space-y-2'>
                            <p className='text-sm font-medium'>
                                Search for Products
                            </p>
                            <Input
                                type='text'
                                className='w-full'
                                value={searchProduct}
                                onChange={(e) =>
                                    setSearchProduct(e.target.value)
                                }
                                placeholder='Search by a product name or sku'
                            />
                            {searchProduct && (
                                <div className='max-h-80 w-full overflow-y-auto rounded-lg border bg-background'>
                                    {/* Results */}
                                    {!isSearchProductLoading &&
                                        searchVariants?.length > 0 && (
                                            <div>
                                                {/* Grouped results */}
                                                {groupedSearchResults?.map(
                                                    (group: any, index) => (
                                                        <div
                                                            key={index}
                                                            className='border-b last:border-b-0'
                                                        >
                                                            {/* Header */}
                                                            <div
                                                                onClick={() =>
                                                                    handleSelectProduct(
                                                                        [
                                                                            ...group.variants
                                                                        ]
                                                                    )
                                                                }
                                                                className='cursor-pointer bg-muted/40 px-2 py-2 text-sm text-foreground hover:bg-primary/10'
                                                            >
                                                                {
                                                                    group.productName
                                                                }{' '}
                                                                ({group.rootSKU}
                                                                )
                                                            </div>

                                                            {/* Variants */}
                                                            {group.variants.map(
                                                                (item: any) => {
                                                                    const variant =
                                                                        Object.entries(
                                                                            item?.attribute_values ||
                                                                                {}
                                                                        )
                                                                            ?.map(
                                                                                ([
                                                                                    ,
                                                                                    value
                                                                                ]) =>
                                                                                    value
                                                                            )
                                                                            .join(
                                                                                ' - '
                                                                            );

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                item?._id
                                                                            }
                                                                            className='cursor-pointer border-t px-4 py-2 last:border-b-0 hover:bg-muted'
                                                                            onClick={() =>
                                                                                handleSelectProduct(
                                                                                    [
                                                                                        item
                                                                                    ]
                                                                                )
                                                                            }
                                                                        >
                                                                            <div className='flex items-center justify-between'>
                                                                                <p className='text-sm'>
                                                                                    {
                                                                                        group.productName
                                                                                    }{' '}
                                                                                    (
                                                                                    {
                                                                                        variant
                                                                                    }

                                                                                    )
                                                                                    -{' '}
                                                                                    {
                                                                                        item?.sku
                                                                                    }
                                                                                </p>
                                                                                <Plus className='h-4 w-4 text-muted-foreground' />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    {!isSearchProductLoading &&
                                        searchVariants?.length === 0 && (
                                            <div className='py-6 text-center text-sm'>
                                                No product found! Try different
                                                keywords.
                                            </div>
                                        )}
                                    {isSearchProductLoading && (
                                        <div className='py-6 text-center text-sm'>
                                            <Loader
                                                className='mx-auto animate-spin'
                                                size={16}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {selectedItems.length > 0 && (
                            <div className='space-y-4'>
                                <h3 className='text-lg font-semibold'>
                                    Selected Items
                                </h3>
                                <div className='overflow-hidden rounded-lg border'>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead>Unit Cost</TableHead>
                                                <TableHead>Discount</TableHead>

                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedItems.map(
                                                (item: any, index) => {
                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <p className='text-sm font-medium'>
                                                                    {
                                                                        item?.product_name
                                                                    }{' '}
                                                                    (
                                                                    {
                                                                        item?.variant_name
                                                                    }
                                                                    ){' - '}
                                                                    {item?.sku}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type='number'
                                                                    value={
                                                                        item.qty
                                                                    }
                                                                    onWheel={(
                                                                        e
                                                                    ) =>
                                                                        e.currentTarget.blur()
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const value =
                                                                            e
                                                                                .target
                                                                                .value;
                                                                        const newValue =
                                                                            value ===
                                                                            ''
                                                                                ? ''
                                                                                : Number.parseInt(
                                                                                      value
                                                                                  ) ||
                                                                                  0;
                                                                        handleUpdateItem(
                                                                            index,
                                                                            'qty',
                                                                            newValue
                                                                        );
                                                                    }}
                                                                    min={'1'}
                                                                    className='w-full text-sm'
                                                                />
                                                            </TableCell>
                                                            <TableCell className='relative'>
                                                                <div className='relative'>
                                                                    <Input
                                                                        type='number'
                                                                        min='0'
                                                                        value={
                                                                            item.unit_cost
                                                                        }
                                                                        onWheel={(
                                                                            e
                                                                        ) =>
                                                                            e.currentTarget.blur()
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const value =
                                                                                e
                                                                                    .target
                                                                                    .value;
                                                                            const newValue =
                                                                                value ===
                                                                                ''
                                                                                    ? ''
                                                                                    : Number.parseInt(
                                                                                          value
                                                                                      ) ||
                                                                                      0;
                                                                            handleUpdateItem(
                                                                                index,
                                                                                'unit_cost',
                                                                                newValue
                                                                            );
                                                                        }}
                                                                        className='w-full pr-8 text-sm' // add padding-right for button space
                                                                    />
                                                                    {/* Apply All Button */}
                                                                    {selectedItems?.length >
                                                                        1 &&
                                                                        index ===
                                                                            0 && (
                                                                            <button
                                                                                type='button'
                                                                                onClick={() =>
                                                                                    handleCostToApplyAll(
                                                                                        item.sku,
                                                                                        item.unit_cost
                                                                                    )
                                                                                }
                                                                                className='absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:bg-blue-100 hover:text-blue-600'
                                                                            >
                                                                                <Check
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className='relative'>
                                                                    <Input
                                                                        type='number'
                                                                        value={
                                                                            item.discount
                                                                        }
                                                                        onWheel={(
                                                                            e
                                                                        ) =>
                                                                            e.currentTarget.blur()
                                                                        }
                                                                        min={
                                                                            '0'
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const value =
                                                                                e
                                                                                    .target
                                                                                    .value;
                                                                            const newValue =
                                                                                value ===
                                                                                ''
                                                                                    ? ''
                                                                                    : Number.parseInt(
                                                                                          value
                                                                                      ) ||
                                                                                      0;
                                                                            handleUpdateItem(
                                                                                index,
                                                                                'discount',
                                                                                newValue
                                                                            );
                                                                        }}
                                                                        className='w-full pr-8 text-sm'
                                                                    />
                                                                    {/* Apply All Button */}
                                                                    {selectedItems?.length >
                                                                        1 &&
                                                                        index ===
                                                                            0 && (
                                                                            <button
                                                                                type='button'
                                                                                onClick={() =>
                                                                                    handleDiscountToApplyAll(
                                                                                        item.sku,
                                                                                        item.discount
                                                                                    )
                                                                                }
                                                                                className='absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:bg-blue-100 hover:text-blue-600'
                                                                            >
                                                                                <Check
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={() =>
                                                                        handleRemoveItem(
                                                                            index
                                                                        )
                                                                    }
                                                                    className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                                                                >
                                                                    <Trash2 className='h-4 w-4' />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* === Totals Section === */}
                                <div className='space-y-2 text-lg font-medium'>
                                    <p>
                                        Total Pcs:{' '}
                                        <span className='font-semibold'>
                                            {selectedItems.reduce(
                                                (sum: number, item: any) =>
                                                    sum +
                                                    (Number(item?.qty) || 0),
                                                0
                                            )}
                                        </span>
                                    </p>
                                    <p>
                                        Net Total Amount:{' '}
                                        <span className='font-semibold'>
                                            {selectedItems
                                                .reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        item.qty *
                                                            item.unit_cost -
                                                        item.discount,
                                                    0
                                                )
                                                .toFixed(2)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl lg:p-6'>
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>
                                Additional Expenses
                            </h3>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleAddExpense}
                            >
                                <Plus className='mr-2 h-4 w-4' />
                                Add Expense
                            </Button>
                        </div>
                        {selectedExpenses.length > 0 && (
                            <div className='overflow-hidden rounded-lg border'>
                                <div className='grid grid-cols-[1fr_300px_1fr_48px] gap-0 bg-muted/50'>
                                    {/* Grid Header */}
                                    <div className='border-b px-4 py-3 text-sm font-medium'>
                                        Expense Type
                                    </div>
                                    <div className='border-b border-l px-4 py-3 text-sm font-medium'>
                                        Amount
                                    </div>
                                    <div className='border-b border-l px-4 py-3 text-sm font-medium'>
                                        Note
                                    </div>
                                    <div className='border-b border-l px-4 py-3 text-sm font-medium'></div>
                                </div>
                                <div className='divide-y'>
                                    {selectedExpenses.map((expense, index) => (
                                        <div
                                            key={index}
                                            className='grid grid-cols-[1fr_300px_1fr_48px] gap-0'
                                        >
                                            <div className='px-4 py-3'>
                                                <Input
                                                    type='text'
                                                    value={expense.type}
                                                    onChange={(e) =>
                                                        handleUpdateExpense(
                                                            index,
                                                            'type',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='e.g., Shipping, Tax, Handling'
                                                    className='w-full text-sm'
                                                />
                                            </div>
                                            <div className='border-l px-4 py-3'>
                                                <Input
                                                    type='number'
                                                    min='0'
                                                    step='0.01'
                                                    onWheel={(e) =>
                                                        e.currentTarget.blur()
                                                    }
                                                    value={expense.amount}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        const newValue =
                                                            value === ''
                                                                ? ''
                                                                : Number.parseInt(
                                                                      value
                                                                  ) || 0;
                                                        handleUpdateExpense(
                                                            index,
                                                            'amount',
                                                            newValue
                                                        );
                                                    }}
                                                    className='w-full text-sm'
                                                />
                                            </div>
                                            <div className='border-l px-4 py-3'>
                                                <Textarea
                                                    value={expense.note || ''}
                                                    onChange={(e) =>
                                                        handleUpdateExpense(
                                                            index,
                                                            'note',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='Optional note'
                                                    className='min-h-[60px] w-full resize-none text-sm'
                                                />
                                            </div>
                                            <div className='flex items-center justify-center border-l px-4 py-3'>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() =>
                                                        handleRemoveExpense(
                                                            index
                                                        )
                                                    }
                                                    className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                                                >
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedExpenses?.length === 0 && (
                            <div className='rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground'>
                                No additional expenses added. Click &quot;Add
                                Expense&quot; to include shipping, taxes, or
                                other costs.
                            </div>
                        )}
                    </div>
                </div>

                <div className='ms-auto flex w-fit items-center gap-2'>
                    <Button
                        type='submit'
                        size='xl'
                        variant='green'
                        disabled={
                            selectedItems?.length === 0 || isEditPurchaseLoading
                        }
                    >
                        {isEditPurchaseLoading ? (
                            <>
                                <Loader className='animate-spin' /> Editing
                                Purchase
                            </>
                        ) : (
                            'Edit Purchase'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default EditPurchaseForm;
