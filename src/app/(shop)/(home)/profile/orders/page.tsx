'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shop/components/ui/button';
import {
    getErrorMessage,
    useGetMyOrdersQuery
} from '@/shop/redux/api/customer-api';
import Panel from '../_components/Panel';
import OrderRow from '../_components/OrderRow';
import NoOrders from '../_components/NoOrders';
import OrderListSkeleton from '../_components/OrderListSkeleton';

const ORDERS_PER_PAGE = 10;

/** Every order the customer has placed, newest first, 10 per page. */
export default function MyOrdersPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching, error } = useGetMyOrdersQuery({
        page,
        limit: ORDERS_PER_PAGE
    });

    const orders = data?.data ?? [];
    const totalPages = data?.meta.totalPage ?? 1;

    const renderContent = () => {
        if (isLoading) return <OrderListSkeleton rows={5} />;
        if (error) {
            return (
                <p className='px-6 py-10 text-center text-sm text-red-600'>
                    {getErrorMessage(error)}
                </p>
            );
        }
        if (orders.length === 0) return <NoOrders />;

        return (
            // Fade the old page a little while the next one loads.
            <div
                className={
                    isFetching
                        ? 'divide-y divide-gray-100 opacity-60'
                        : 'divide-y divide-gray-100'
                }
            >
                {orders.map((order) => (
                    <OrderRow key={order._id} order={order} />
                ))}
            </div>
        );
    };

    return (
        <div className='space-y-6'>
            <h1 className='text-2xl font-semibold text-gray-900'>My orders</h1>

            <Panel
                title={data ? `${data.meta.total} orders` : 'Orders'}
                action={
                    totalPages > 1 && (
                        <span className='text-sm text-gray-500'>
                            Page {page} of {totalPages}
                        </span>
                    )
                }
            >
                {renderContent()}

                {totalPages > 1 && (
                    <footer className='flex items-center justify-between border-t border-gray-100 px-4 py-3 sm:px-6'>
                        <Button
                            variant='outline'
                            size='sm'
                            disabled={page === 1 || isFetching}
                            onClick={() => setPage(page - 1)}
                        >
                            <ChevronLeft />
                            Previous
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            disabled={page === totalPages || isFetching}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                            <ChevronRight />
                        </Button>
                    </footer>
                )}
            </Panel>
        </div>
    );
}
