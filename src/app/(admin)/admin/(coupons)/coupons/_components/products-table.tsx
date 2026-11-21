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
import ProductActions from './product-actions';
import { ICoupon } from '@/types/coupon';
import { useToggleCouponStatusMutation } from '@/redux/api-queries/coupon-api';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

type ProductsTableProps = {
    products: [];
    isLoading: boolean;
    isFetching: boolean;
};

const PRODUCTS_TABLE_HEADERS = [
    'SL NO:',
    'Code',
    'Type',
    'DiscountValue',
    'Used',
    'Status',
    'Expire',
    'Actions'
];

export function ProductsTable({
    products,
    isLoading,
    isFetching
}: ProductsTableProps) {
    // === API Hooks ===
    const [toggleCoupon, { isLoading: isToogleCoupon }] =
        useToggleCouponStatusMutation();
    return (
        <div className='rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && (
                <Table>
                    {/* table header */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {PRODUCTS_TABLE_HEADERS.map((header, index) => (
                                <TableHead
                                    key={header}
                                    className={cn('bg-primary/10 px-4', {
                                        'rounded-tr-md text-center':
                                            index ===
                                            PRODUCTS_TABLE_HEADERS?.length - 1,
                                        'rounded-tl-md': index === 0
                                    })}
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* table body */}
                    {products?.length > 0 && (
                        <TableBody>
                            {products?.map((coupon: ICoupon, index) => {
                                // fetching
                                const code = coupon?.code || '';
                                const discountType = coupon?.discountType || '';
                                const discountValue =
                                    coupon?.discountValue || '';
                                const usedCount = coupon?.usedCount || 0;
                                const isExpired = coupon?.expireAt
                                    ? new Date() > new Date(coupon.expireAt)
                                    : false;
                                // Inside your component
                                const expireAt = coupon?.expireAt || '';
                                const formattedDate = expireAt
                                    ? format(new Date(expireAt), 'dd MMM yyyy')
                                    : 'N/A';

                                return (
                                    <TableRow key={coupon?._id}>
                                        <TableCell className='px-4'>
                                            {index + 1 < 10
                                                ? `0${index + 1}`
                                                : index + 1}
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            <p className='line-clamp-2 w-full overflow-hidden text-ellipsis'>
                                                {code}
                                            </p>
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            <p className='line-clamp-2 w-full overflow-hidden text-ellipsis'>
                                                {discountType}
                                            </p>
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            <p className='line-clamp-2 w-full overflow-hidden text-ellipsis'>
                                                {discountValue}
                                            </p>
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            <p className='line-clamp-2 w-full overflow-hidden text-ellipsis'>
                                                {usedCount}
                                            </p>
                                        </TableCell>

                                        <TableCell className='px-4'>
                                            {isExpired ? (
                                                <div className='inline-flex items-center rounded-full border border-destructive bg-destructive/5 px-2.5 py-0.5 text-xs font-medium text-destructive uppercase'>
                                                    Expired
                                                </div>
                                            ) : (
                                                <div className='flex items-center space-x-2'>
                                                    <Switch
                                                        id={`toggle-${coupon?._id}`}
                                                        disabled={
                                                            isToogleCoupon
                                                        }
                                                        checked={
                                                            coupon?.isActive
                                                        }
                                                        onCheckedChange={async () => {
                                                            try {
                                                                const res =
                                                                    await toggleCoupon(
                                                                        coupon?._id
                                                                    ).unwrap();
                                                                if (
                                                                    res?.success
                                                                ) {
                                                                    toast.success(
                                                                        res?.message ||
                                                                            'Status updated successfully'
                                                                    );
                                                                }
                                                            } catch (error: any) {
                                                                toast.error(
                                                                    error?.data
                                                                        ?.message ||
                                                                        'Failed to update status'
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <span className='text-xs text-muted-foreground uppercase'>
                                                        {coupon?.isActive
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className='px-4'>
                                            <p className='line-clamp-2 w-full overflow-hidden text-ellipsis'>
                                                {formattedDate}
                                            </p>
                                        </TableCell>

                                        <TableCell className='flex justify-center'>
                                            <ProductActions product={coupon} />
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
            {!isLoading && products?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}
