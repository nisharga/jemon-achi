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
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/admin-badge';

type TableProps = {
    stockAdjustments: [];
    isLoading: boolean;
    isFetching: boolean;
};

const TABLE_HEADERS = [
    'Date',
    'Items',
    'Action',
    'Total Amount',
    'Location',
    'Reason',
    'Adjust By'
];

export function StockAdjustmentTable({
    stockAdjustments,
    isLoading,
    isFetching
}: TableProps) {
    return (
        <div className='rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && !isFetching && (
                <Table>
                    {/* table header */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {TABLE_HEADERS.map((header, index) => (
                                <TableHead
                                    key={header}
                                    // className={cn("bg-primary/10 px-4", {
                                    //   "rounded-tr-md":
                                    //     index === PURCHASE_TABLE_HEADERS?.length - 1,
                                    //   "rounded-tl-md": index === 0,
                                    // })}

                                    className={cn(
                                        'h-auto border-r border-r-primary/20 bg-primary/10 py-2 text-wrap whitespace-normal',
                                        {
                                            'rounded-tr-md border-r-0 text-center':
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
                    {stockAdjustments?.length > 0 && (
                        <TableBody>
                            {stockAdjustments?.map(
                                (stockAdjustment: any, index) => {
                                    // console.log("stockAdjustment", stockAdjustment);

                                    return (
                                        <TableRow key={index}>
                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                <span className='flex flex-col gap-1'>
                                                    {stockAdjustment?.activities_date ? (
                                                        <span className='flex flex-col'>
                                                            <p>
                                                                {format(
                                                                    new Date(
                                                                        stockAdjustment?.activities_date
                                                                    ),
                                                                    'dd/MM/yyyy'
                                                                )}
                                                            </p>
                                                            <p>
                                                                {format(
                                                                    new Date(
                                                                        stockAdjustment?.activities_date
                                                                    ),
                                                                    'hh:mm a'
                                                                )}
                                                            </p>
                                                        </span>
                                                    ) : (
                                                        <p>-</p>
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className='w-80 border-r whitespace-normal'>
                                                <div className='grid gap-2'>
                                                    {stockAdjustment?.products?.map(
                                                        (
                                                            item: any,
                                                            index: number
                                                        ) => {
                                                            // product informations
                                                            const productName =
                                                                item?.product
                                                                    ?.name;
                                                            const variant =
                                                                Object.entries(
                                                                    item
                                                                        ?.selected_variant
                                                                        ?.attribute_values ||
                                                                        {}
                                                                )
                                                                    ?.map(
                                                                        (
                                                                            item
                                                                        ) =>
                                                                            item?.[1]
                                                                    )
                                                                    .join(
                                                                        ' - '
                                                                    );
                                                            const sku =
                                                                item
                                                                    ?.selected_variant
                                                                    ?.sku;

                                                            return (
                                                                <div
                                                                    key={index}
                                                                >
                                                                    <p>
                                                                        {
                                                                            productName
                                                                        }{' '}
                                                                        - (
                                                                        {
                                                                            variant
                                                                        }
                                                                        )
                                                                    </p>
                                                                    <p className='text-xs text-muted-foreground'>
                                                                        SKU -{' '}
                                                                        {sku}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className='w-24 border-r text-center whitespace-normal'>
                                                <Badge
                                                    variant={
                                                        stockAdjustment?.action ===
                                                        'ADDITION'
                                                            ? 'green-outline'
                                                            : 'red-outline'
                                                    }
                                                >
                                                    {stockAdjustment?.action ===
                                                    'ADDITION'
                                                        ? 'Add Stock'
                                                        : 'Deduct Stock'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                ৳{' '}
                                                {stockAdjustment?.total_amount}
                                            </TableCell>
                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                {
                                                    stockAdjustment
                                                        ?.business_location
                                                        ?.name
                                                }
                                            </TableCell>
                                            <TableCell className='w-40 border-r whitespace-normal'>
                                                {stockAdjustment?.note
                                                    ? stockAdjustment?.note
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className='w-24 border-r text-center whitespace-normal'>
                                                {
                                                    stockAdjustment?.adjust_by
                                                        ?.full_name
                                                }
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            )}
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
            {!isLoading && stockAdjustments?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}
