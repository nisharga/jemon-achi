'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Minus,
    Plus,
    Trash2,
    Truck,
    ShoppingBag,
    CreditCard,
    ChevronUp,
    ChevronDown,
    DollarSign,
    DollarSignIcon
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/shop/components/ui/card';
import { Button } from '@/shop/components/ui/button';
import { Separator } from '@/shop/components/ui/separator';
import { Skeleton } from '@/shop/components/ui/skeleton';
import Image from 'next/image';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Input } from '@/shop/components/ui/input';
import { Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { IVariant } from '@/shop/types/stock';
import { useCouponValidateMutation } from '@/shop/redux/api/order';
import { PaymentDetails } from './ManualPayment';
import { getMediaUrl } from '@/shop/lib/get-media-url';

export type OrderItem = {
    id: string;
    product: {
        _id: string;
        name: string;
        thumbnail?: string;
        variant: IVariant;
        details: any;
    };
    attributes: Record<string, string>;
    quantity: number;
    unitPrice: number;
    lineShipping: number;
    isFreeDelivery?: number;
};

type Props = {
    items: OrderItem[];
    isLoading: boolean;
    isFetching: boolean;
    onInc: (id: string, next: number) => void;
    onDec: (id: string, next: number) => void;
    onRemove: (id: string) => void;

    subTotal: number;
    regularTotal: number;
    isDiscountApply: boolean;
    perLineShippingTotal: number;
    deliveryCharge: number;
    totalDiscount: number;
    totalAmount: number;
    payableNow: number;

    ctaDisabled?: boolean;
    ctaLabel?: string;
    onPlaceOrder?: () => void;

    coupon: string;
    setCoupon: Dispatch<SetStateAction<string>>;
    subTotalCoupon: number;
    totalDiscountCoupon: number;
    totalAmountCoupon: number;
    setSubTotal: Dispatch<SetStateAction<number>>;
    setTotalDiscount: Dispatch<SetStateAction<number>>;
    setTotalAmount: Dispatch<SetStateAction<number>>;

    fields: any;
    onChange: any;
    setUploadedFiles: any;
    payment_type: string;
    isFreeDelivery?: boolean;
};

export default function OrderSummary({
    items,
    isLoading,
    isFetching,
    onInc,
    onDec,
    onRemove,
    subTotal,
    regularTotal,
    isDiscountApply,
    perLineShippingTotal,
    deliveryCharge,
    totalDiscount,
    totalAmount,
    payableNow,
    ctaDisabled,
    ctaLabel = 'Place Order',
    onPlaceOrder,
    coupon,
    setCoupon,
    subTotalCoupon,
    totalDiscountCoupon,
    totalAmountCoupon,
    setSubTotal,
    setTotalDiscount,
    setTotalAmount,

    // payment details
    fields,
    onChange,
    setUploadedFiles,
    payment_type,
    isFreeDelivery
}: Props) {
    const isEmpty = !items.length;
    const isOpen = items?.length === 1 ? true : false;
    // ... inside your OrderSummary component
    const [isItemsExpanded, setIsItemsExpanded] = useState(isOpen);
    return (
        <>
            <Card className='mb-6 rounded-xl border-0 shadow-none'>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='base-medium'>
                            Order Summary
                        </CardTitle>
                        <Truck className='h-5 w-5 text-[#ff5c00]' />
                    </div>
                </CardHeader>
                <CardContent>
                    <button
                        onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                        className='sm-medium mb-3 flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100'
                    >
                        <div className='flex items-center gap-2'>
                            <ShoppingBag className='sm-medium h-4 w-4 text-gray-500' />
                            <span className='block'>
                                {items.length}{' '}
                                {items.length === 1 ? 'Item' : 'Items'} in Cart
                            </span>
                        </div>
                        {isItemsExpanded ? (
                            <ChevronUp className='h-4 w-4' />
                        ) : (
                            <ChevronDown className='h-4 w-4' />
                        )}
                    </button>

                    {/* Items */}
                    <div
                        className={`space-y-3 overflow-hidden transition-all duration-300 ${isItemsExpanded ? 'max-h-[1000px] opacity-100' : 'mb-0 max-h-0 opacity-0'}`}
                    >
                        {isLoading ? (
                            <>
                                {[...Array(2)].map((_, i) => (
                                    <div
                                        key={i}
                                        className='flex gap-3 rounded-lg border border-gray-100 p-3'
                                    >
                                        <Skeleton className='h-18 w-18 rounded-lg' />
                                        <div className='flex-1 space-y-2'>
                                            <Skeleton className='h-4 w-2/3' />
                                            <Skeleton className='h-3 w-1/2' />
                                            <div className='flex items-center justify-between'>
                                                <Skeleton className='h-8 w-24' />
                                                <Skeleton className='h-4 w-16' />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : isEmpty ? (
                            <div className='rounded-lg bg-gray-50 p-4 text-xs text-gray-700'>
                                Your cart is empty.
                            </div>
                        ) : (
                            items?.map((it) => (
                                <motion.div
                                    key={it.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className='flex gap-3 rounded-lg border border-gray-100 p-3'
                                >
                                    <Image
                                        src={
                                            getMediaUrl(it.product.thumbnail) ||
                                            '/placeholder.svg'
                                        }
                                        alt={it.product.name}
                                        width={72}
                                        height={72}
                                        className='h-18 w-18 rounded-lg object-cover'
                                    />
                                    <div className='min-w-0 flex-1'>
                                        <p className='sm-normal line-clamp-2'>
                                            {it.product.name}
                                        </p>
                                        <div className='mt-1 flex flex-wrap gap-2'>
                                            {Object.entries(it.attributes)?.map(
                                                ([key, value]) => {
                                                    // 1. Skip rendering if value is blank/null/undefined
                                                    if (
                                                        !value ||
                                                        String(value).trim() ===
                                                            ''
                                                    )
                                                        return null;

                                                    // 2. Specific Console Logs
                                                    const lowerKey =
                                                        key.toLowerCase();
                                                    if (
                                                        lowerKey === 'size' ||
                                                        lowerKey === 'color'
                                                    ) {
                                                        console.log(
                                                            `${key}:`,
                                                            value
                                                        );
                                                    }

                                                    return (
                                                        <span
                                                            key={key}
                                                            className='xs-normal rounded bg-gray-100 px-2 py-0.5'
                                                        >
                                                            {key}:
                                                            {String(value)}
                                                        </span>
                                                    );
                                                }
                                            )}
                                        </div>

                                        <div className='mt-2 flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        onDec(
                                                            it?.id,
                                                            it?.quantity - 1
                                                        )
                                                    }
                                                    className='rounded-md border border-gray-300 p-1 hover:bg-gray-50 disabled:opacity-50'
                                                    aria-label='Decrease quantity'
                                                    disabled={it?.quantity <= 1}
                                                >
                                                    <Minus className='h-4 w-4' />
                                                </button>
                                                <span className='w-8 text-center text-xs'>
                                                    {it?.quantity}
                                                </span>
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        onInc(
                                                            it?.id,
                                                            it?.quantity + 1
                                                        )
                                                    }
                                                    className='rounded-md border border-gray-300 p-1 hover:bg-gray-50 disabled:opacity-50'
                                                    aria-label='Increase quantity'
                                                >
                                                    <Plus className='h-4 w-4' />
                                                </button>
                                            </div>

                                            <div className='sm-normal'>
                                                Tk{' '}
                                                {(
                                                    it?.unitPrice * it?.quantity
                                                ).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type='button'
                                        onClick={() => onRemove(it.id)}
                                        className='self-start rounded-md p-1 text-red-600 hover:bg-red-50'
                                        aria-label='Remove item'
                                        title='Remove item'
                                    >
                                        <Trash2 className='h-5 w-5' />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* coupon-code box */}
                    <CouponApplyInput
                        coupon={coupon}
                        setCoupon={setCoupon}
                        deliveryCharge={deliveryCharge}
                        items={items}
                        setSubTotal={setSubTotal}
                        setTotalDiscount={setTotalDiscount}
                        setTotalAmount={setTotalAmount}
                    />

                    {/* Totals */}
                    <div className='mt-4 space-y-2'>
                        {isDiscountApply && (
                            <div className='sm-normal flex justify-between'>
                                <span className='sm-normal text-gray-600'>
                                    Regular Price
                                </span>
                                <span className='sm-normal font-normal line-through'>
                                    Tk {regularTotal.toLocaleString()}
                                </span>
                            </div>
                        )}

                        <div className='sm-normal flex justify-between'>
                            <span className='sm-normal text-gray-600'>
                                {isDiscountApply
                                    ? 'Discount Subtotal'
                                    : 'Subtotal'}
                            </span>
                            <span className='sm-normal font-normal'>
                                Tk {subTotal.toLocaleString()}
                            </span>
                        </div>

                        {perLineShippingTotal > 0 && (
                            <div className='sm-normal flex justify-between'>
                                <span className='sm-normal text-gray-600'>
                                    Item Shipping
                                </span>
                                <span className='sm-normal font-normal'>
                                    Tk {perLineShippingTotal.toLocaleString()}
                                </span>
                            </div>
                        )}

                        <div className='sm-normal flex justify-between'>
                            <span className='sm-normal text-gray-600'>
                                Delivery Charge
                            </span>
                            <span className='sm-normal font-normal'>
                                Tk {deliveryCharge.toLocaleString()}{' '}
                                {isFetching ? '…' : ''}
                            </span>
                        </div>

                        <div className='flex justify-between text-xs'>
                            <span className='sm-normal text-gray-600'>
                                Coupon Discount
                            </span>
                            <span className='sm-normal'>
                                Tk {totalDiscountCoupon || 0}{' '}
                            </span>
                        </div>

                        <Separator className='my-2' />

                        <div className='flex justify-between text-xs font-normal'>
                            <span className='sm-normal text-gray-600'>
                                Total
                            </span>
                            <div className='flex items-center gap-2'>
                                <span className='sm-normal text-[#ff5c00]'>
                                    Tk {totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className='flex justify-between text-xs text-gray-600'>
                            <span className='sm-normal'>Pay now</span>
                            <span className='sm-normal font-normal text-gray-900'>
                                Tk {payableNow.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className='rounded-xl border-0 shadow-none'>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        {payment_type !== 'cod' ? (
                            <CardTitle className='base-medium'>
                                Payment Details {payableNow.toLocaleString()}৳
                            </CardTitle>
                        ) : (
                            <CardTitle className='sm-normal-gray'>
                                Cash on Delivery — No Advance Payment Required
                            </CardTitle>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {/* payment-details-box */}
                    {payment_type !== 'cod' && (
                        <PaymentDetails
                            fields={fields}
                            onChange={onChange}
                            setUploadedFiles={setUploadedFiles}
                        />
                    )}

                    {/* CTA */}
                    {!!onPlaceOrder && (
                        <Button
                            type='button'
                            onClick={onPlaceOrder}
                            disabled={!!ctaDisabled}
                            className={`sm-semibold bg-tertiary hover:bg-tertiary/90 w-full rounded-lg py-6 text-white shadow-lg transition hover:-translate-y-px ${payment_type !== 'cod' ? 'mt-5' : ''}`}
                        >
                            {ctaLabel}
                        </Button>
                    )}

                    <div className='sm-normal-gray mt-3 flex items-center justify-between'>
                        <Link
                            href='/cart'
                            className='text-tertiary flex items-center gap-2 hover:underline'
                        >
                            <ShoppingBag className='h-4 w-4' /> Review Cart
                        </Link>
                        <Link
                            href='/'
                            className='text-tertiary flex items-center gap-2 hover:underline'
                        >
                            <CreditCard className='h-4 w-4' /> Continue Shopping
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

interface IProps {
    deliveryCharge: number;
    items: any;
    setSubTotal: Dispatch<SetStateAction<number>>;
    setCoupon: Dispatch<SetStateAction<string>>;
    setTotalDiscount: Dispatch<SetStateAction<number>>;
    setTotalAmount: Dispatch<SetStateAction<number>>;
    coupon: string;
}

const CouponApplyInput = ({
    deliveryCharge,
    items,
    setSubTotal,
    setTotalDiscount,
    setTotalAmount,
    setCoupon,
    coupon
}: IProps) => {
    const [couponCode, setCouponCode] = useState('');

    const [validateCoupon, { isLoading }] = useCouponValidateMutation();

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        try {
            // 1. Transform your cart 'items' into the required API format
            const formattedProducts = items.map((item: any) => ({
                product: item.product?._id, // Extract the product ID
                selected_variant: {
                    _id: item?.product?.variant?._id // Extract the variant ID
                },
                total_quantity: item.quantity,
                shipping_cost: item.product?.details?.shipping_cost || 0,
                shipping_cost_per_unit:
                    item.product?.details?.shipping_cost_per_unit || 0,
                status: 'PLACED'
            }));

            // 2. Build the dynamic payload
            const payload = {
                code: couponCode,
                orderData: {
                    products: formattedProducts,
                    delivery_charge: deliveryCharge
                }
            };

            const res: any = await validateCoupon({ payload });
            console.log('res: ', res);

            if (res?.data?.success) {
                toast.success('Coupon code applied successfully!');
                setSubTotal(res?.data?.data?.calculatedOrder?.sub_total);
                setTotalAmount(res?.data?.data?.calculatedOrder?.total_amount);
                setTotalDiscount(
                    res?.data?.data?.calculatedOrder?.total_discount
                );
                setCoupon(res?.data?.data?.coupon.code);
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Coupon code applied failed!!'
                );
            }
        } catch (error: any) {
            console.error('COUPON ERROR:', error);
            toast.error(error?.data?.message || 'Invalid coupon code');
        }
    };

    // === Remove Coupon Feature ===
    const handleRemoveCoupon = () => {
        setCoupon(''); // Reset coupon code string
        setTotalDiscount(0); // Reset discount amount
        // Note: Usually, your parent component should handle recalculating the
        // original Total Amount based on the items when coupon is empty.
        toast.info('Coupon removed');
    };

    return (
        <div className='w-full max-w-sm space-y-2'>
            <label className='sm-normal-gray mb-2 ml-1 font-normal text-muted-foreground uppercase'>
                Have a coupon?
            </label>
            <div className='flex w-full items-center space-x-2'>
                <div className='relative flex-1'>
                    <Tag className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Enter code (e.g. FIRST50)'
                        className='sm-normal border-secondary pl-9 placeholder:text-sm'
                        value={couponCode}
                        onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) =>
                            e.key === 'Enter' && handleApplyCoupon()
                        }
                    />
                </div>
                <Button
                    type='button'
                    onClick={handleApplyCoupon}
                    disabled={isLoading || !couponCode}
                    className='min-w-[80px] bg-primary text-white hover:bg-primary/90'
                >
                    {isLoading ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        'Apply'
                    )}
                </Button>
            </div>

            {/* Conditional Message / Remove Feature */}
            <div className='ml-1'>
                {coupon ? (
                    <div className='flex items-center justify-between rounded-md border border-green-100 bg-green-50 p-2'>
                        <p className='xs-normal font-normal text-green-700'>
                            Applied: <span className='font-bold'>{coupon}</span>
                        </p>
                        <button
                            onClick={handleRemoveCoupon}
                            className='flex items-center gap-1 text-[11px] font-normal text-red-600 underline hover:text-red-700'
                        >
                            <Trash2 className='h-3 w-3' /> Remove
                        </button>
                    </div>
                ) : (
                    <p className='xs-normal text-muted-foreground'>
                        Apply a code to see discounts on your order total.
                    </p>
                )}
            </div>
        </div>
    );
};
