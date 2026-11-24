import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Order } from '@/shop/types/customer';
import { formatDate, formatPrice } from '../_lib/format';
import OrderStatusBadge from './OrderStatusBadge';

/** One order in a list; the whole row links to its details. */
export default function OrderRow({ order }: { order: Order }) {
    const itemCount = order.products.reduce(
        (total, item) => total + item.total_quantity,
        0
    );

    return (
        <Link
            href={`/profile/orders/${order._id}`}
            className='flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50 sm:px-6'
        >
            <div className='min-w-0 flex-1 space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                    <span className='font-medium text-gray-900'>
                        Order #{order.order_serial_id}
                    </span>
                    <OrderStatusBadge status={order.status} />
                </div>
                <p className='text-sm text-gray-600'>
                    {formatDate(order.order_date ?? order.createdAt)} ·{' '}
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
            </div>

            <span className='font-semibold text-gray-900'>
                {formatPrice(order.total_amount)}
            </span>
            <ChevronRight className='size-4 shrink-0 text-gray-600' />
        </Link>
    );
}
