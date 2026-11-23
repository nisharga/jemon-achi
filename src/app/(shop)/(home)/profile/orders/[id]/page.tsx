'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/shop/components/ui/skeleton';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import {
    getErrorMessage,
    useGetMyOrderQuery
} from '@/shop/redux/api/customer-api';
import type { Order, OrderItem } from '@/shop/types/customer';
import { formatDate, formatPrice } from '../../_lib/format';
import Panel from '../../_components/Panel';
import OrderStatusBadge from '../../_components/OrderStatusBadge';

/** Everything about one order: items, delivery address and the bill. */
export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { data: order, isLoading, error } = useGetMyOrderQuery(id);

    return (
        <div className='space-y-6'>
            <Link
                href='/profile/orders'
                className='inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900'
            >
                <ArrowLeft className='size-4' />
                Back to my orders
            </Link>

            {isLoading && <OrderDetailsSkeleton />}

            {error && (
                <p className='rounded-xl bg-white px-6 py-10 text-center text-sm text-red-600 shadow-sm'>
                    {getErrorMessage(error)}
                </p>
            )}

            {order && <OrderDetails order={order} />}
        </div>
    );
}

function OrderDetails({ order }: { order: Order }) {
    const address = order.delivery_address;
    const fullAddress = [
        address?.address,
        address?.thana,
        address?.district,
        address?.division
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <>
            <div className='flex flex-wrap items-center gap-3'>
                <h1 className='text-2xl font-semibold text-gray-900'>
                    Order #{order.order_serial_id}
                </h1>
                <OrderStatusBadge status={order.status} />
            </div>
            <p className='-mt-4 text-sm text-gray-500'>
                Placed on {formatDate(order.order_date ?? order.createdAt)}
                {order.invoice_number && ` · Invoice ${order.invoice_number}`}
            </p>

            <Panel title='Items'>
                <ul className='divide-y divide-gray-100'>
                    {order.products.map((item) => (
                        <OrderItemRow key={item._id} item={item} />
                    ))}
                </ul>
            </Panel>

            <div className='grid gap-6 md:grid-cols-2'>
                <Panel title='Delivery'>
                    <dl className='space-y-3 px-4 py-4 text-sm sm:px-6'>
                        <InfoLine label='Name' value={order.customer_name} />
                        <InfoLine label='Phone' value={order.customer_phone} />
                        <InfoLine label='Address' value={fullAddress || '—'} />
                        {order.tracking_code && (
                            <InfoLine
                                label='Tracking code'
                                value={order.tracking_code}
                            />
                        )}
                    </dl>
                </Panel>

                <Panel title='Payment'>
                    <dl className='space-y-3 px-4 py-4 text-sm sm:px-6'>
                        <InfoLine
                            label='Subtotal'
                            value={formatPrice(order.sub_total)}
                        />
                        <InfoLine
                            label='Delivery charge'
                            value={formatPrice(order.delivery_charge)}
                        />
                        {order.total_discount > 0 && (
                            <InfoLine
                                label='Discount'
                                value={`− ${formatPrice(order.total_discount)}`}
                            />
                        )}
                        <div className='border-t border-gray-100 pt-3'>
                            <InfoLine
                                label='Total'
                                value={formatPrice(order.total_amount)}
                                strong
                            />
                        </div>
                        {order.payment_type && (
                            <InfoLine
                                label='Payment method'
                                value={
                                    order.payment_type === 'CASH_ON_DELIVERY'
                                        ? 'Cash on delivery'
                                        : 'Paid in full'
                                }
                            />
                        )}
                    </dl>
                </Panel>
            </div>
        </>
    );
}

function OrderItemRow({ item }: { item: OrderItem }) {
    // e.g. { Size: "M", Color: "Black" } → "Size: M · Color: Black"
    const variant = Object.entries(
        item.selected_variant?.attribute_values ?? {}
    )
        .map(([name, value]) => `${name}: ${value}`)
        .join(' · ');

    return (
        <li className='flex items-center gap-4 px-4 py-4 sm:px-6'>
            <Image
                src={getMediaUrl(item.product?.thumbnail)}
                alt={item.product?.name ?? 'Product'}
                width={64}
                height={64}
                className='size-16 shrink-0 rounded-lg bg-gray-50 object-contain'
            />
            <div className='min-w-0 flex-1'>
                <p className='font-medium text-gray-900'>
                    {item.product?.name ?? 'Product no longer available'}
                </p>
                {variant && <p className='text-sm text-gray-500'>{variant}</p>}
                <p className='text-sm text-gray-500'>
                    Quantity: {item.total_quantity}
                </p>
            </div>
            <span className='font-medium text-gray-900'>
                {formatPrice(item.total_price)}
            </span>
        </li>
    );
}

type InfoLineProps = { label: string; value: string; strong?: boolean };

function InfoLine({ label, value, strong }: InfoLineProps) {
    return (
        <div className='flex justify-between gap-4'>
            <dt className='text-gray-500'>{label}</dt>
            <dd
                className={
                    strong
                        ? 'text-right font-semibold text-gray-900'
                        : 'text-right text-gray-900'
                }
            >
                {value}
            </dd>
        </div>
    );
}

function OrderDetailsSkeleton() {
    return (
        <div className='space-y-6'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-48 w-full rounded-xl' />
            <div className='grid gap-6 md:grid-cols-2'>
                <Skeleton className='h-40 rounded-xl' />
                <Skeleton className='h-40 rounded-xl' />
            </div>
        </div>
    );
}
