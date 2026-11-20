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
import { Loader } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { TCategory } from '@/admin/types/category';
import { useUpdateCategoryMutation } from '@/admin/redux/api-queries/category-api';
import { Switch } from '@/admin/components/ui/switch';
import { toast } from 'sonner';
import { getImgFullUrl } from '@/admin/lib/utils';
import CategoryActions from './category-actions';

type CategoriesTableProps = {
    categories: [];
    isLoading: boolean;
    isFetching: boolean;
};

const CATEGORIES_TABLE_HEADERS = [
    'Position',
    'Image',
    'Name',
    'Slug',
    'Sub Categories',
    'Status',
    'Actions'
];

export function CategoriesTable({
    categories,
    isLoading,
    isFetching
}: CategoriesTableProps) {
    // === update category api mutation hook ===
    const [updateCategory, { isLoading: isUpdateCategoryLoading }] =
        useUpdateCategoryMutation();
    return (
        <div>
            <Table>
                {/* table header */}
                <TableHeader className='relative h-9 bg-sidebar'>
                    <TableRow>
                        {CATEGORIES_TABLE_HEADERS.map((header) => (
                            <TableHead
                                key={header}
                                className={cn('bg-background')}
                            >
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                {/* table body */}
                {categories?.length > 0 && (
                    <TableBody>
                        {categories?.map((category: TCategory) => {
                            const thumb =
                                category?.media?.[0]?.image ||
                                '/No_Image_Available.jpg';
                            const slug = category?.slug || '';
                            const subcategories =
                                category?.subcategories?.length || 0;
                            console.log('thumb: ', category);
                            return (
                                <TableRow key={category?._id}>
                                    <TableCell>{category?.position}</TableCell>
                                    <TableCell>
                                        <Image
                                            src={getImgFullUrl(thumb)}
                                            alt={category?.name_en}
                                            height={100}
                                            width={100}
                                            className='size-10 rounded-md object-cover md:size-20'
                                        />
                                    </TableCell>
                                    <TableCell className='font-semibold'>
                                        {category?.name_en}
                                    </TableCell>
                                    <TableCell>{slug}</TableCell>
                                    <TableCell className='max-w-80 truncate'>
                                        {subcategories}
                                    </TableCell>
                                    <TableCell className='max-w-80 truncate'>
                                        <div className='flex items-center space-x-2'>
                                            <Switch
                                                id={`toggle-${category?._id}`}
                                                disabled={
                                                    isUpdateCategoryLoading
                                                }
                                                checked={category?.is_published}
                                                onCheckedChange={async () => {
                                                    try {
                                                        const payload = {
                                                            is_published:
                                                                !category?.is_published
                                                        };
                                                        const res =
                                                            await updateCategory(
                                                                {
                                                                    payload,
                                                                    category_id:
                                                                        category?._id
                                                                }
                                                            ).unwrap();
                                                        if (res?.success) {
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
                                                {category?.is_published
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className=''>
                                        <CategoryActions category={category} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                )}
            </Table>

            {/* loading data state */}
            {(isLoading || isFetching) && (
                <div className='mx-auto w-fit py-4'>
                    <Loader className='size-5 animate-spin' />
                </div>
            )}

            {/* empty data state */}
            {!isLoading && categories?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}
