'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/admin-utils';
import { TOrder } from '@/types/admin/order';
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/admin-badge';
import { TVariantCombination } from '@/types/admin/product';
import OrderActions from '../../_components/order-actions';
import { OrderStatusBadge } from '@/components/shared/order-status-badge';
import Link from 'next/link';

type OrdersTableProps = {
    orders: [];
    isLoading: boolean;
    isFetching: boolean;
};

const ORDERS_TABLE_HEADERS = [
    'Actions',
    'Order Id',
    'Order Date',
    'Products',
    'Customer Info',
    'Assigned Outlet Info',
    'COD',
    'Paid Amount',
    'Courier Info',
    'Order Status'
];

export function OrdersTable({
    orders,
    isLoading,
    isFetching
}: OrdersTableProps) {
    const renderVariantBadges = (variants: Partial<TVariantCombination>[]) => {
        return variants?.map((variant) => (
            <div key={variant?._id} className='space-y-1'>
                <div className='text-xs'>
                    <span className='font-medium'>SKU:</span> {variant?.sku}
                </div>
                <div className='flex flex-wrap gap-1'>
                    {Object.entries(variant?.attribute_values || {}).map(
                        ([key, value]) => (
                            <Badge key={`${key}-${value}`} variant='outline'>
                                {value}
                            </Badge>
                        )
                    )}
                </div>
            </div>
        ));
    };
    return (
        <div className='rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && !isFetching && (
                <Table>
                    {/* table header */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {ORDERS_TABLE_HEADERS.map((header, index) => (
                                <TableHead
                                    key={header}
                                    className={cn('bg-primary/10 px-4', {
                                        'rounded-tr-md':
                                            index ===
                                            ORDERS_TABLE_HEADERS?.length - 1,
                                        'rounded-tl-md': index === 0
                                    })}
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* table body */}
                    {orders?.length > 0 && (
                        <TableBody>
                            {orders?.map((data: any) => {
                                const order = data?.order as TOrder;
                                const businessLocation =
                                    data?.business_location;

                                return (
                                    <TableRow key={order?._id}>
                                        <TableCell className='px-4'>
                                            <OrderActions order={order} />
                                        </TableCell>
                                        <TableCell className='px-4 text-center'>
                                            #{order?.order_serial_id}
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            <span className='flex flex-col gap-1'>
                                                {order?.order_date ? (
                                                    <>
                                                        <p>
                                                            {format(
                                                                new Date(
                                                                    order?.order_date
                                                                ),
                                                                'dd MMM yyyy'
                                                            )}
                                                        </p>
                                                        <p>
                                                            {format(
                                                                new Date(
                                                                    order?.order_date
                                                                ),
                                                                'hh:mm a'
                                                            )}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p>N/A</p>
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className='space-y-1 px-4'>
                                            {order?.products?.map(
                                                (product, index) => (
                                                    <ul
                                                        key={index}
                                                        className='space-y-1 text-xs'
                                                    >
                                                        <li className='max-w-60 truncate text-sm font-medium text-primary'>
                                                            {
                                                                product?.product
                                                                    ?.name
                                                            }
                                                        </li>
                                                        <span className='flex shrink-0 items-center gap-6'>
                                                            <li>
                                                                Total Qty:{' '}
                                                                {
                                                                    product?.total_quantity
                                                                }
                                                            </li>
                                                            <li className='text-primary'>
                                                                Total Price: ৳
                                                                {
                                                                    product?.total_price
                                                                }
                                                            </li>
                                                        </span>

                                                        {renderVariantBadges([
                                                            product?.selected_variant as TVariantCombination
                                                        ])}
                                                    </ul>
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell className='max-w-80 px-4'>
                                            <span className='flex flex-col gap-1 text-wrap'>
                                                <p>
                                                    {order?.customer_name} -{' '}
                                                    {order?.customer_phone}
                                                </p>
                                                <p className='text-xs'>
                                                    {
                                                        order?.delivery_address
                                                            ?.address
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        order?.delivery_address
                                                            ?.district
                                                    }
                                                </p>
                                                <p className='text-xs text-emerald-600'>
                                                    {order?.user
                                                        ?.completed_orders
                                                        ? `Completed - ${order?.user?.completed_orders}`
                                                        : 'Completed - 0'}
                                                </p>
                                                <p className='text-xs text-rose-600'>
                                                    {order?.user
                                                        ?.cancelled_orders
                                                        ? `Cancelled - ${order?.user?.cancelled_orders}`
                                                        : 'Cancelled - 0'}
                                                </p>
                                            </span>
                                        </TableCell>

                                        <TableCell className='px-4'>
                                            <span className='flex flex-col gap-1'>
                                                <p>
                                                    {businessLocation?.name} -{' '}
                                                    {businessLocation?.type}
                                                </p>
                                                <p className='text-xs'>
                                                    {
                                                        businessLocation
                                                            ?.address
                                                            ?.local_address
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        businessLocation
                                                            ?.address?.district
                                                    }
                                                </p>
                                            </span>
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            {' '}
                                            ৳{order?.COD}
                                        </TableCell>
                                        <TableCell className='px-4 text-center'>
                                            ৳{order?.paid_amount}
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            <TableCell className='px-4'>
                                                <p
                                                    className={cn(
                                                        order.consignment_id
                                                            ? 'text-black'
                                                            : 'text-muted-foreground'
                                                    )}
                                                >
                                                    Parcel Id:{' '}
                                                    {order?.consignment_id ??
                                                        'N/A'}
                                                </p>

                                                {order?.tracking_code ? (
                                                    <Link
                                                        href={`https://steadfast.com.bd/t/${order?.tracking_code}`}
                                                        target='_blank'
                                                        className='text-blue-600 underline'
                                                    >
                                                        Track Order
                                                    </Link>
                                                ) : (
                                                    <p className='text-muted-foreground'>
                                                        Tracking Link: N/A
                                                    </p>
                                                )}
                                            </TableCell>
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            <OrderStatusBadge
                                                status={order?.status}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    )}
                </Table>
            )}

            {/* loading data state */}
            {(isLoading || isFetching) && (
                <div className='grid w-full gap-4'>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <span
                            key={index}
                            className='animate-skeleton h-14 rounded-md bg-secondary'
                        />
                    ))}
                </div>
            )}

            {/* empty data state */}
            {!isLoading && orders?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}
