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
import { TUser } from '@/types/admin/user';
import { toast } from 'sonner';
import { useUpdateStatusMutation } from '@/redux/admin/api/reviews-api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import Image from 'next/image';
import { getMediaUrl } from '@/utils/get-media-url';
import ProductActions from './product-actions';
// import ProductActions from "./product-actions";

type StaffsTableProps = {
    customers: [];
    isLoading: boolean;
    isFetching: boolean;
};

const STAFFS_TABLE_HEADERS = [
    'Sl No:',
    'Image',
    'Name',
    'Rating',
    'Title',
    'Content',
    'Status',
    'Create Date',
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

    const [updateProduct, { isLoading: isStatusLoading }] =
        useUpdateStatusMutation();

    return (
        <div className='max-h-[calc(100vh-350px)] overflow-y-auto rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && !isFetching && (
                <Table>
                    {/* table header */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {STAFFS_TABLE_HEADERS.map((header, index) => (
                                <TableHead
                                    key={index}
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
                                    const productName = customer?.product?.name;
                                    const productUrl = customer?.media[0]?.url;
                                    const slug = customer?.product?.slug;
                                    const rating = customer?.rating || 0;
                                    const verifiedPurchase =
                                        customer?.verifiedPurchase
                                            ? 'Yes'
                                            : 'No';
                                    console.log(
                                        'verifiedPurchase',
                                        verifiedPurchase
                                    );
                                    const title = customer?.title;
                                    const content = customer?.content;

                                    return (
                                        <TableRow key={customer?._id}>
                                            <TableCell className='truncate px-2'>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className='max-w-[80px] min-w-[60px] shrink-0 px-1'>
                                                <Image
                                                    src={
                                                        getMediaUrl(
                                                            productUrl
                                                        ) ||
                                                        '/No_Image_Available.jpg'
                                                    }
                                                    alt={productName}
                                                    height={100}
                                                    width={100}
                                                    className='size-full shrink-0 rounded-md object-cover'
                                                />
                                            </TableCell>
                                            <TableCell className='max-w-52 truncate px-2'>
                                                <p>{productName}</p>
                                                <p>{slug}</p>
                                            </TableCell>

                                            <TableCell className='px-4'>
                                                {rating}
                                            </TableCell>

                                            <TableCell className='max-w-52 truncate px-4 whitespace-nowrap'>
                                                {title}
                                            </TableCell>
                                            <TableCell className='max-w-52 truncate px-4 whitespace-nowrap'>
                                                {content}
                                            </TableCell>

                                            <TableCell className='px-2'>
                                                <div className='flex items-center space-x-2'>
                                                    <Select
                                                        disabled={
                                                            isStatusLoading
                                                        }
                                                        defaultValue={
                                                            customer?.status
                                                        }
                                                        onValueChange={async (
                                                            newValue
                                                        ) => {
                                                            try {
                                                                // Construct the payload based on the selected value
                                                                const res =
                                                                    await updateProduct(
                                                                        {
                                                                            payload:
                                                                                {
                                                                                    status: newValue
                                                                                },
                                                                            review_id:
                                                                                customer?._id
                                                                        }
                                                                    ).unwrap();

                                                                if (
                                                                    res?.success
                                                                ) {
                                                                    toast.success(
                                                                        res?.message ||
                                                                            `Status updated to ${newValue}`
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
                                                    >
                                                        <SelectTrigger className='h-8 w-[110px] text-xs'>
                                                            <SelectValue placeholder='Select status' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='pending'>
                                                                Pending
                                                            </SelectItem>
                                                            <SelectItem value='approved'>
                                                                Approved
                                                            </SelectItem>
                                                            <SelectItem value='rejected'>
                                                                Rejected
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </TableCell>
                                            <TableCell className='px-2'>
                                                {formatDate(
                                                    customer?.createdAt
                                                )}
                                            </TableCell>

                                            <TableCell className='px-2 text-center'>
                                                <ProductActions
                                                    product={customer}
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
