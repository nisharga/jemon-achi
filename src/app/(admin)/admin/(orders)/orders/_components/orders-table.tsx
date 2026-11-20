'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow
} from '@/admin/components/ui/table';
import { cn } from '@/admin/lib/utils';
import { TOrder } from '@/admin/types/order';
import React from 'react';
import OrdersTableRow from './order-table-row';

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
    'COD',
    'Paid by Courier',
    'Total Paid',
    'Order Status',
    'Call Info',
    'Note',
    'Courier Info',
    'Created By'
];

export function OrdersTable({
    orders,
    isLoading,
    isFetching
}: OrdersTableProps) {
    return (
        <div className='overflow-hidden rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && (
                <div className='overflow-x-auto'>
                    <Table>
                        {/* table header */}
                        <TableHeader className='relative h-9 bg-sidebar'>
                            <TableRow className='border-b-primary/50'>
                                {ORDERS_TABLE_HEADERS.map((header, index) => (
                                    <TableHead
                                        key={header}
                                        className={cn('bg-primary/10 px-2', {
                                            'rounded-tr-md':
                                                index ===
                                                ORDERS_TABLE_HEADERS?.length -
                                                    1,
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
                                {orders?.map((order: TOrder) => {
                                    return (
                                        <OrdersTableRow
                                            key={order?._id}
                                            order={order}
                                            // repeatCustomersData={repeatCustomersData}
                                        />
                                    );
                                })}
                            </TableBody>
                        )}
                    </Table>
                </div>
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
