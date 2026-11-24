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
import { Badge } from '@/components/ui/admin-badge';
import { TSupplier } from '@/types/admin/supplier';
import SupplierActions from './supplier-actions';

type TableProps = {
    suppliers: TSupplier[];
    isLoading: boolean;
    isFetching: boolean;
};

const TABLE_HEADERS = [
    'Sl No.',
    'Name',
    'Type',
    'Email',
    'Phone',
    'Address',
    'Actions'
];

export function SupplierTable({
    suppliers,
    isLoading,
    isFetching
}: TableProps) {
    const hasData = suppliers && suppliers.length > 0;
    const isTableVisible = !isLoading && !isFetching;

    return (
        <div className='rounded-lg bg-background p-2 shadow-md'>
            {isTableVisible && (
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
                    {hasData ? (
                        <TableBody>
                            {suppliers.map(
                                (supplier: TSupplier, index: number) => {
                                    return (
                                        <TableRow
                                            key={
                                                supplier?._id ||
                                                supplier?.id ||
                                                index
                                            }
                                        >
                                            <TableCell className='w-8 border-r text-center whitespace-normal'>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                {supplier?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className='w-24 border-r text-center whitespace-normal'>
                                                <Badge
                                                    variant={
                                                        supplier?.type ===
                                                        'COMPANY'
                                                            ? 'green-outline'
                                                            : supplier?.type ===
                                                                'INDIVIDUAL'
                                                              ? 'blue-outline'
                                                              : 'secondary'
                                                    }
                                                >
                                                    {supplier?.type ||
                                                        'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='w-32 border-r whitespace-normal'>
                                                {supplier?.email || 'N/A'}
                                            </TableCell>
                                            <TableCell className='w-32 border-r whitespace-normal'>
                                                {supplier?.phone || 'N/A'}
                                            </TableCell>
                                            <TableCell className='w-40 border-r whitespace-normal'>
                                                {supplier?.address || 'N/A'}
                                            </TableCell>
                                            <TableCell className='w-10 border-r text-center whitespace-normal'>
                                                <SupplierActions
                                                    product={supplier}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            )}
                        </TableBody>
                    ) : (
                        <TableBody>
                            <TableRow>
                                <TableCell
                                    colSpan={TABLE_HEADERS.length}
                                    className='border-r py-4 text-center'
                                >
                                    No suppliers found!
                                </TableCell>
                            </TableRow>
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
        </div>
    );
}
