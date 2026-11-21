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
import { IPurchase } from '@/types/purchase';
import { Badge } from '@/components/ui/admin-badge';
import PurchaseActions from './purchase-actions';

type PurchaseTableProps = {
    purchases: [];
    isLoading: boolean;
    isFetching: boolean;
};

const PURCHASE_TABLE_HEADERS = [
    'Purchases Id',
    'Date',
    'Business Location',
    'Supplier',
    'Total Items',
    'Purchase Status',
    'Total Cost',
    'Added By',
    'Actions'
];

export function PurchaseTable({
    purchases,
    isLoading,
    isFetching
}: PurchaseTableProps) {
    console.log(purchases, 'purchases...........');
    return (
        <div className='rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && !isFetching && (
                <Table>
                    {/* table header */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {PURCHASE_TABLE_HEADERS.map((header, index) => (
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
                                                PURCHASE_TABLE_HEADERS?.length -
                                                    1,
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
                    {purchases?.length > 0 && (
                        <TableBody>
                            {purchases?.map((purchase: IPurchase, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            #{purchase?.purchase_number}
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            <span className='flex flex-col gap-1'>
                                                {purchase?.purchase_date ? (
                                                    <span className='flex flex-col'>
                                                        <p>
                                                            {format(
                                                                new Date(
                                                                    purchase?.purchase_date
                                                                ),
                                                                'dd/MM/yyyy'
                                                            )}
                                                        </p>
                                                        <p>
                                                            {format(
                                                                new Date(
                                                                    purchase?.purchase_date
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
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {purchase?.business_location?.name}
                                        </TableCell>

                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {purchase?.supplier?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {purchase?.items?.length || 0}
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            <Badge
                                                variant={
                                                    purchase?.status === 'draft'
                                                        ? 'yellow-outline'
                                                        : purchase?.status ===
                                                            'ordered'
                                                          ? 'orange-outline'
                                                          : purchase?.status ===
                                                              'received'
                                                            ? 'emerald-outline'
                                                            : 'red-outline'
                                                }
                                            >
                                                {purchase?.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    purchase?.status.slice(1)}
                                                {/* {purchase?.status} */}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {' '}
                                            ৳{purchase?.total_cost}
                                        </TableCell>
                                        <TableCell className='w-24 border-r whitespace-normal'>
                                            {purchase?.created_by?.full_name}
                                        </TableCell>

                                        <TableCell className='w-24 text-center whitespace-normal'>
                                            <PurchaseActions
                                                purchase={purchase}
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
            {!isLoading && purchases?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}
