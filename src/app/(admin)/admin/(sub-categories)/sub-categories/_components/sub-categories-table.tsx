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
import { CornerDownRight, Loader } from 'lucide-react';
import { getImgFullUrl } from '@/admin/lib/utils';
import Image from 'next/image';
import React from 'react';
import { TSubCategory } from '@/admin/types/sub-category';
import SubCategoryActions from './subcategory-actions';

type SubCategoriesTableProps = {
    subCategories: [];
    isLoading: boolean;
    isFetching: boolean;
};

const SUB_CATEGORIES_TABLE_HEADERS = [
    'Index',
    'Image',
    'Name (EN)',
    'Name (BN)',
    'Description (EN)',
    'Description (BN)',
    'Category',
    'Actions'
];

export function SubCategoriesTable({
    subCategories,
    isLoading,
    isFetching
}: SubCategoriesTableProps) {
    console.log('subCategories?.subCategories', subCategories);
    return (
        <div>
            <Table>
                {/* table header */}
                <TableHeader className='relative h-9 bg-sidebar'>
                    <TableRow>
                        {SUB_CATEGORIES_TABLE_HEADERS.map((header) => (
                            <TableHead
                                key={header}
                                className={cn('bg-background')}
                            >
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                {/* table */}
                {subCategories?.length > 0 && (
                    <TableBody>
                        {subCategories?.map(
                            (subCategory: TSubCategory, index) => (
                                <React.Fragment key={subCategory?._id}>
                                    {/* ============================== */}
                                    {/* MAIN SUB-CATEGORY ROW          */}
                                    {/* ============================== */}
                                    <TableRow className='group bg-background transition-colors'>
                                        <TableCell className='text-center font-medium'>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <Image
                                                src={getImgFullUrl(
                                                    subCategory?.media?.[0]
                                                        ?.image as string
                                                )}
                                                alt={subCategory?.name_en}
                                                height={100}
                                                width={100}
                                                className='size-10 rounded-md border object-cover shadow-sm transition-transform group-hover:scale-105 md:size-14'
                                            />
                                        </TableCell>
                                        <TableCell className='text-base font-bold text-primary'>
                                            {subCategory?.name_en}
                                        </TableCell>
                                        <TableCell className='font-medium'>
                                            {subCategory?.name_bn}
                                        </TableCell>
                                        <TableCell className='hidden max-w-60 truncate text-sm text-muted-foreground md:table-cell'>
                                            {subCategory?.description_en}
                                        </TableCell>
                                        <TableCell className='hidden max-w-60 truncate text-sm text-muted-foreground md:table-cell'>
                                            {subCategory?.description_bn}
                                        </TableCell>

                                        {/* PARENT CATEGORY DESIGN */}
                                        <TableCell>
                                            <div className='flex flex-col gap-1'>
                                                <span className='text-[9px] leading-none font-bold tracking-wider text-muted-foreground uppercase'>
                                                    Root Category
                                                </span>

                                                <span className='w-fit rounded border border-primary bg-primary px-1 py-0.5 text-[11px] font-bold text-white'>
                                                    {
                                                        subCategory?.category
                                                            ?.name_en
                                                    }
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className='text-right'>
                                            <SubCategoryActions
                                                subCategory={subCategory}
                                            />
                                        </TableCell>
                                    </TableRow>

                                    {/* ============================== */}
                                    {/* NESTED SUB-SUBCATEGORY ROWS    */}
                                    {/* ============================== */}
                                    {subCategory?.sub_subcategories &&
                                        subCategory.sub_subcategories.length >
                                            0 &&
                                        subCategory.sub_subcategories.map(
                                            (
                                                nestedItem: any,
                                                nestedIndex: number
                                            ) => {
                                                console.log(
                                                    'nestedItem: ',
                                                    nestedItem
                                                );
                                                return (
                                                    <TableRow
                                                        key={nestedItem?._id}
                                                        className='border-l-4 border-l-green-500/50 bg-muted/20 hover:bg-muted/40'
                                                    >
                                                        {/* Sub-Index e.g. 1.1 */}
                                                        <TableCell className='text-center text-xs text-muted-foreground'>
                                                            {index + 1}.
                                                            {nestedIndex + 1}
                                                        </TableCell>

                                                        {/* Nested image */}
                                                        <TableCell>
                                                            <div className='flex items-center justify-start pl-4'>
                                                                <Image
                                                                    src={
                                                                        getImgFullUrl(
                                                                            nestedItem
                                                                                ?.media?.[0]
                                                                                ?.image as string
                                                                        ) ||
                                                                        '/placeholder.png'
                                                                    }
                                                                    alt={
                                                                        nestedItem?.name_en
                                                                    }
                                                                    height={50}
                                                                    width={50}
                                                                    className='size-8 rounded-md border bg-white object-cover md:size-10'
                                                                />
                                                            </div>
                                                        </TableCell>

                                                        {/* Name with Nesting Icon */}
                                                        <TableCell>
                                                            <div className='flex items-center gap-2 pl-4'>
                                                                <CornerDownRight className='size-4 text-green-500' />
                                                                <span className='text-sm font-semibold text-foreground/80'>
                                                                    {
                                                                        nestedItem?.name_en
                                                                    }
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className='text-sm text-muted-foreground'>
                                                            {
                                                                nestedItem?.name_bn
                                                            }
                                                        </TableCell>

                                                        <TableCell className='hidden max-w-60 truncate text-xs text-muted-foreground italic md:table-cell'>
                                                            {
                                                                nestedItem?.description_en
                                                            }
                                                        </TableCell>
                                                        <TableCell className='hidden max-w-60 truncate text-xs text-muted-foreground italic md:table-cell'>
                                                            {
                                                                nestedItem?.description_bn
                                                            }
                                                        </TableCell>

                                                        {/* Shows which Sub-Category this belongs to */}
                                                        <TableCell>
                                                            <div className='flex flex-col gap-0.5'>
                                                                <span className='text-[8px] font-bold text-muted-foreground uppercase'>
                                                                    Parent Sub
                                                                </span>
                                                                <span className='w-fit rounded border border-green-100 bg-green-50 px-1.5 py-0.5 text-[11px] font-bold text-green-700'>
                                                                    {
                                                                        subCategory.name_en
                                                                    }
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        {/* Edit Button for Nested Item */}
                                                        <TableCell className='text-right'>
                                                            <SubCategoryActions
                                                                subCategory={
                                                                    nestedItem as TSubCategory
                                                                }
                                                                isSubSubcategory={
                                                                    true
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        )}
                                </React.Fragment>
                            )
                        )}
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
            {!isLoading && subCategories?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}
