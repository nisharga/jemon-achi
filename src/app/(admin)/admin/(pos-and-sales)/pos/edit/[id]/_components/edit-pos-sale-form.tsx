'use client';

import {
    useEditPosSaleMutation,
    useGetSinglePosSaleQuery
} from '@/redux/admin/api/pos-sale-api';
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/admin-input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/admin-button';
import { Label } from '@/components/ui/admin-label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader, Trash } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { PAYMENT_METHODS } from '@/types/admin/pos-sale';
import useDebounce from '@/hooks/use-debounce';
import { useGetAllStocksQuery } from '@/redux/admin/api/stock-api';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import BackBtn from '@/components/shared/back-btn';

interface Discount {
    type: 'PERCENTAGE' | 'FLAT';
    value: number;
}

interface FormData {
    _id: string;
    products: any[];
    customer_phone: string;
    sale_note: string;
    sale_date: Date | null;
    payment_note: string;
    overall_discount: Discount;
    total_discount: number;
    sub_total: number;
    payment_status: string;
    due_amount: number;
    paid_amount: number;
    partial_amount: number;
    total_cost: number;
    profit: number;
    total_amount: number;
    payment_method: string;
    payment_account: string;
}

const EditPosSaleForm = ({ id }: { id: string }) => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.POS_UPDATE]
    });

    // === router ===
    const router = useRouter();

    // === api query states ===
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm);

    // === get single sale ===
    const { data, isLoading } = useGetSinglePosSaleQuery(
        { pos_sale_id: id },
        { skip: !id }
    );
    const sale = data?.data;

    // === get all stocks ===
    const {
        data: stockData,
        isLoading: isStockLoading,
        isFetching: isStockFetching
    } = useGetAllStocksQuery(
        {
            page: 1,
            limit: 20,
            sku: debouncedSearch,
            businessLocationId: sale?.business_location?._id
        },
        {
            skip: !sale?.business_location?._id
        }
    );
    const stocks = stockData?.data?.data;

    // === form state ===
    const [formData, setFormData] = useState<FormData>({
        _id: '',
        products: [],
        customer_phone: '',
        sale_note: '',
        sale_date: null,
        payment_note: '',
        overall_discount: {
            type: 'PERCENTAGE',
            value: 0
        },
        total_discount: 0,
        sub_total: 0,
        payment_status: 'DUE',
        due_amount: 0,
        paid_amount: 0,
        partial_amount: 0,
        total_cost: 0,
        profit: 0,
        total_amount: 0,
        payment_method: 'Cash',
        payment_account: ''
    });

    // === edit sale mutation hook ===
    const [editSale, { isLoading: isEditSaleLoading }] =
        useEditPosSaleMutation();

    // === handle edit pos sale ===
    const handleEditPosSale = async () => {
        const payload: Partial<FormData> = {
            products: formData?.products,
            sale_note: formData?.sale_note,
            sale_date: formData?.sale_date,
            payment_note: formData.payment_note,
            overall_discount: {
                type: formData.overall_discount?.type,
                value: formData.overall_discount?.value
            },
            total_discount: formData.total_discount,
            sub_total: formData.sub_total,
            payment_status: formData.payment_status,
            due_amount: formData.due_amount,
            paid_amount: formData.paid_amount,
            partial_amount: formData.partial_amount,
            total_amount: formData.total_amount,
            payment_method: formData.payment_method ?? 'Cash'
        };

        try {
            const res: any = await editSale({
                pos_sale_id: id,
                payload: payload
            });

            if (res?.data?.success) {
                toast.success('Sale Edited!');
                router.replace('/admin/pos/all');
            }
        } catch (error: any) {
            console.log('EDIT POS SALE ERROR:', error);

            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            } else {
                toast.error('Somthing went wrong!');
            }
        }
    };

    const getRegularPrice = (p: any) => {
        if (p?.selected_variant?.regular_price) {
            return p?.selected_variant?.regular_price;
        }

        // Calculate regular price when it's missing
        const disc_type = p?.product_discount?.type;
        const disc_value = p?.product_discount?.value || 0;
        const quantity = p?.quantity || 0;
        const total_price = p?.total_price || 0;

        if (quantity === 0) {
            return 0;
        }

        let line_subtotal;
        let regular_price_without_discount = 0;

        if (disc_type === 'PERCENTAGE') {
            line_subtotal = total_price / (1 - disc_value / 100);
        } else {
            line_subtotal = total_price + disc_value;
        }

        // The regular price for a single unit is the line subtotal divided by quantity.
        regular_price_without_discount = line_subtotal / quantity;

        return regular_price_without_discount;
    };

    const recalculate = (currentData: any) => {
        const newFormData = { ...currentData };
        let line_discounts = 0;

        newFormData.products = newFormData.products.map((p: any) => {
            const price = getRegularPrice(p);

            const qty = p.quantity || 0;
            const disc_type = p.product_discount?.type;
            const disc_value = p.product_discount?.value || 0;
            const line_subtotal = qty * price;
            const line_discount =
                disc_type === 'PERCENTAGE'
                    ? (disc_value / 100) * line_subtotal
                    : disc_value;
            const line_total = line_subtotal - line_discount;
            line_discounts += line_discount;

            let new_total_cost = 0;
            if (p.quantity && p.total_cost !== undefined && p.quantity > 0) {
                const unit_cost = p.total_cost / p.quantity;
                new_total_cost = qty * unit_cost;
            }

            return {
                ...p,
                total_price: line_total,
                total_cost: new_total_cost
            };
        });

        const sub_total = newFormData.products.reduce(
            (sum: number, p: any) => sum + (p.total_price || 0),
            0
        );

        const overall_type = newFormData.overall_discount.type;
        const overall_value = newFormData.overall_discount.value;

        const overall_disc =
            overall_type === 'PERCENTAGE'
                ? (overall_value / 100) * sub_total
                : overall_value;

        const total_discount = line_discounts + overall_disc;
        const grand_total = sub_total - overall_disc;
        const paid = newFormData.paid_amount || 0;
        const due = grand_total - paid;
        const total_cost = newFormData.products.reduce(
            (sum: number, p: any) => sum + (p.total_cost || 0),
            0
        );
        const profit = grand_total - total_cost;

        newFormData.sub_total = sub_total;
        newFormData.total_discount = total_discount;
        newFormData.total_amount = grand_total;
        newFormData.due_amount = due;
        newFormData.total_cost = total_cost;
        newFormData.profit = profit;

        return newFormData;
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev) => recalculate({ ...prev, [field]: value }));
    };

    const updateOverallDiscount = (key: string, value: any) => {
        setFormData((prev) => {
            const newOverall = { ...prev.overall_discount, [key]: value };
            return recalculate({ ...prev, overall_discount: newOverall });
        });
    };

    const updateProduct = (
        index: number,
        key: string,
        subKey: string | null,
        value: any
    ) => {
        setFormData((prev) => {
            const newForm = { ...prev };
            const newProducts: any = [...newForm.products];
            if (subKey) {
                newProducts[index] = {
                    ...newProducts[index],
                    [key]: {
                        ...newProducts[index][key],
                        [subKey]: value
                    }
                };
            } else {
                newProducts[index] = {
                    ...newProducts[index],
                    [key]: value
                };
            }
            newForm.products = newProducts;
            return recalculate(newForm);
        });
    };

    const removeProduct = (index: number) => {
        setFormData((prev) => {
            const newForm = { ...prev };
            const newProducts = [...newForm.products];
            newProducts.splice(index, 1);
            newForm.products = newProducts;
            return recalculate(newForm);
        });
    };

    const addProduct = (inv: any) => {
        setFormData((prev) => {
            const newForm: any = { ...prev };
            newForm.products = [
                ...newForm.products,
                {
                    product: inv.product,
                    selected_variant: inv.selected_variant
                        ? inv?.selected_variant
                        : inv?.variant,
                    quantity: 1,
                    product_discount: { type: 'FLAT', value: 0 },
                    total_price: inv.selected_variant?.regular_price || 0,
                    total_cost: 0
                }
            ];
            return recalculate(newForm);
        });
        setSearchTerm('');
    };

    // === reset api and set form default data on ui ===
    useEffect(() => {
        if (sale) {
            setFormData({
                _id: sale._id ?? '',
                products: sale.products ?? [],
                customer_phone: sale.customer_phone ?? '',
                sale_note: sale.sale_note ?? '',
                sale_date: sale?.sale_date ? new Date(sale.sale_date) : null,
                payment_note: sale.payment_note ?? '',
                overall_discount: {
                    type: sale.overall_discount?.type,
                    value: sale.overall_discount?.value
                },
                total_discount: sale.total_discount ?? 0,
                sub_total: sale.sub_total ?? 0,
                payment_status: sale.payment_status,
                due_amount: sale.due_amount ?? 0,
                paid_amount: sale.paid_amount ?? 0,
                partial_amount: sale.partial_amount ?? 0,
                total_cost: sale.total_cost ?? 0,
                profit: sale.profit ?? 0,
                total_amount: sale.total_amount ?? 0,
                payment_method: sale.payment_method ?? 'Cash',
                payment_account: sale.payment_account ?? ''
            });
        }
    }, [sale]);

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading || isLoading) {
        return <PermissionLoaderCard />;
    }
    return (
        <section className='space-y-6'>
            <div className='flex items-center gap-2'>
                <BackBtn />
                <h1 className='text-lg font-medium'>Edit Sale</h1>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleEditPosSale();
                }}
                className='h-full w-full space-y-6'
            >
                <div className='grid h-full w-full gap-6 lg:grid-cols-4'>
                    <div className='h-full space-y-6 overflow-hidden rounded-lg bg-background p-4 shadow-md lg:col-span-3 lg:p-6'>
                        <p className='text-lg font-medium'>
                            Sale ID: {sale?.sale_serial_id}
                        </p>
                        <DatePicker
                            label='Sale Date'
                            value={
                                formData.sale_date
                                    ? formData.sale_date
                                          .toISOString()
                                          .slice(0, 16)
                                    : ''
                            }
                            onChange={(dateString) =>
                                updateField(
                                    'sale_date',
                                    dateString ? new Date(dateString) : null
                                )
                            }
                        />

                        <div className='relative'>
                            <Input
                                placeholder='Search by SKU'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {searchTerm && (
                                <div className='absolute top-full z-20 w-full border bg-background p-2 shadow'>
                                    {(isStockLoading || isStockFetching) && (
                                        <div className='top-full w-full py-6 text-center text-sm text-muted-foreground'>
                                            <Loader className='mx-auto size-4 animate-spin' />
                                        </div>
                                    )}
                                    {!isStockLoading &&
                                        !isStockFetching &&
                                        stocks?.length === 0 && (
                                            <div className='top-full w-full py-6 text-center text-sm text-muted-foreground'>
                                                No products found.
                                            </div>
                                        )}
                                    <div className='max-h-96 space-y-2 overflow-y-auto'>
                                        {!isStockLoading &&
                                            !isStockFetching &&
                                            stocks?.map(
                                                (stock: any, idx: number) => {
                                                    // product variant
                                                    const variant =
                                                        Object.entries(
                                                            stock?.variant
                                                                ?.attribute_values ||
                                                                {}
                                                        )
                                                            ?.map(
                                                                (item) =>
                                                                    item?.[1]
                                                            )
                                                            .join(' - ');

                                                    const productName =
                                                        stock?.product?.name;
                                                    const productSku =
                                                        stock?.variant?.sku;
                                                    const regularPrice =
                                                        stock?.variant
                                                            ?.regular_price;

                                                    return (
                                                        <Button
                                                            key={idx}
                                                            variant='ghost'
                                                            className='w-full justify-start'
                                                            onClick={() => {
                                                                addProduct(
                                                                    stock
                                                                );
                                                                setSearchTerm(
                                                                    ''
                                                                );
                                                            }}
                                                            type='button'
                                                        >
                                                            {productName} (
                                                            {variant}) SKU:{' '}
                                                            {productSku} Price:
                                                            ৳{regularPrice}
                                                        </Button>
                                                    );
                                                }
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Table className='rounded-md border'>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Regular Price</TableHead>
                                    <TableHead>Discount Type</TableHead>
                                    <TableHead>Discount Value</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.products.map((field: any, index) => {
                                    const regularPrice = getRegularPrice(field);

                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <p>
                                                    {field?.product?.name ||
                                                        'Unknown'}
                                                </p>
                                                <p className='text-xs text-muted-foreground'>
                                                    SKU:{' '}
                                                    {field?.selected_variant
                                                        ?.sku || ''}
                                                </p>
                                            </TableCell>

                                            <TableCell>
                                                <Input
                                                    type='number'
                                                    value={field.quantity}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        const newValue =
                                                            value === ''
                                                                ? ''
                                                                : Number(
                                                                      value
                                                                  ) || 0;
                                                        updateProduct(
                                                            index,
                                                            'quantity',
                                                            null,
                                                            newValue
                                                        );
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    className='w-20'
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {/* ৳ {field?.selected_variant?.regular_price || 0} */}
                                                ৳ {regularPrice || 0}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    onValueChange={(value) =>
                                                        updateProduct(
                                                            index,
                                                            'product_discount',
                                                            'type',
                                                            value
                                                        )
                                                    }
                                                    value={
                                                        field.product_discount
                                                            ?.type
                                                    }
                                                >
                                                    <SelectTrigger className='w-32'>
                                                        <SelectValue placeholder='Type' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='PERCENTAGE'>
                                                            Percentage
                                                        </SelectItem>
                                                        <SelectItem value='FLAT'>
                                                            Flat
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type='number'
                                                    value={
                                                        field.product_discount
                                                            ?.value
                                                    }
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        const newValue =
                                                            value === ''
                                                                ? ''
                                                                : Number(
                                                                      value
                                                                  ) || 0;
                                                        updateProduct(
                                                            index,
                                                            'product_discount',
                                                            'value',
                                                            newValue
                                                        );
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    className='w-24'
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type='number'
                                                    value={field.total_price}
                                                    onChange={(e) =>
                                                        updateProduct(
                                                            index,
                                                            'total_price',
                                                            null,
                                                            parseFloat(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    className='w-40'
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    size='icon'
                                                    onClick={() =>
                                                        removeProduct(index)
                                                    }
                                                >
                                                    <Trash />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* calculations */}
                    <div className='h-full w-full space-y-6 rounded-lg bg-background shadow-md'>
                        <CalculationsSummary formData={formData} />
                        <div className='grid w-full grid-cols-2 gap-6 px-4 lg:px-6'>
                            <div className='space-y-2'>
                                <Label>Overall Discount Type</Label>
                                <Select
                                    onValueChange={(value) =>
                                        updateOverallDiscount('type', value)
                                    }
                                    value={
                                        formData.overall_discount.type
                                            ? formData.overall_discount.type
                                            : sale?.overall_discount?.type
                                    }
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='PERCENTAGE'>
                                            Percentage
                                        </SelectItem>
                                        <SelectItem value='FLAT'>
                                            Flat
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label>Overall Discount Value</Label>
                                <Input
                                    type='number'
                                    value={formData.overall_discount.value}
                                    onChange={(e) =>
                                        updateOverallDiscount(
                                            'value',
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className='space-y-6 px-4 pb-4 lg:px-6 lg:pb-6'>
                            <div className='space-y-2'>
                                <Label>Payment Method</Label>
                                <Select
                                    onValueChange={(value) =>
                                        updateField('payment_method', value)
                                    }
                                    value={formData.payment_method}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select method' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHODS.map((method) => (
                                            <SelectItem
                                                key={method}
                                                value={method}
                                            >
                                                {method}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label>Paid Amount</Label>
                                <Input
                                    type='number'
                                    value={formData.paid_amount}
                                    onChange={(e) =>
                                        updateField(
                                            'paid_amount',
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Sale Note</Label>
                                <Textarea
                                    value={formData.sale_note}
                                    onChange={(e) =>
                                        updateField('sale_note', e.target.value)
                                    }
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Payment Note</Label>
                                <Textarea
                                    value={formData.payment_note}
                                    onChange={(e) =>
                                        updateField(
                                            'payment_note',
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='ms-auto w-fit'>
                    <Button
                        type='submit'
                        size='xl'
                        variant='green'
                        disabled={isEditSaleLoading}
                    >
                        {isEditSaleLoading ? (
                            <Loader className='size-4 animate-spin' />
                        ) : (
                            'Update Sale'
                        )}
                    </Button>
                </div>
            </form>
        </section>
    );
};

const CalculationsSummary = ({ formData }: { formData: FormData }) => {
    // const overall_disc =
    //   formData.overall_discount.type === "PERCENTAGE"
    //     ? (formData.overall_discount.value / 100) * formData.sub_total
    //     : formData.overall_discount.value;

    return (
        <div className='space-y-3 border-b p-4 lg:p-6'>
            <div className='flex w-full items-center justify-between gap-4'>
                <p className='text-sm font-medium'>Sub Total:</p>
                <p className='text-sm font-medium'>
                    ৳ {formData.sub_total?.toFixed(0)}
                </p>
            </div>
            <div className='flex w-full items-center justify-between gap-4'>
                <p className='text-sm font-medium'>Total Discount:</p>
                <p className='text-sm font-medium'>
                    ৳ {formData.total_discount.toFixed(0)}
                </p>
            </div>
            <div className='flex w-full items-center justify-between gap-4'>
                <p className='text-sm font-medium'>Grand Total:</p>
                <p className='text-sm font-medium'>
                    ৳ {formData.total_amount?.toFixed(0)}
                </p>
            </div>
            <div className='flex w-full items-center justify-between gap-4'>
                <p className='text-sm font-medium text-destructive'>Due:</p>
                <p className='text-sm font-medium text-destructive'>
                    ৳ {formData.due_amount?.toFixed(0)}
                </p>
            </div>
        </div>
    );
};

export default EditPosSaleForm;
