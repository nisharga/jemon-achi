'use client';
import type { Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v3';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/admin-button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/admin-form';
import { Input } from '@/components/ui/admin-input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/admin-separator';
import { X, Plus, Minus, Loader, ImagePlus } from 'lucide-react';
import useDebounce from '@/hooks/use-debounce';
import { useUploadMultipleFileToAWSMutation } from '@/redux/api-queries/file-upload-api';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCreateOrderByAdminMutation } from '@/redux/api-queries/order-api';
import { useGetAllSearchVariantsQuery } from '@/redux/api-queries/product-api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { FraudData } from '@/redux/api-queries/fraudApi';
import FraudListModal from '@/components/shared/FraudListModal';
import { getImgFullUrl } from '@/lib/admin-utils';

// === simple zod schema for the form (products intentionally removed) ===
const DeliveryAddressSchema = z.object({
    division: z.string().optional(),
    district: z.string().optional(),
    thana: z.string().optional(),
    address: z.string().min(5, { message: 'Address is required.' })
});

const OrderFormSchema = z.object({
    customer_name: z.string().min(2, { message: 'Customer name is required.' }),
    customer_phone: z
        .string()
        .min(11, 'Phone number should be 11 digits')
        .max(11, 'Phone number should be 11 digits'),
    // orders_by: z.enum(["admin", "user", "guest"]).default("admin"),
    delivery_address: DeliveryAddressSchema,
    payment_type: z
        .enum(['CASH_ON_DELIVERY', 'FULL_PAYMENT'])
        .default('CASH_ON_DELIVERY'),
    delivery_charge: z.coerce.number().default(70),
    overall_discount_amount: z.coerce.number().default(0),
    paid_amount: z.coerce.number().default(0),
    order_note: z.string().optional()
});

type OrderFormValues = z.infer<typeof OrderFormSchema>;

// === cart item type (loose typing on purpose) ===
type CartItem = {
    product: string;
    variant: string;
    total_quantity: number;
    price: number;
    attributes?: Record<string, any>;
    label?: string;
};

const CreateOrderForm = () => {
    // === router ===
    const router = useRouter();

    // === form setup ===
    const form = useForm<OrderFormValues>({
        // @hookform/resolvers v5+ types input/output separately; the form uses the output type.
        resolver: zodResolver(OrderFormSchema) as Resolver<OrderFormValues>,
        defaultValues: {
            customer_name: '',
            customer_phone: '',
            delivery_address: {
                division: '',
                district: '',
                thana: '',
                address: ''
            },
            payment_type: 'CASH_ON_DELIVERY',
            delivery_charge: 70,
            overall_discount_amount: undefined,
            paid_amount: undefined,
            order_note: ''
        },
        mode: 'onChange'
    });

    const phoneNumber = form.watch('customer_phone');

    // === fraud Checker API ===
    const [fraudData, setFraudData] = useState<FraudData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFraudData = async () => {
            if (!phoneNumber) {
                return;
            }

            const phone = phoneNumber.replace(/\D/g, '');
            if (phoneNumber.length < 10) {
                return;
            }
            setLoading(true);

            try {
                const url = `/api/fraud-check?phone=${encodeURIComponent(phone)}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const apiResponse = await response.json();
                const fraudInfo = apiResponse.data;
                setFraudData(fraudInfo || null);
            } catch (error) {
                console.error('Error fetching fraud data:', error);
                const errorData: FraudData = {
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Failed to fetch fraud data',
                    apis: false
                };
                setFraudData(errorData);
            } finally {
                setLoading(false);
            }
        };

        fetchFraudData();
    }, [phoneNumber]);

    // === cart state - product selection is handled here (not in the form) ===
    const [cart, setCart] = useState<CartItem[]>([]);

    // === advance payment proof (optional) ===
    const [senderNumber, setSenderNumber] = useState('');
    const [trxId, setTrxId] = useState('');
    const [paymentFiles, setPaymentFiles] = useState<File[]>([]);
    const [uploadMultipleFiles, { isLoading: isUploadingProof }] =
        useUploadMultipleFileToAWSMutation();

    const handleProofFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setPaymentFiles((prev) => [...prev, ...files]);
        }
        // reset so selecting the same file again still fires onChange
        e.target.value = '';
    };

    const removeProofFile = (index: number) => {
        setPaymentFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // === search / variants ===
    const [searchQ, setSearchQ] = useState('');
    const debounced = useDebounce(searchQ);
    const { data: searchVariantsData } = useGetAllSearchVariantsQuery(
        {
            page: 1,
            limit: 30,
            barcode: '',
            searchQuery: debounced,
            product_id: ''
        },
        {
            pollingInterval: 30000 // polling on every 30s
        }
    );
    const searchVariants = searchVariantsData?.data?.data || [];

    // === add a variant to cart (if exists then increment total_quantity) ===
    function addVariantToCart(variant: any) {
        // if (variant?.total_available_quantity <= 0) {
        //   return toast.error("Product stocked out!");
        // }

        setCart((prev) => {
            const existing = prev.find((p) => p.variant === variant?._id);
            if (existing) {
                return prev.map((p) =>
                    p.variant === variant?._id
                        ? { ...p, total_quantity: p.total_quantity + 1 }
                        : p
                );
            }
            const item: CartItem = {
                product: variant.product?._id,
                variant: variant?._id,
                total_quantity: 1,
                price: Number(variant?.sale_price),
                attributes: normalizeAttributes(
                    variant.attribute_values || variant.attributes || {}
                ),
                label: `${
                    variant.product?.name ?? variant.product?.title ?? 'Product'
                } - ${variant.sku ?? variant.barcode ?? variant._id}`
            };
            return [...prev, item];
        });
    }

    function normalizeAttributes(src: Record<string, any>) {
        const out: Record<string, any> = {};
        Object.keys(src).forEach((k) => {
            out[k.toLowerCase()] = src[k];
        });
        return out;
    }

    // === update cart ===
    function updateCartQuantity(variantId: string, delta: number) {
        setCart((prev) =>
            prev
                .map((p) =>
                    p.variant === variantId
                        ? {
                              ...p,
                              total_quantity: Math.max(
                                  1,
                                  p.total_quantity + delta
                              )
                          }
                        : p
                )
                .filter(Boolean)
        );
    }

    // === remove from cart ===
    function removeFromCart(variantId: string) {
        setCart((prev) => prev.filter((p) => p.variant !== variantId));
    }

    // === read delivery/discount/paid values from form (they live in the right column form) ===
    const deliveryChargeNum = Number(form.watch('delivery_charge') ?? 0);
    const discountsNum = Number(form.watch('overall_discount_amount') ?? 0);
    const paidAmountNum = Number(form.watch('paid_amount') ?? 0);
    // === computed total ===
    const subtotal = useMemo(
        () => cart.reduce((s, it) => s + it.price * it.total_quantity, 0),
        [cart]
    );
    // === grand total (without subtracting paid/discounts as requested) ===
    const grandTotal = useMemo(
        () => subtotal + deliveryChargeNum - (discountsNum + paidAmountNum),
        [subtotal, deliveryChargeNum, discountsNum, paidAmountNum]
    );

    // === create order api mutation hook ===
    const [createOrder, { isLoading }] = useCreateOrderByAdminMutation();

    // === handle create order ===
    const handleCreateOrder = async (values: OrderFormValues) => {
        if (cart?.length === 0) {
            return toast.error('Please select any product!');
        }

        const payload: any = {
            ...values,
            products: cart?.map((c) => ({
                product: c.product,
                variant: c.variant,
                total_quantity: c.total_quantity,
                price: c.price,
                attribute_values: c.attributes
            })),
            overall_discount_type: 'FLAT'
        };

        try {
            // === upload advance payment proof (optional) ===
            const hasProof =
                paymentFiles.length > 0 || senderNumber.trim() || trxId.trim();
            if (hasProof) {
                let uploadedFiles: string[] = [];
                if (paymentFiles.length > 0) {
                    const uploadRes: any =
                        await uploadMultipleFiles(paymentFiles);
                    if (uploadRes?.data?.success) {
                        uploadedFiles = uploadRes?.data?.data?.urls || [];
                    } else {
                        toast.error('Payment proof upload failed!');
                        return;
                    }
                }
                payload.manual_payment_info = {
                    sender_number: senderNumber.trim() || undefined,
                    trxId: trxId.trim() || undefined,
                    paid_amount: Number(values.paid_amount ?? 0),
                    files: uploadedFiles
                };
            }

            const res: any = await createOrder({ payload });

            if (res?.data?.success) {
                toast.success('New order created!');
                router.replace('/admin/orders');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to create order!'
                );
            }
        } catch (error: any) {
            console.error('CREATE ORDER ERROR: ', error);
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

    return (
        <div className=''>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* === left: product search + cart (cart stored in local state) === */}
                <div className='flex flex-col gap-6 space-y-4 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl lg:p-6'>
                    <div className='space-y-4'>
                        <label className='mb-1 block text-sm font-medium'>
                            Search Product
                        </label>
                        <div className='flex gap-2'>
                            <Input
                                value={searchQ}
                                onChange={(e) => setSearchQ(e.target.value)}
                                placeholder='Search by name, sku, barcode...'
                            />
                        </div>
                        <div className='max-h-80 overflow-auto rounded-md border bg-muted p-2'>
                            {searchVariants.length === 0 ? (
                                <div className='text-sm text-muted-foreground'>
                                    No variants found (try typing)
                                </div>
                            ) : (
                                searchVariants?.map((v: any) => {
                                    return (
                                        <div
                                            key={v?._id}
                                            className='flex items-center justify-between gap-2 border-b p-2 last:border-b-0'
                                        >
                                            <div className='flex gap-1.5'>
                                                <Image
                                                    src={getImgFullUrl(
                                                        v?.product?.thumbnail
                                                    )}
                                                    alt='product thumbnail'
                                                    height={360}
                                                    width={360}
                                                    className='size-10 rounded'
                                                />
                                                <div className='text-sm'>
                                                    <div className='font-medium'>
                                                        {v?.product?.name ??
                                                            'Product'}{' '}
                                                        ({v?.sku})
                                                    </div>
                                                    <div className='text-xs'>
                                                        {v.attribute_values
                                                            ? Object.entries(
                                                                  v.attribute_values
                                                              )
                                                                  .map(
                                                                      ([
                                                                          k,
                                                                          val
                                                                      ]) =>
                                                                          `${k}: ${val}`
                                                                  )
                                                                  .join(' • ')
                                                            : ''}
                                                    </div>
                                                    <div className='text-xs'>
                                                        Price:{' '}
                                                        {v.sale_price ??
                                                            v.regular_price}
                                                    </div>
                                                    <div className='text-xs'>
                                                        Stock:{' '}
                                                        {v.total_available_quantity ??
                                                            'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Button
                                                    size='icon'
                                                    variant='outline'
                                                    onClick={() =>
                                                        addVariantToCart(v)
                                                    }
                                                >
                                                    <Plus />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className='space-y-4 rounded-md border p-2'>
                        <div className='flex items-center justify-between'>
                            <h3 className='font-medium'>Ordered Products</h3>
                            <div className='text-sm'>Sub Total: {subtotal}</div>
                        </div>

                        <div className='max-h-64 space-y-2 overflow-auto'>
                            {cart?.length === 0 && (
                                <div className='text-sm text-muted-foreground'>
                                    No items in cart
                                </div>
                            )}

                            {cart?.map((c) => (
                                <div
                                    key={c.variant}
                                    className='flex items-start gap-2 rounded-md border p-2'
                                >
                                    <div className='flex-1'>
                                        <div className='flex items-center justify-between'>
                                            <div className='text-sm font-medium'>
                                                {c.label}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeFromCart(c.variant)
                                                }
                                                title='remove'
                                                className='p-1'
                                            >
                                                <X className='h-4 w-4' />
                                            </button>
                                        </div>

                                        <div className='mt-1 text-xs'>
                                            {Object.entries(c.attributes || {})
                                                .map(([k, v]) => `${k}: ${v}`)
                                                .join(' • ')}
                                        </div>

                                        <div className='mt-2 flex items-center gap-2'>
                                            <button
                                                onClick={() =>
                                                    updateCartQuantity(
                                                        c.variant,
                                                        -1
                                                    )
                                                }
                                                className='rounded border p-1'
                                            >
                                                <Minus className='h-4 w-4' />
                                            </button>
                                            <div className='px-3'>
                                                {c.total_quantity}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    updateCartQuantity(
                                                        c.variant,
                                                        +1
                                                    )
                                                }
                                                className='rounded border p-1'
                                            >
                                                <Plus className='h-4 w-4' />
                                            </button>
                                            <div className='ml-auto text-sm font-medium'>
                                                {(
                                                    c.price * c.total_quantity
                                                ).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* === right: form === */}
                <div className='grid gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl lg:p-6'>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleCreateOrder)}
                            className='flex flex-col gap-6'
                        >
                            <div className='relative grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                <FormField
                                    control={form.control}
                                    name='customer_name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Customer Name *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='Arif Khan'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='customer_phone'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Customer Phone *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='01XXXXXXXXX'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {phoneNumber?.length > 10 && (
                                    <div className='absolute right-0 -bottom-5 flex justify-end'>
                                        <FraudListModal
                                            fraudData={fraudData}
                                            loading={loading}
                                            className='!flex-row'
                                        />
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <FormField
                                control={form.control}
                                name='delivery_address.address'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Delivery Address *
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='House 12, Road 5, Dhanmondi'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='order_note'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Delivery Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Enter Delivery Note (Optional)'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Separator />

                            <FormField
                                control={form.control}
                                name='payment_type'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select a payment type' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='CASH_ON_DELIVERY'>
                                                    Cash on Delivery
                                                </SelectItem>
                                                <SelectItem value='FULL_PAYMENT'>
                                                    Full Payment
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                                <FormField
                                    control={form.control}
                                    name='delivery_charge'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Delivery Charge
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    placeholder='70'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='paid_amount'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Advances Payment
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    placeholder='0'
                                                    {...field}
                                                    value={
                                                        field.value ===
                                                        undefined
                                                            ? ''
                                                            : field.value
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='overall_discount_amount'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    placeholder='0'
                                                    {...field}
                                                    value={
                                                        field.value ===
                                                        undefined
                                                            ? ''
                                                            : field.value
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* === advance payment proof (optional) === */}
                            <div className='space-y-3'>
                                <p className='text-sm font-medium'>
                                    Advance Payment Proof{' '}
                                    <span className='text-muted-foreground'>
                                        (Optional)
                                    </span>
                                </p>
                                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                    <div className='space-y-1'>
                                        <label className='text-xs text-muted-foreground'>
                                            Sender Number
                                        </label>
                                        <Input
                                            placeholder='01XXXXXXXXX'
                                            value={senderNumber}
                                            onChange={(e) =>
                                                setSenderNumber(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className='text-xs text-muted-foreground'>
                                            Transaction ID
                                        </label>
                                        <Input
                                            placeholder='TrxID'
                                            value={trxId}
                                            onChange={(e) =>
                                                setTrxId(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <label className='flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 text-sm hover:bg-muted'>
                                        <ImagePlus className='size-4' />
                                        Upload Payment Screenshot
                                        <input
                                            type='file'
                                            accept='image/*'
                                            multiple
                                            className='hidden'
                                            onChange={handleProofFilesChange}
                                        />
                                    </label>

                                    {paymentFiles.length > 0 && (
                                        <div className='flex flex-wrap gap-2'>
                                            {paymentFiles.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className='relative size-20'
                                                >
                                                    <Image
                                                        src={URL.createObjectURL(
                                                            file
                                                        )}
                                                        alt={`proof-${index}`}
                                                        width={80}
                                                        height={80}
                                                        className='size-20 rounded-md border object-cover'
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            removeProofFile(
                                                                index
                                                            )
                                                        }
                                                        className='absolute -top-2 -right-2 rounded-full bg-destructive p-0.5 text-white'
                                                    >
                                                        <X className='size-3' />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />
                            {/* === cart summary: discount, paid amount, subtotal, grandtotal (grandtotal without subtracting paid/discounts) === */}
                            <div className='grid gap-2'>
                                <div className='flex justify-between text-sm font-medium'>
                                    <p>Subtotal</p>
                                    <p className='text-base'>
                                        {subtotal.toFixed(0)}
                                    </p>
                                </div>

                                <div className='flex justify-between text-sm font-medium'>
                                    <p>Delivery Charge</p>
                                    <p className='text-base'>
                                        {deliveryChargeNum.toFixed(0)}
                                    </p>
                                </div>

                                <div className='flex justify-between text-sm font-medium'>
                                    <p>Discounts</p>
                                    <p className='text-base'>
                                        {discountsNum.toFixed(0)}
                                    </p>
                                </div>

                                <div className='flex justify-between text-sm font-medium'>
                                    <p>Advanced</p>
                                    <p className='text-base'>
                                        {paidAmountNum.toFixed(0)}
                                    </p>
                                </div>

                                <div className='flex justify-between text-sm font-medium'>
                                    <p>Grand Total</p>
                                    <p className='text-base'>
                                        {grandTotal.toFixed(0)}
                                    </p>
                                </div>
                            </div>

                            <div className='mt-auto'>
                                <Button
                                    type='submit'
                                    className='w-full'
                                    disabled={
                                        isLoading ||
                                        isUploadingProof ||
                                        cart?.length === 0
                                    }
                                >
                                    {isLoading || isUploadingProof ? (
                                        <>
                                            <Loader className='size-4 animate-spin' />{' '}
                                            {isUploadingProof
                                                ? 'Uploading proof..'
                                                : 'Order Creating..'}
                                        </>
                                    ) : (
                                        <>Create Order (৳ {grandTotal})</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default CreateOrderForm;
