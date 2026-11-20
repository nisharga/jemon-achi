'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2,
    Home,
    ShoppingBag,
    MapPin,
    Phone,
    User2,
    Receipt,
    CalendarClock,
    Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { OrderIdBadge } from './_components/OrderBatch';
import { getMediaUrl } from '@/shop/lib/get-media-url';

type VariantAttrs = Record<string, string>;

interface OrderProduct {
    product:
        | {
              _id?: string;
              id?: string;
              name?: string;
              thumbnail?: string;
          }
        | string; // just in case API sometimes returns a string id
    total_quantity: number;
    total_price: number;
    selected_variant?: {
        attribute_values?: VariantAttrs;
        sku?: string;
        regular_price?: number;
        sale_price?: number;
        barcode?: string;
        _id?: string;
    };
    discount_amount?: number;
    discount_type?: string;
    shipping_cost?: number;
    shipping_cost_per_unit?: number;
    total_shipping_cost?: number;
    is_free_delivery?: boolean;
    _id?: string;
}

interface OrderData {
    bkashURL?: string;
    _id?: string;
    order_serial_id?: number;
    invoice_number?: string;
    customer_name?: string;
    customer_phone?: string;
    total_amount?: number;
    payable_amount?: number;
    COD?: number;
    payment_type?: string;
    delivery_address?: {
        division?: string;
        district?: string;
        thana?: string;
        address?: string;
    };
    products?: OrderProduct[];
    order_date?: string;
    createdAt?: string;
    status?: string;
    delivery_charge?: number;
    total_discount?: number;
}

const fmtBDT = (n?: number) =>
    typeof n === 'number' ? `৳${n.toLocaleString()}` : '৳0';

const fmtDateTime = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function OrderSuccessPage() {
    const router = useRouter();
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        try {
            const saved = sessionStorage?.getItem('lastOrder');
            if (saved) {
                const parsed = JSON.parse(saved);
                setOrderData(parsed ?? null);
            } else {
                setOrderData(null);
            }
        } catch {
            setOrderData(null);
        } finally {
            setChecked(true);
        }
    }, []);

    const items = useMemo(() => orderData?.products ?? [], [orderData]);

    if (checked && !orderData) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6'>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm'
                >
                    <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100'>
                        <Receipt className='h-10 w-10 text-gray-400' />
                    </div>
                    <h1 className='mb-2 text-2xl font-bold text-gray-900'>
                        No recent order found
                    </h1>
                    <p className='mb-6 text-gray-600'>
                        We couldn’t find an order in this session. It may have
                        expired or you opened this page directly.
                    </p>
                    <div className='grid grid-cols-2 gap-3'>
                        <button
                            onClick={() => router.push('/')}
                            className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-secondary transition-colors hover:bg-primary/90'
                        >
                            <Home className='h-5 w-5' />
                            Go Home
                        </button>
                        <button
                            onClick={() => router.push('/orders')}
                            className='flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50'
                        >
                            <ShoppingBag className='h-5 w-5' />
                            View Orders
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!checked) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-gray-50'>
                <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-primary' />
            </div>
        );
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white sm:p-6'>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className='w-full max-w-3xl rounded-2xl bg-white px-2 py-6 sm:p-8'
            >
                {/* Header */}
                <div className='flex flex-col items-center text-center'>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 220,
                            delay: 0.05
                        }}
                        className='mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100'
                    >
                        <CheckCircle2 className='h-12 w-12 text-green-600' />
                    </motion.div>

                    {/*  {orderData?.invoice_number && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 inline-flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" />
              {orderData?.invoice_number}
            </span>
          )} */}

                    <OrderIdBadge invoiceNumber={orderData?.invoice_number} />

                    <h1
                        className='mb-2 text-2xl font-medium text-gray-900 sm:text-3xl'
                        lang='bn'
                    >
                        Order successfully placed
                    </h1>
                    <p className='text-gray-600'>
                        Your order has been placed successfully. We’ll contact
                        you soon.
                    </p>

                    {/* Meta badges */}
                    <div className='mt-4 flex flex-wrap items-center justify-center gap-2'>
                        {orderData?.status && (
                            <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
                                {orderData?.status}
                            </span>
                        )}

                        {orderData?.order_date && (
                            <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700'>
                                <CalendarClock className='h-3.5 w-3.5' />
                                {fmtDateTime(
                                    orderData?.order_date ||
                                        orderData?.createdAt
                                )}
                            </span>
                        )}
                    </div>
                </div>

                {/* Summary + Address grid */}
                <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6'>
                    {/* Order summary card */}
                    <div className='lg:col-span-2'>
                        <div className='rounded-xl border border-gray-300'>
                            <div className='flex items-center gap-2 border-b border-gray-300 p-5'>
                                <Package className='h-5 w-5 text-gray-500' />
                                <h2 className='text-base font-semibold text-gray-900'>
                                    Ordered Items
                                </h2>
                            </div>

                            <div className='divide-y'>
                                {items.map((p, idx) => {
                                    const productObj =
                                        typeof p?.product === 'string'
                                            ? undefined
                                            : p?.product;
                                    const name = productObj?.name ?? 'Product';
                                    const thumb =
                                        productObj?.thumbnail ??
                                        '/placeholder.svg?height=64&width=64';
                                    const attrs =
                                        p?.selected_variant?.attribute_values ??
                                        {};
                                    const attrPairs = Object.entries(attrs);

                                    return (
                                        <div
                                            key={p?._id ?? idx}
                                            className='flex items-start gap-4 p-5'
                                        >
                                            {/* Thumb */}
                                            <div className='h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100'>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={getMediaUrl(thumb)}
                                                    alt={name}
                                                    className='h-full w-full object-cover'
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex flex-wrap items-center gap-2'>
                                                    <p className='lg-medium truncate'>
                                                        {name}
                                                    </p>
                                                    {p?.selected_variant
                                                        ?.sku && (
                                                        <span className='rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700'>
                                                            SKU:{' '}
                                                            {
                                                                p
                                                                    .selected_variant
                                                                    .sku
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                {attrPairs.length > 0 && (
                                                    <div className='mt-1 flex flex-wrap gap-2 text-xs text-gray-600'>
                                                        {attrPairs.map(
                                                            ([k, v]) => (
                                                                <span
                                                                    key={`${k}-${v}`}
                                                                    className='rounded border border-gray-300 bg-gray-50 px-2 py-0.5'
                                                                >
                                                                    {k}: {v}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                                <div className='mt-2 flex items-center justify-between'>
                                                    <span className='text-sm text-gray-600'>
                                                        Qty:{' '}
                                                        <strong className='text-gray-800'>
                                                            {p?.total_quantity ??
                                                                0}
                                                        </strong>
                                                    </span>
                                                    <span className='text-sm font-semibold text-gray-900'>
                                                        {fmtBDT(p?.total_price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totals */}
                            <div className='space-y-2 rounded-b-xl bg-gray-50 p-5 text-sm'>
                                <div className='flex justify-between'>
                                    <span className='base-medium'>
                                        Subtotal
                                    </span>
                                    <span className='base-medium'>
                                        {fmtBDT(
                                            items.reduce(
                                                (s, p) =>
                                                    s + (p?.total_price ?? 0),
                                                0
                                            )
                                        )}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='base-medium'>
                                        Delivery Charge
                                    </span>
                                    <span className='base-medium'>
                                        {fmtBDT(
                                            orderData?.delivery_charge ?? 0
                                        )}
                                    </span>
                                </div>
                                {typeof orderData?.total_discount ===
                                    'number' &&
                                    orderData?.total_discount > 0 && (
                                        <div className='flex justify-between text-green-700'>
                                            <span className='base-medium'>
                                                Discount
                                            </span>
                                            <span className='base-medium'>
                                                -
                                                {fmtBDT(
                                                    orderData?.total_discount
                                                )}
                                            </span>
                                        </div>
                                    )}
                                <div className='flex justify-between border-t pt-2'>
                                    <span className='base-medium'>Total</span>
                                    <span className='base-medium'>
                                        {fmtBDT(orderData?.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address + Customer */}
                    <div className='space-y-4'>
                        <div className='rounded-xl border border-gray-300 p-5'>
                            <div className='mb-3 flex items-center gap-2'>
                                <User2 className='h-5 w-5 text-gray-500' />
                                <h3 className='text-base font-semibold text-gray-900'>
                                    Customer
                                </h3>
                            </div>
                            <div className='space-y-1 text-sm'>
                                <div className='flex items-center gap-2 text-gray-800'>
                                    <User2 className='h-4 w-4 text-gray-500' />
                                    <span>
                                        {orderData?.customer_name || '-'}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-gray-800'>
                                    <Phone className='h-4 w-4 text-gray-500' />
                                    <span>
                                        {orderData?.customer_phone || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='rounded-xl border border-gray-300 p-5'>
                            <div className='mb-3 flex items-center gap-2'>
                                <MapPin className='h-5 w-5 text-gray-500' />
                                <h3 className='text-base font-semibold text-gray-900'>
                                    Delivery Address
                                </h3>
                            </div>
                            <div className='text-sm leading-6 text-gray-700'>
                                <p>{orderData?.delivery_address?.address}</p>
                                <p>
                                    {orderData?.delivery_address?.thana}
                                    {orderData?.delivery_address?.thana
                                        ? ', '
                                        : ''}
                                    {orderData?.delivery_address?.district}
                                </p>
                                <p>{orderData?.delivery_address?.division}</p>
                            </div>
                        </div>

                        <div className='rounded-xl border border-gray-300 p-5'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm text-gray-600'>
                                    Payment Type
                                </span>
                                <span className='text-sm font-semibold text-gray-900'>
                                    {orderData?.payment_type ===
                                    'CASH_ON_DELIVERY'
                                        ? 'COD'
                                        : orderData?.payment_type || '-'}
                                </span>
                            </div>
                            {!!orderData?.COD &&
                                orderData?.payment_type ===
                                    'CASH_ON_DELIVERY' && (
                                    <div className='mt-2 flex items-center justify-between'>
                                        <span className='text-sm text-gray-600'>
                                            Cash on Delivery
                                        </span>
                                        <span className='text-sm font-semibold text-emerald-700'>
                                            {fmtBDT(orderData?.COD)}
                                        </span>
                                    </div>
                                )}
                            {/* {!!orderData?.payable_amount && (
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Payable (advance)</span>
                                    <span className="text-sm font-semibold text-rose-600">
                                        {fmtBDT(orderData?.payable_amount)}
                                    </span>
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className='mt-8'>
                    <button
                        onClick={() => router.push('/')}
                        className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-white transition-colors hover:bg-primary/90'
                    >
                        <Home className='h-5 w-5' />
                        Continue Shopping
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
