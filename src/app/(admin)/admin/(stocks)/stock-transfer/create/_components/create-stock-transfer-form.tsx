'use client';
import type { Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod/v3';
import { Button } from '@/admin/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/admin/components/ui/form';
import { StockTransferSchema } from '@/admin/schema/stock-transfer';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { useState, useEffect } from 'react';
import { Loader, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllBusinessLocationsQuery } from '@/admin/redux/api-queries/business-location-api';
import { Input } from '@/admin/components/ui/input';
import useDebounce from '@/admin/hooks/use-debounce';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/admin/components/ui/table';
import { Textarea } from '@/admin/components/ui/textarea';
import {
    useCreateStockTransferMutation,
    useGetAllStocksQuery
} from '@/admin/redux/api-queries/stock-api';
import { useRouter } from 'next/navigation';

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

const CreateStockTransferForm = () => {
    // === router ===
    const router = useRouter();

    // === search variant state ===
    const [searchProduct, setSearchProduct] = useState<string>('');
    const debouncedSearchVariant = useDebounce(searchProduct);
    const [selectedFromLocation, setSelectedFromLocation] = useState('');
    const [selectedToLocation, setSelectedToLocation] = useState('');

    const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);
    const [selectedExpenses, setSelectedExpenses] = useState<ExpenseItem[]>([]);

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map(
            (businessLocation: any) => ({
                label: businessLocation?.name,
                value: businessLocation?._id
            })
        ) || [];

    // === get all stocks ===
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
            businessLocationId: selectedFromLocation
        },
        {
            skip: !selectedFromLocation || !selectedToLocation
        }
    );
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
            const aVariant = Object.values(a?.variant?.attribute_values).join(
                ' - '
            );
            const bVariant = Object.values(b?.variant?.attribute_values).join(
                ' - '
            );

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

    // === add new stock api mutation ===
    const [createStockTransfer, { isLoading: isCreateStcokTransferLoading }] =
        useCreateStockTransferMutation();

    // === form default values ===
    const form = useForm<z.infer<typeof StockTransferSchema>>({
        // @hookform/resolvers v5+ types input/output separately; the form uses the output type.
        resolver: zodResolver(StockTransferSchema) as Resolver<
            z.infer<typeof StockTransferSchema>
        >,
        defaultValues: {
            from: '',
            to: '',
            items: [],
            expenses_applied: []
        }
    });

    // === handle add new purchase ===
    const handleAddNewPurchase = async (
        data: z.infer<typeof StockTransferSchema>
    ) => {
        const payload = data;

        try {
            const res: any = await createStockTransfer({ payload });
            if (res?.data?.success) {
                toast.success('Stock transfered!');
                router.replace('/admin/stock-transfer/all');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to add stock transfer!'
                );
            }
        } catch (error: any) {
            console.log('CREATE STOCK TRANSFER ERROR: ', error);

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
            const variant = Object.entries(
                item?.variant?.attribute_values || {}
            )
                ?.map(([, value]) => value)
                .join(' - ');
            return {
                variant: item?.variant?._id,
                product: item?.product?._id,
                qty: 1,
                unit_cost: 0,
                discount: 0,
                product_name: item?.product?.name,
                variant_name: variant,
                sku: item?.variant?.sku
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

    // console.log("selectedItems: ", selectedItems);

    // variant select - 68be8fa83114b1bcfd1314a2
    // variant payload - 68be8fa83114b1bcfd1314a2

    // product select - 6895b86429c4dd80a7e2a0ed
    // product payload -  6895b86429c4dd80a7e2a0ed

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleAddNewPurchase)}
                className='w-full space-y-6'
            >
                <div className='grid gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl md:grid-cols-2 lg:p-6'>
                    {/* ===== from field ===== */}
                    <FormField
                        control={form.control}
                        name='from'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>From</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setSelectedFromLocation(value);
                                    }}
                                    defaultValue={
                                        field.value !== undefined
                                            ? field.value
                                            : undefined
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select from location' />
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
                    {/* ===== to field ===== */}
                    <FormField
                        control={form.control}
                        name='to'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setSelectedToLocation(value);
                                    }}
                                    defaultValue={
                                        field.value !== undefined
                                            ? field.value
                                            : undefined
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select to location' />
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
                </div>

                <div className='rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl lg:p-6'>
                    <div className='space-y-4'>
                        <div className='relative mx-auto max-w-2xl space-y-2'>
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
                                disabled={
                                    !selectedFromLocation || !selectedToLocation
                                }
                            />
                            {searchProduct && (
                                <div className='absolute top-full z-50 max-h-80 w-full overflow-y-auto rounded-lg border bg-background'>
                                    {/* Results */}
                                    {!isSearchProductLoading &&
                                        searchVariants?.length > 0 && (
                                            <div>
                                                {/* Grouped results */}
                                                {groupedSearchResults?.map(
                                                    (
                                                        group: any,
                                                        index: number
                                                    ) => (
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
                                                                            item
                                                                                ?.variant
                                                                                ?.attribute_values ||
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
                                                                                        item
                                                                                            ?.variant
                                                                                            ?.sku
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
                            selectedItems?.length === 0 ||
                            isCreateStcokTransferLoading
                        }
                    >
                        {isCreateStcokTransferLoading ? (
                            <>
                                <Loader className='animate-spin' /> Adding Stock
                                Transfer
                            </>
                        ) : (
                            'Add Stock Transfer'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CreateStockTransferForm;
