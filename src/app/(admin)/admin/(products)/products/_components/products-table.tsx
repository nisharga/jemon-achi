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
import Image from 'next/image';
import React from 'react';
import { IProductSaleChannels, TProduct } from '@/types/admin/product';
import ProductActions from './product-actions';
import ProductPublishedStatus from './product-published-status';
import { getMediaUrl } from '@/utils/get-media-url';

type ProductsTableProps = {
    products: [];
    isLoading: boolean;
    isFetching: boolean;
};

const PRODUCTS_TABLE_HEADERS = [
    'SL NO:',
    'Image',
    'Name',
    'Category',
    //  "Variants",
    'SKU',
    'Price',
    'Sale Channels',
    'Available in Outlets',
    'Active Status',
    'Actions'
];

export function ProductsTable({
    products,
    isLoading,
    isFetching
}: ProductsTableProps) {
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
                            {products?.map((product: TProduct, index) => {
                                return (
                                    <TableRow key={product?._id}>
                                        <TableCell className='px-4'>
                                            {index + 1 < 10
                                                ? `0${index + 1}`
                                                : index + 1}
                                        </TableCell>
                                        <TableCell className='max-w-[80px] min-w-[60px] shrink-0 px-1'>
                                            <Image
                                                src={
                                                    getMediaUrl(
                                                        product?.thumbnail as string
                                                    ) ||
                                                    '/No_Image_Available.jpg'
                                                }
                                                alt={product?.name}
                                                height={100}
                                                width={100}
                                                className='size-full shrink-0 rounded-md object-cover'
                                            />
                                        </TableCell>
                                        <TableCell className='max-w-[250px] px-4'>
                                            <p className='line-clamp-2 w-full overflow-hidden text-ellipsis'>
                                                {product?.name}
                                                {/* {product?.sku && `(${product?.sku || ""})`} */}
                                            </p>
                                        </TableCell>

                                        <TableCell className='px-4'>
                                            <p className='text-gray-600'>
                                                Category:{' '}
                                                <span className='text-black'>
                                                    {
                                                        product?.category
                                                            ?.name_en
                                                    }{' '}
                                                </span>
                                            </p>
                                            <p className='text-gray-600'>
                                                Subcategory:{' '}
                                                <span className='text-black'>
                                                    {
                                                        product?.subcategory
                                                            ?.name_en
                                                    }
                                                </span>
                                            </p>
                                        </TableCell>
                                        {/* <TableCell className='px-4'>
           {product?.variants?.length > 0 ? (
            product?.variants?.map((variant) => {
             // Join attribute values in the order of variant.attributes
             const attrString =
              variant.attributes?.length > 0
               ? variant.attributes
                  ?.map((attr: string) => variant.attribute_values[attr])
                  .join("-")
               : "No Attributes";

             return (
              <div key={variant._id}>
               {attrString} - ({variant.sku})
              </div>
             );
            })
           ) : (
            <div className='text-yellow-500'>No Variants Found</div>
           )}
          </TableCell> */}
                                        <TableCell className='px-4'>
                                            <p className='line-clamp-2 w-full overflow-hidden text-ellipsis'>
                                                {product?.sku || 'N/A'}
                                            </p>
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            <p className='w-full overflow-hidden font-medium text-ellipsis'>
                                                {product?.variants?.length >
                                                0 ? (
                                                    <>
                                                        <del className='text-gray-600'>
                                                            ৳
                                                            {
                                                                product
                                                                    ?.variants[0]
                                                                    ?.regular_price
                                                            }
                                                        </del>{' '}
                                                        <span className='text-base'>
                                                            ৳
                                                            {
                                                                product
                                                                    ?.variants[0]
                                                                    ?.sale_price
                                                            }
                                                        </span>
                                                    </>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </p>
                                        </TableCell>
                                        <TableCell className='px-4 uppercase'>
                                            {product.sale_channels &&
                                                (
                                                    Object.keys(
                                                        product.sale_channels
                                                    ) as Array<
                                                        keyof IProductSaleChannels
                                                    >
                                                )
                                                    .filter(
                                                        (key) =>
                                                            product
                                                                .sale_channels?.[
                                                                key
                                                            ]
                                                    )
                                                    .join(', ')}
                                        </TableCell>
                                        <TableCell className='line-clamp-3 flex max-w-[250px] flex-wrap gap-2 px-4'>
                                            {product?.stocks?.length > 0 ? (
                                                product?.stocks?.map(
                                                    (stock: any) =>
                                                        stock?.business_location?.map(
                                                            (location: any) =>
                                                                location?.name +
                                                                ','
                                                        )
                                                )
                                            ) : (
                                                <div className='text-yellow-500'>
                                                    No Stocks Found
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            <ProductPublishedStatus
                                                productId={product?._id}
                                                isPublished={
                                                    product?.is_published as boolean
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className='px-8 text-center'>
                                            <ProductActions product={product} />
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

{
    /* <div className="w-fit mx-auto py-4">
  <Loader className="size-5 animate-spin" />
</div>; */
}
