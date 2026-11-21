/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/admin-label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/admin-utils';
import { getImgFullUrl } from '@/lib/admin-utils';
import { useGetSingleStockReportByVariantIdQuery } from '@/redux/api-queries/stock-api';
import Image from 'next/image';
import React from 'react';

type DialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    variantId: string;
};

const VARIATIONS_TABLE_HEADERS = [
    'Variations',
    'SKU',
    'Purchase Price',
    'Regular Price',
    'Sale Price'
    // "Available In Locations",
];

const STOCK_MOVEMENTS_TABLE_HEADERS = [
    //  "Variations",
    'SKU',
    'Qty (Pcs/pair)',
    'Type',
    'Purchase Cost',
    // "Regular Price",
    'Sale Price',
    'Business Location',
    'Action Date',
    'System Note'
];
const CURRENT_STOCKS_TABLE_HEADERS = [
    'Variations',
    'SKU',
    'Qty (Pcs/pair)',
    'Available In Locations'
];

const StockReportViewDialog = ({ open, setOpen, variantId }: DialogProps) => {
    // === get sinlge stock report varinat ===
    const { data, isLoading, isFetching } =
        useGetSingleStockReportByVariantIdQuery(
            {
                variant_id: variantId,
                stockMovementsLimit: 1000
            },
            {
                skip: !variantId
            }
        );
    const stock = data?.data;

    const saleChannels =
        stock?.product?.sale_channels &&
        Object.entries(stock?.product?.sale_channels)
            .filter(([key, value]) => value === true)
            .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
            .join(', ');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='flex max-h-[98vh] min-h-[98vh] flex-col gap-6 overflow-y-auto p-0 sm:min-w-[90vw]'>
                <DialogHeader className='border-b'>
                    <DialogTitle className='max-w-60 p-4 text-wrap lg:max-w-full'>
                        {isLoading || isFetching ? (
                            <div className='grid w-full gap-4'>
                                {Array.from({ length: 1 }).map((_, index) => (
                                    <span
                                        key={index}
                                        className='animate-skeleton h-9 rounded-md bg-secondary'
                                    />
                                ))}
                            </div>
                        ) : (
                            <>{stock?.product?.name}</>
                        )}
                    </DialogTitle>
                    <DialogDescription className='sr-only'>
                        Dialog Description for Meta
                    </DialogDescription>
                </DialogHeader>

                <div className='w-full space-y-6 px-4 pb-4'>
                    {isLoading || isFetching ? (
                        <div className='grid w-full gap-4'>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <span
                                    key={index}
                                    className='animate-skeleton h-9 rounded-md bg-secondary'
                                />
                            ))}
                        </div>
                    ) : (
                        <div className='flex w-full flex-col justify-between gap-6 lg:flex-row'>
                            <div className='space-y-1'>
                                <p className='text-sm'>
                                    <b>Product:</b> {stock?.product?.name}
                                </p>
                                <p className='text-sm'>
                                    <b>SKU:</b> {stock?.variant?.sku}
                                    {/* <b>SKU:</b> {stock?.product?.sku} */}
                                </p>
                                <span className='text-sm text-wrap'>
                                    <b>Available in locations:</b>
                                    <span className='space-y-2'>
                                        {stock?.stocks_by_location?.length >
                                        0 ? (
                                            stock?.stocks_by_location?.map(
                                                (l: any, index: number) => (
                                                    <p key={index}>
                                                        {' '}
                                                        {l?.location?.name}
                                                    </p>
                                                )
                                            )
                                        ) : (
                                            <p> N/A </p>
                                        )}
                                    </span>
                                </span>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-sm'>
                                    <b>Sale Channels:</b> {saleChannels}
                                </p>
                                <p className='text-sm'>
                                    <b>Total Sold:</b>{' '}
                                    {stock?.product?.total_sold}
                                </p>
                                <p className='max-w-96 text-sm text-wrap'>
                                    <b>Warranty:</b>{' '}
                                    {stock?.product?.warranty
                                        ? stock?.product?.warranty
                                        : 'N/A'}
                                </p>
                            </div>

                            <div className='rounded-md border bg-muted/30 p-2'>
                                <Image
                                    src={getImgFullUrl(
                                        stock?.product?.thumbnail as string
                                    )}
                                    alt={`${stock?.product?.name}_thumbnail`}
                                    height={720}
                                    width={720}
                                    className='size-60 rounded'
                                />
                            </div>
                        </div>
                    )}

                    {/* current stocks */}
                    {!isLoading && !isFetching && (
                        <div className='space-y-2'>
                            <Label className='text-lg'>Current Stocks</Label>
                            <div className='overflow-x-auto bg-background'>
                                <Table>
                                    {/* table header */}
                                    <TableHeader className='relative h-9 bg-sidebar'>
                                        <TableRow className='border-b-primary/50'>
                                            {CURRENT_STOCKS_TABLE_HEADERS.map(
                                                (header, index) => (
                                                    <TableHead
                                                        key={header}
                                                        className={cn(
                                                            'h-auto border-r border-r-primary/20 bg-primary/10 py-2 text-wrap whitespace-normal',
                                                            {
                                                                'border-r-0':
                                                                    index ===
                                                                    CURRENT_STOCKS_TABLE_HEADERS?.length -
                                                                        1
                                                            }
                                                        )}
                                                    >
                                                        {header}
                                                    </TableHead>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHeader>

                                    {/* table body */}
                                    {stock?.stocks_by_location?.length > 0 && (
                                        <TableBody>
                                            {stock?.stocks_by_location?.map(
                                                (
                                                    location: any,
                                                    index: number
                                                ) => {
                                                    // product variant
                                                    const variantCombination =
                                                        Object.entries(
                                                            stock?.variant
                                                                ?.attribute_values ||
                                                                {}
                                                        )
                                                            ?.map((i) => i?.[1])
                                                            .join('-');

                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {
                                                                    variantCombination
                                                                }
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {
                                                                    stock
                                                                        ?.variant
                                                                        ?.sku
                                                                }
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {
                                                                    location?.available_quantity
                                                                }
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {
                                                                    location
                                                                        ?.location
                                                                        ?.name
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )}
                                        </TableBody>
                                    )}
                                </Table>
                                {stock?.stock_movements?.data?.length === 0 && (
                                    <p className='py-4 text-center text-sm font-medium'>
                                        No data found
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* stock movements */}
                    {!isLoading && !isFetching && (
                        <div className='space-y-2'>
                            <Label className='text-lg'>Stock Movements</Label>
                            <div className='overflow-x-auto bg-background'>
                                <Table>
                                    {/* table header */}
                                    <TableHeader className='relative h-9 bg-sidebar'>
                                        <TableRow className='border-b-primary/50'>
                                            {STOCK_MOVEMENTS_TABLE_HEADERS.map(
                                                (header, index) => (
                                                    <TableHead
                                                        key={header}
                                                        className={cn(
                                                            'h-auto border-r border-r-primary/20 bg-primary/10 py-2 text-wrap whitespace-normal',
                                                            {
                                                                'border-r-0':
                                                                    index ===
                                                                    STOCK_MOVEMENTS_TABLE_HEADERS?.length -
                                                                        1
                                                            }
                                                        )}
                                                    >
                                                        {header}
                                                    </TableHead>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHeader>

                                    {/* table body */}
                                    {stock?.stock_movements?.data?.length >
                                        0 && (
                                        <TableBody>
                                            {stock?.stock_movements?.data?.map(
                                                (item: any) => {
                                                    // product variant
                                                    const variantCombination =
                                                        Object.entries(
                                                            item?.variant
                                                                ?.attribute_values ||
                                                                {}
                                                        )
                                                            ?.map(
                                                                (item) =>
                                                                    item?.[1]
                                                            )
                                                            .join('-');

                                                    const purchase_value =
                                                        item?.cost_per_unit *
                                                        item?.qty;

                                                    return (
                                                        <TableRow
                                                            key={item?._id}
                                                        >
                                                            {/* <TableCell className='border-r whitespace-normal w-24'>
               {variantCombination}
              </TableCell> */}
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {
                                                                    item
                                                                        ?.variant
                                                                        ?.sku
                                                                }
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {item?.qty}
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {item?.type
                                                                    ?.replace(
                                                                        /_/g,
                                                                        ' '
                                                                    )
                                                                    ?.replace(
                                                                        /^\s+|\s+$/g,
                                                                        ''
                                                                    )
                                                                    ?.toLowerCase()
                                                                    ?.replace(
                                                                        /\b\w/g,
                                                                        (
                                                                            char: string
                                                                        ) =>
                                                                            char?.toUpperCase()
                                                                    )}
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                ৳
                                                                {purchase_value
                                                                    ? purchase_value?.toFixed(
                                                                          0
                                                                      )
                                                                    : 0}
                                                            </TableCell>
                                                            {/* <TableCell className='border-r whitespace-normal w-24'>
               ৳{item?.variant?.regular_price}
              </TableCell> */}
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                ৳
                                                                {
                                                                    item
                                                                        ?.variant
                                                                        ?.sale_price
                                                                }
                                                            </TableCell>

                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {item
                                                                    ?.business_location
                                                                    ?.name ||
                                                                    'N/A'}
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {new Date(
                                                                    item?.createdAt
                                                                ).toLocaleDateString(
                                                                    'en-US',
                                                                    {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: '2-digit',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    }
                                                                )}
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r text-xs whitespace-normal'>
                                                                {item?.note ||
                                                                    'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )}
                                        </TableBody>
                                    )}
                                </Table>
                                {stock?.stock_movements?.data?.length === 0 && (
                                    <p className='py-4 text-center text-sm font-medium'>
                                        No data found
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* variations */}
                    {!isLoading && !isFetching && (
                        <div className='space-y-2'>
                            <Label className='text-lg'>All Variations</Label>
                            <div className='overflow-x-auto bg-background'>
                                <Table>
                                    {/* table header */}
                                    <TableHeader className='relative h-9 bg-sidebar'>
                                        <TableRow className='border-b-primary/50'>
                                            {VARIATIONS_TABLE_HEADERS.map(
                                                (header, index) => (
                                                    <TableHead
                                                        key={header}
                                                        className={cn(
                                                            'h-auto border-r border-r-primary/20 bg-primary/10 py-2 text-wrap whitespace-normal',
                                                            {
                                                                'border-r-0':
                                                                    index ===
                                                                    VARIATIONS_TABLE_HEADERS?.length -
                                                                        1
                                                            }
                                                        )}
                                                    >
                                                        {header}
                                                    </TableHead>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHeader>

                                    {/* table body */}
                                    {stock?.sibling_variants?.length > 0 && (
                                        <TableBody>
                                            {stock?.sibling_variants?.map(
                                                (variant: any) => {
                                                    // product variant
                                                    const variantCombination =
                                                        Object.entries(
                                                            variant?.attribute_values ||
                                                                {}
                                                        )
                                                            ?.map(
                                                                (item) =>
                                                                    item?.[1]
                                                            )
                                                            .join('-');

                                                    return (
                                                        <TableRow
                                                            key={variant?._id}
                                                        >
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {
                                                                    variantCombination
                                                                }
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                {variant?.sku}
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                ৳
                                                                {variant?.avg_purchase_price
                                                                    ? variant?.avg_purchase_price?.toFixed(
                                                                          0
                                                                      )
                                                                    : 0}
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                ৳
                                                                {
                                                                    variant?.regular_price
                                                                }
                                                            </TableCell>
                                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                                ৳
                                                                {
                                                                    variant?.sale_price
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )}
                                        </TableBody>
                                    )}
                                </Table>
                                {stock?.sibling_variants?.length === 0 && (
                                    <p className='py-4 text-center text-sm font-medium'>
                                        No data found
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* loading data state */}
                    {(isLoading || isFetching) && (
                        <div className='grid w-full gap-4'>
                            {Array.from({ length: 10 }).map((_, index) => (
                                <span
                                    key={index}
                                    className='animate-skeleton h-9 rounded-md bg-secondary'
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StockReportViewDialog;
