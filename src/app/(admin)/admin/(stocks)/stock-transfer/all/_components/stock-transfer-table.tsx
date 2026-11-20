'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/admin/components/ui/table';
import { cn } from '@/admin/lib/utils';
import { format } from 'date-fns';
import StockTransferActions from './stock-tranfer-action';

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/admin/components/ui/dialog'; // shadcn dialog import

type TableProps = {
    stocks: any[];
    isLoading: boolean;
    isFetching: boolean;
};

const TABLE_HEADERS = [
    'Date',
    'Items',
    'From',
    'To',
    'Expenses',
    'Transfer By',
    'Actions'
];

export function StockTransferTable({
    stocks,
    isLoading,
    isFetching
}: TableProps) {
    return (
        <div className='relative rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && !isFetching && (
                <Table>
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
                                                TABLE_HEADERS.length - 1,
                                            'rounded-tl-md': index === 0
                                        }
                                    )}
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {stocks?.length > 0 &&
                            stocks?.map((stock: any, index: number) => (
                                <TableRow key={index}>
                                    {/* DATE */}
                                    <TableCell className='w-24 border-r whitespace-normal'>
                                        {stock?.createdAt ? (
                                            <span className='flex flex-col gap-1'>
                                                <p>
                                                    {format(
                                                        new Date(
                                                            stock?.createdAt
                                                        ),
                                                        'dd/MM/yyyy'
                                                    )}
                                                </p>
                                                <p>
                                                    {format(
                                                        new Date(
                                                            stock?.createdAt
                                                        ),
                                                        'hh:mm a'
                                                    )}
                                                </p>
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>

                                    {/* ITEMS */}
                                    <TableCell className='w-48 border-r whitespace-normal'>
                                        <InlineItemsDialog
                                            items={stock?.items || []}
                                        />
                                    </TableCell>

                                    {/* FROM */}
                                    <TableCell className='w-24 border-r whitespace-normal'>
                                        {stock?.from?.name}
                                    </TableCell>

                                    {/* TO */}
                                    <TableCell className='w-24 border-r whitespace-normal'>
                                        {stock?.to?.name}
                                    </TableCell>

                                    {/* EXPENSES */}
                                    <TableCell className='w-24 border-r whitespace-normal'>
                                        {stock?.expenses_applied?.map(
                                            (expense: any) => (
                                                <li
                                                    key={expense?._id}
                                                    className='list-none'
                                                >
                                                    {expense?.type} -{' '}
                                                    {expense?.amount}
                                                </li>
                                            )
                                        )}
                                    </TableCell>

                                    {/* TRANSFER BY */}
                                    <TableCell className='w-24 border-r whitespace-normal'>
                                        {stock?.transferBy?.full_name}
                                    </TableCell>

                                    {/* ACTIONS */}
                                    <TableCell className='w-24 text-center whitespace-normal'>
                                        <StockTransferActions stock={stock} />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            )}

            {/* Loading */}
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

            {/* Empty */}
            {!isLoading && stocks?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}

/* ----------------------------------------------------------
   INLINE ITEMS DIALOG COMPONENT
----------------------------------------------------------- */
function InlineItemsDialog({ items = [] }: { items: any[] }) {
    const previewItems = items?.slice(0, 4);

    return (
        <div>
            {/* Inline preview of first 4 items */}
            {previewItems?.map((item: any, index: number) => {
                const variantText = Object.values(
                    item?.variant?.attribute_values || {}
                ).join(', ');
                return (
                    <p key={index} className='text-sm'>
                        <strong>{index + 1}.</strong> SKU: {item?.variant?.sku}{' '}
                        — {variantText}{' '}
                        <span className='ml-1 text-muted-foreground'>
                            ({item.qty} pcs)
                        </span>
                    </p>
                );
            })}

            {/* Show "See More" button if more than 4 items */}
            {items?.length > 4 && (
                <Dialog>
                    <DialogTrigger asChild>
                        <button className='mt-2 cursor-pointer text-sm text-pink-400 underline hover:text-pink-500'>
                            See More
                        </button>
                    </DialogTrigger>

                    <DialogContent className='max-h-80 w-96 overflow-y-auto'>
                        <DialogHeader>
                            <DialogTitle>All Items</DialogTitle>
                        </DialogHeader>

                        {/* Render all items in modal */}
                        {items?.map((item: any, index: number) => {
                            const variantText = Object.values(
                                item?.variant?.attribute_values || {}
                            ).join(', ');
                            return (
                                <p
                                    key={index}
                                    className='border-b pb-1 text-sm last:border-b-0'
                                >
                                    <strong>{index + 1}.</strong> SKU:{' '}
                                    {item?.variant?.sku} — {variantText}{' '}
                                    <span className='ml-1 text-muted-foreground'>
                                        ({item?.qty} pcs)
                                    </span>
                                </p>
                            );
                        })}

                        <DialogFooter>
                            <DialogClose className='cursor-pointer rounded-md bg-red-200 px-3 py-1 text-red-600 hover:bg-red-300 hover:text-red-800'>
                                Close
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
