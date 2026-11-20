'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/admin/components/ui/table';
import { cn } from '@/admin/lib/utils';
import React from 'react';
import { TUser } from '@/admin/types/user';
import CustomerActions from './customer-actions';

type StaffsTableProps = {
    customers: [];
    isLoading: boolean;
    isFetching: boolean;
};

const STAFFS_TABLE_HEADERS = [
    'Sl No:',
    'Name',
    'Total Orders',
    'Completed Orders',
    'Cancelled Orders',
    'Status',
    'User Type',
    'Joined Date',
    'Last Updated',
    'Actions'
];

export function CustomersTable({
    customers,
    isLoading,
    isFetching
}: StaffsTableProps) {
    // Format date function
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className='max-h-[calc(100vh-350px)] overflow-y-auto rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && !isFetching && (
                <Table>
                    {/* table header */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {STAFFS_TABLE_HEADERS.map((header, index) => (
                                <TableHead
                                    key={header}
                                    className={cn('bg-primary/10 px-2', {
                                        'rounded-tr-md text-center':
                                            index ===
                                            STAFFS_TABLE_HEADERS?.length - 1,
                                        'rounded-tl-md': index === 0
                                    })}
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* table body */}
                    {customers?.length > 0 && (
                        <TableBody>
                            {customers?.map(
                                (customer: TUser, index: number) => {
                                    return (
                                        <TableRow key={customer?._id}>
                                            <TableCell className='truncate px-2'>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className='max-w-52 truncate px-2'>
                                                <p>{customer?.full_name}</p>
                                                <p>{customer?.phone_number}</p>
                                            </TableCell>

                                            <TableCell className='px-4'>
                                                {customer?.total_orders}
                                            </TableCell>
                                            <TableCell className='px-2'>
                                                {customer?.completed_orders}
                                            </TableCell>
                                            <TableCell className='px-2'>
                                                {customer?.cancelled_orders}
                                            </TableCell>
                                            <TableCell className='px-2'>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        customer?.status ===
                                                        'ACTIVE'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {customer?.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className='px-2'>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        customer?.userType ===
                                                        'POS'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}
                                                >
                                                    {customer?.userType}
                                                </span>
                                            </TableCell>
                                            <TableCell className='px-2'>
                                                {formatDate(
                                                    customer?.createdAt
                                                )}
                                            </TableCell>
                                            <TableCell className='px-2'>
                                                {formatDate(
                                                    customer?.updatedAt
                                                )}
                                            </TableCell>
                                            <TableCell className='px-2 text-center'>
                                                <CustomerActions
                                                    customer={customer}
                                                />
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
            {!isLoading && customers?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}
