'use client';

import { Badge } from '@/admin/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/admin/components/ui/table';
import { cn } from '@/admin/lib/utils';
import React, { useEffect, useState } from 'react';
import StockReportViewDialog from './stock-report-view-dialog';
import { useQueryState } from 'nuqs';

type OrdersTableProps = {
    stocks: [];
    isLoading: boolean;
    isFetching: boolean;
    businessLocation: string | null;
    isPermissionLoading?: boolean;
    hasPermission?: boolean;
};

const TABLE_HEADERS = [
    'Product Name',
    'SKU',
    'Avg Purchase Price',
    'Unit Selling Price',
    'Current Stock',
    'Current Stock Value (by purchase price)',
    'Current Sale Value (by sale price)',
    'Potential Profit',
    'Available In Locations',
    'Total Sold'
];

export function StocksReportTable({
    stocks,
    isLoading,
    isFetching,
    businessLocation,
    isPermissionLoading,
    hasPermission = false
}: OrdersTableProps) {
    // === dialog state ===
    const [open, setOpen] = useState(false);
    // === nuqs state for variant id ===
    const [variantId, setVariantId] = useQueryState('variantId');

    const handleOpen = (id: string) => {
        setOpen(true);
        setVariantId(id);
    };

    useEffect(() => {
        if (!open) {
            setVariantId(null);
        }
    }, [open, setVariantId]);

    // Check if we have data to show
    const hasData = stocks?.length > 0;
    // Check if we should show the initial empty state (no location selected)
    const showInitialEmptyState =
        !businessLocation && !isLoading && !isFetching;
    // Check if we should show the no data found state (location selected but no data)
    const showNoDataState =
        businessLocation && !hasData && !isLoading && !isFetching;

    // Show loading state while checking permissions
    if (isPermissionLoading) {
        return (
            <div className='max-h-[150vh] overflow-auto rounded-lg bg-background p-2 shadow-md'>
                <div className='grid w-full gap-4'>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <span
                            key={index}
                            className='animate-skeleton h-14 rounded-md bg-secondary'
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='max-h-[150vh] overflow-auto rounded-lg bg-background p-2 shadow-md'>
                {!isLoading && !isFetching && hasData && (
                    <Table>
                        {/* table header */}
                        <TableHeader className='relative h-9 bg-sidebar'>
                            <TableRow className='border-b-primary/50'>
                                {TABLE_HEADERS.map((header, index) => (
                                    <TableHead
                                        key={header}
                                        className={cn(
                                            'h-auto border-r border-r-primary/20 bg-primary/10 py-2 text-wrap whitespace-normal',
                                            {
                                                'rounded-tr-md border-r-0':
                                                    index ===
                                                    TABLE_HEADERS?.length - 1,
                                                'rounded-tl-md': index === 0
                                            }
                                        )}
                                    >
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        {/* table body */}
                        <TableBody className=''>
                            {stocks?.map((stock: any) => {
                                // product variant
                                const variant = Object.entries(
                                    stock?.attribute_values || {}
                                )
                                    ?.map((item) => item?.[1])
                                    .join('-');

                                return (
                                    <TableRow
                                        key={stock?._id}
                                        onClick={() => handleOpen(stock?._id)}
                                        className='hover:cursor-pointer'
                                    >
                                        <TableCell className='w-40 border-r whitespace-normal'>
                                            {stock?.product?.name} ({variant})
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {stock?.sku}
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {hasPermission ? (
                                                <span>
                                                    {stock?.avg_purchase_price
                                                        ? stock.avg_purchase_price.toFixed(
                                                              0
                                                          )
                                                        : 0}{' '}
                                                    Tk
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {stock?.sale_price} Tk
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {stock?.available_quantity} Pair/pcs
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {Math.floor(
                                                stock?.available_quantity *
                                                    stock?.avg_purchase_price
                                            ).toLocaleString()}{' '}
                                            Tk
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {Math.floor(
                                                stock?.available_quantity *
                                                    stock?.sale_price
                                            ).toLocaleString()}{' '}
                                            Tk
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {hasPermission ? (
                                                <span>
                                                    {Math.floor(
                                                        stock?.available_quantity *
                                                            stock?.sale_price -
                                                            stock?.available_quantity *
                                                                stock?.avg_purchase_price
                                                    ).toLocaleString()}{' '}
                                                    Tk
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>

                                        <TableCell className='w-40 border-r text-wrap whitespace-normal'>
                                            {(() => {
                                                let filteredLocations;

                                                // 🔥 FIXED LOGIC
                                                if (
                                                    !businessLocation ||
                                                    businessLocation === 'all'
                                                ) {
                                                    // Show all locations normally
                                                    filteredLocations =
                                                        stock?.stocks_by_location;
                                                } else {
                                                    // Filter by specific location
                                                    filteredLocations =
                                                        stock?.stocks_by_location?.filter(
                                                            (l: any) =>
                                                                String(
                                                                    l?.location
                                                                        ?._id
                                                                ) ===
                                                                String(
                                                                    businessLocation
                                                                )
                                                        );
                                                }

                                                if (
                                                    !filteredLocations ||
                                                    filteredLocations.length ===
                                                        0
                                                ) {
                                                    return (
                                                        <Badge variant='red'>
                                                            Stock Out
                                                        </Badge>
                                                    );
                                                }

                                                return filteredLocations.map(
                                                    (l: any, index: number) => (
                                                        <div
                                                            key={index}
                                                            className='flex-wrap py-1'
                                                        >
                                                            <p className='text-wrap'>
                                                                {
                                                                    l?.location
                                                                        ?.name
                                                                }{' '}
                                                                –{' '}
                                                                <Badge variant='emerald'>
                                                                    {
                                                                        l?.available_quantity
                                                                    }
                                                                </Badge>
                                                            </p>
                                                        </div>
                                                    )
                                                );
                                            })()}
                                        </TableCell>

                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {stock?.total_sold} Pair/pcs
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
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

                {/* Initial empty state - no location selected */}
                {showInitialEmptyState && (
                    <div className='flex flex-col items-center justify-center px-4 py-16 text-center'>
                        {/* Animated Icon Container */}
                        <div className='relative mb-6'>
                            <div className='flex h-24 w-24 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg shadow-blue-100/50'>
                                <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-white/80 shadow-inner backdrop-blur-sm'>
                                    <svg
                                        className='h-8 w-8 animate-bounce text-blue-500'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='1.5'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125'
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Floating dots */}
                            <div className='absolute -top-2 -right-2 h-6 w-6 animate-ping rounded-full bg-blue-400 opacity-75'></div>
                            <div className='animation-delay-1000 absolute -bottom-2 -left-2 h-4 w-4 animate-ping rounded-full bg-indigo-400 opacity-75'></div>
                        </div>

                        {/* Text Content */}
                        <div className='max-w-md space-y-3'>
                            <p className='text-lg leading-relaxed text-gray-600'>
                                Select a{' '}
                                <span className='font-semibold text-blue-600'>
                                    business location
                                </span>{' '}
                                to view stock reports and inventory analytics.
                            </p>

                            <div className='flex items-center justify-center space-x-4 pt-2 text-sm text-gray-500'>
                                <div className='flex items-center space-x-1'>
                                    <div className='h-2 w-2 animate-pulse rounded-full bg-green-400'></div>
                                    <span>Real-time data</span>
                                </div>
                                <div className='flex items-center space-x-1'>
                                    <div className='h-2 w-2 animate-pulse rounded-full bg-blue-400'></div>
                                    <span>Analytics ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* No data found state - location selected but no data */}
                {showNoDataState && (
                    <div className='flex flex-col items-center justify-center px-4 py-16 text-center'>
                        <div className='relative mb-6'>
                            <div className='flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg shadow-gray-100/50'>
                                <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-white/80 shadow-inner backdrop-blur-sm'>
                                    <svg
                                        className='h-8 w-8 text-gray-400'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='1.5'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <h3 className='mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-2xl font-bold text-transparent'>
                            No Stock Data Found
                        </h3>

                        <div className='max-w-md space-y-3'>
                            <p className='leading-relaxed text-gray-600'>
                                No stock data available for the selected
                                business location.
                                <br />
                                Try selecting a different location or check if
                                products are assigned to this location.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* stock report view dialog */}
            <StockReportViewDialog
                open={open}
                setOpen={setOpen}
                variantId={variantId as string}
            />
        </>
    );
}
