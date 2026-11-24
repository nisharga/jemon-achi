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
import { TInventoryTransferHistory } from '@/types/admin/inventory';
import { Badge } from '@/components/ui/admin-badge';
import { getRoleBadgeVariant } from '@/utils/getRoleBadgeVariant';
import { IRoles } from '@/types/admin/user';
import { format } from 'date-fns';

type ProductsTableProps = {
    inventory_histories: [];
    isLoading: boolean;
    isFetching: boolean;
};

const INVENTORY_TRANSFER_HISTORY_TABLE_HEADERS = [
    'SL',
    'Transfer Date',
    'From',
    'To',
    'Products',
    'Transfared By'
];

export function InventoryTransferHistoryTable({
    inventory_histories,
    isLoading,
    isFetching
}: ProductsTableProps) {
    // console.log("inventory_histories", inventory_histories);

    return (
        <div className='max-h-[calc(100vh-350px)] overflow-y-auto rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && !isFetching && (
                <Table>
                    {/* table header */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {INVENTORY_TRANSFER_HISTORY_TABLE_HEADERS.map(
                                (header, index) => (
                                    <TableHead
                                        key={header}
                                        className={cn('bg-primary/10 px-4', {
                                            'rounded-tr-md text-center':
                                                index ===
                                                INVENTORY_TRANSFER_HISTORY_TABLE_HEADERS?.length -
                                                    1,
                                            'rounded-tl-md': index === 0
                                        })}
                                    >
                                        {header}
                                    </TableHead>
                                )
                            )}
                        </TableRow>
                    </TableHeader>

                    {/* table body */}
                    {inventory_histories?.length > 0 && (
                        <TableBody>
                            {inventory_histories?.map(
                                (
                                    inventoryHistory: TInventoryTransferHistory,
                                    index
                                ) => {
                                    return (
                                        <TableRow key={inventoryHistory?._id}>
                                            <TableCell className='px-4'>
                                                {index + 1 < 10
                                                    ? `0${index + 1}`
                                                    : index + 1}
                                            </TableCell>

                                            <TableCell className='px-4'>
                                                <>
                                                    <p>
                                                        {format(
                                                            new Date(
                                                                inventoryHistory?.createdAt
                                                            ),
                                                            'dd MMM yyyy'
                                                        )}
                                                    </p>
                                                    <p>
                                                        {format(
                                                            new Date(
                                                                inventoryHistory?.createdAt
                                                            ),
                                                            'hh:mm a'
                                                        )}
                                                    </p>
                                                </>
                                            </TableCell>

                                            <TableCell className='px-4'>
                                                {inventoryHistory?.from?.name}
                                            </TableCell>
                                            <TableCell className='px-4'>
                                                {inventoryHistory?.to?.name}
                                            </TableCell>

                                            <TableCell className='px-4'>
                                                {inventoryHistory?.products?.map(
                                                    (product: any, index) => {
                                                        return (
                                                            <ul
                                                                key={index}
                                                                className='space-y-1 text-xs'
                                                            >
                                                                <li className='max-w-60 truncate text-sm font-medium text-primary'>
                                                                    {
                                                                        product
                                                                            ?.product
                                                                            ?.name
                                                                    }
                                                                </li>

                                                                <>
                                                                    {product?.variants?.map(
                                                                        (
                                                                            variant: any
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    variant?._id
                                                                                }
                                                                                className='space-y-1'
                                                                            >
                                                                                <div className='text-xs'>
                                                                                    <span className='font-medium'>
                                                                                        SKU:
                                                                                    </span>{' '}
                                                                                    {
                                                                                        variant?.sku
                                                                                    }
                                                                                </div>
                                                                                <div className='flex flex-wrap gap-1'>
                                                                                    {Object.entries(
                                                                                        variant?.attribute_values ||
                                                                                            {}
                                                                                    ).map(
                                                                                        ([
                                                                                            key,
                                                                                            value
                                                                                        ]) => (
                                                                                            <Badge
                                                                                                key={`${key}-${value}`}
                                                                                                variant='outline'
                                                                                            >
                                                                                                {
                                                                                                    value as string
                                                                                                }
                                                                                            </Badge>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </>
                                                            </ul>
                                                        );
                                                    }
                                                )}
                                            </TableCell>

                                            <TableCell className='flex flex-col items-center gap-2 px-4'>
                                                <p className='text-start'>
                                                    {
                                                        inventoryHistory
                                                            ?.transferBy
                                                            ?.full_name
                                                    }
                                                </p>
                                                <Badge
                                                    variant={getRoleBadgeVariant(
                                                        inventoryHistory
                                                            ?.transferBy
                                                            ?.role as IRoles
                                                    )}
                                                >
                                                    {inventoryHistory?.transferBy?.role.replace(
                                                        /_/g,
                                                        ' '
                                                    )}
                                                </Badge>
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
            {!isLoading && inventory_histories?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}

{
    /* <div className="w-fit mx-auto py-4">
  <Loader className="size-5 animate-spin" />
</div>; */
}
