import { Button } from '@/shop/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shop/components/ui/card';
import { Skeleton } from '@/shop/components/ui/skeleton';
import { ShoppingBag, XCircle } from 'lucide-react';
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/shop/components/ui/table'; // Adjust based on your path

const ProfileSkeleton = () => (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
        <div className='mx-auto max-w-6xl space-y-8'>
            {/* Header Skeleton */}
            <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
                <div className='flex flex-col items-start gap-6 lg:flex-row lg:items-center'>
                    <Skeleton className='h-24 w-24 rounded-2xl' />
                    <div className='flex-1 space-y-3'>
                        <Skeleton className='h-8 w-64' />
                        <Skeleton className='h-5 w-40' />
                        <div className='flex gap-2'>
                            <Skeleton className='h-7 w-20' />
                            <Skeleton className='h-7 w-24' />
                            <Skeleton className='h-7 w-18' />
                        </div>
                    </div>
                    <Skeleton className='h-11 w-32' />
                </div>
            </div>

            {/* Stats Skeleton */}
            <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'
                    >
                        <div className='flex items-center justify-between'>
                            <div className='space-y-2'>
                                <Skeleton className='h-4 w-20' />
                                <Skeleton className='h-8 w-16' />
                            </div>
                            <Skeleton className='h-10 w-10 rounded-lg' />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Skeleton */}
            <div className='grid gap-6 lg:grid-cols-3'>
                <div className='space-y-6 lg:col-span-2'>
                    <div className='rounded-2xl border border-gray-100 bg-white shadow-sm'>
                        <div className='border-b border-gray-100 p-6'>
                            <Skeleton className='h-6 w-40' />
                        </div>
                        <div className='space-y-6 p-6'>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className='space-y-2'>
                                    <Skeleton className='h-4 w-24' />
                                    <Skeleton className='h-12 w-full rounded-lg' />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='space-y-6'>
                    <div className='rounded-2xl border border-gray-100 bg-white shadow-sm'>
                        <div className='border-b border-gray-100 p-6'>
                            <Skeleton className='h-6 w-32' />
                        </div>
                        <div className='p-6'>
                            <Skeleton className='h-40 w-full' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default ProfileSkeleton;

export const NoOrderMessage = () => {
    return (
        <CardContent className='p-8'>
            <div className='py-12 text-center'>
                <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 p-6'>
                    <ShoppingBag className='h-12 w-12 text-gray-400' />
                </div>
                <h3 className='mb-3 text-lg font-medium text-gray-900'>
                    No Orders Yet
                </h3>
                <p className='mx-auto mb-6 max-w-md text-gray-600'>
                    You haven&apos;t placed any orders yet. Start shopping to
                    see your order history here.
                </p>
                <Button
                    className='bg-primary text-xs text-secondary shadow-sm hover:bg-primary/90'
                    size='lg'
                >
                    <ShoppingBag className='mr-2 h-4 w-4' />
                    Start Shopping
                </Button>
            </div>
        </CardContent>
    );
};

export const NoUser = () => {
    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
            <div className='rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm'>
                <XCircle className='mx-auto mb-4 h-16 w-16 text-red-500' />
                <h2 className='mb-2 text-2xl font-normal text-gray-900'>
                    User not found
                </h2>
                <p className='text-gray-600'>Please try again later.</p>
            </div>
        </div>
    );
};

export const SkeletonOrderTable = () => {
    // We simulate 3 orders, each with a different number of product rows
    const skeletonRows = [2, 1, 2];

    return (
        <Table className='w-full overflow-x-scroll px-4'>
            <TableHeader className='bg-gray-50/80'>
                <TableRow className='hover:bg-transparent'>
                    <TableHead className='xs-normal w-[100px] tracking-wider uppercase'>
                        Order Detail
                    </TableHead>
                    <TableHead className='xs-normal tracking-wider uppercase'>
                        Products
                    </TableHead>
                    <TableHead className='xs-normal tracking-wider uppercase'>
                        Status
                    </TableHead>
                    <TableHead className='xs-normal text-right tracking-wider uppercase'>
                        Write a Review
                    </TableHead>
                </TableRow>
            </TableHeader>

            {skeletonRows.map((productCount, orderIndex) => (
                <TableBody
                    key={orderIndex}
                    className='animate-pulse border-b last:border-0'
                >
                    {Array.from({ length: productCount }).map(
                        (_, itemIndex) => (
                            <TableRow key={itemIndex}>
                                {/* 1. Order ID Skeleton (Only on first item of the group) */}
                                {itemIndex === 0 ? (
                                    <TableCell
                                        className='pt-6 align-top'
                                        rowSpan={productCount}
                                    >
                                        <div className='space-y-3'>
                                            <div className='h-3 w-12 rounded bg-gray-200' />{' '}
                                            {/* Label */}
                                            <div className='h-4 w-20 rounded bg-gray-300' />{' '}
                                            {/* ID */}
                                            <div className='h-7 w-16 rounded-md bg-gray-200' />{' '}
                                            {/* Button */}
                                        </div>
                                    </TableCell>
                                ) : null}

                                {/* 2. Product Column Skeleton */}
                                <TableCell className='py-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='h-12 w-12 flex-shrink-0 rounded-md bg-gray-200' />
                                        <div className='flex-1 space-y-2'>
                                            <div className='h-4 w-32 rounded bg-gray-300' />
                                            <div className='flex gap-1'>
                                                <div className='h-3 w-10 rounded bg-gray-100' />
                                                <div className='h-3 w-10 rounded bg-gray-100' />
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* 3. Status Column Skeleton */}
                                <TableCell className='align-middle'>
                                    <div className='h-5 w-16 rounded-full bg-gray-200' />
                                </TableCell>

                                {/* 4. Action Column Skeleton */}
                                <TableCell className='text-right align-middle'>
                                    <div className='flex justify-end'>
                                        <div className='h-7 w-20 rounded-md bg-gray-200' />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    )}
                </TableBody>
            ))}
        </Table>
    );
};
