'use client';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/admin-card';
import { Badge } from '@/components/ui/admin-badge';
import { Skeleton } from '@/components/ui/admin-skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import Image from 'next/image';
import type { TInventory } from '@/types/admin/product';
import type { TVariantCombination } from '@/types/admin/product';
import { Package, ShoppingCart } from 'lucide-react';
import { Dispatch, FC, SetStateAction } from 'react';
import { BarcodeImage } from './barcode-image';
import { getImgFullUrl } from '@/lib/admin-utils';

type TProps = {
    data: any;
    isLoading: boolean;
    setCurrentPage: Dispatch<SetStateAction<number>>;
    currentPage: number;
};

const ProductInventoryTable: FC<TProps> = ({
    data,
    isLoading,
    setCurrentPage,
    currentPage
}) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT'
        }).format(price);
    };

    const renderVariantBadges = (variants: TVariantCombination[]) => {
        return variants?.map((variant) => (
            <div key={variant?._id} className='rounded-md bg-accent p-1'>
                <div className='mb-1 flex flex-wrap gap-1'>
                    {Object.entries(variant?.attribute_values || {}).map(
                        ([key, value]) => (
                            <Badge
                                key={`${key}-${value}`}
                                variant='outline'
                                className='bg-accent text-xs'
                            >
                                {value}
                            </Badge>
                        )
                    )}
                </div>
                <div className='text-muted-foregrounds text-xs'>
                    <span className='font-medium'></span> {variant?.sku}
                </div>
                <div className='text-xs text-muted-foreground'>
                    <span className='font-medium'>Stock:</span>{' '}
                    {/* {variant?.available_quantity || 0} */}
                </div>
                <div className='px-2'>
                    {variant?.barcode && (
                        <BarcodeImage barcode={variant.barcode} />
                    )}
                </div>
            </div>
        ));
    };

    const getTotalQuantity = (variants: TVariantCombination[]) => {
        // return (
        //  variants?.reduce(
        //   (total, variant) => total + (variant?.available_quantity || 0),
        //   0,
        //  ) || 0
        // );
        console.log(variants, 'variants');

        return 0;
    };

    const getPriceRange = (variants: TVariantCombination[]) => {
        if (!variants || variants.length === 0) {
            return { regular: formatPrice(0), sale: formatPrice(0) };
        }

        const regularPrices = variants.map((v) => v?.regular_price || 0);
        const salePrices = variants.map((v) => v?.sale_price || 0);

        const minRegular = Math.min(...regularPrices);
        const maxRegular = Math.max(...regularPrices);
        const minSale = Math.min(...salePrices);
        const maxSale = Math.max(...salePrices);

        return {
            regular:
                minRegular === maxRegular
                    ? formatPrice(minRegular)
                    : `${formatPrice(minRegular)} - ${formatPrice(maxRegular)}`,
            sale:
                minSale === maxSale
                    ? formatPrice(minSale)
                    : `${formatPrice(minSale)} - ${formatPrice(maxSale)}`
        };
    };

    const renderPaginationItems = () => {
        const totalPages = data?.totalPages || 1;
        const items = [];

        // Previous button
        items.push(
            <PaginationItem key='prev'>
                <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                        currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                    }
                />
            </PaginationItem>
        );

        // Page numbers
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => setCurrentPage(i)}
                        isActive={currentPage === i}
                        className='cursor-pointer'
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (totalPages > 5) {
            items.push(
                <PaginationItem key='ellipsis'>
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Next button
        items.push(
            <PaginationItem key='next'>
                <PaginationNext
                    onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                        currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                    }
                />
            </PaginationItem>
        );

        return items;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-[#023344]'>
                    <Package className='h-5 w-5' />
                    Product Inventory
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className='space-y-4'>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className='flex items-center space-x-4 rounded-lg border p-4'
                            >
                                <Skeleton className='h-16 w-16 rounded' />
                                <div className='flex-1 space-y-2'>
                                    <Skeleton className='h-4 w-48' />
                                    <Skeleton className='h-3 w-32' />
                                    <Skeleton className='h-3 w-24' />
                                </div>
                                <div className='space-y-2'>
                                    <Skeleton className='h-8 w-24' />
                                    <Skeleton className='h-8 w-24' />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : data?.inventory && data?.inventory?.length > 0 ? (
                    <>
                        <div className='overflow-x-auto'>
                            <Table className='table-auto'>
                                <TableHeader>
                                    <TableRow className='bg-accent'>
                                        <TableHead className='w-20'>
                                            Image
                                        </TableHead>
                                        <TableHead className='min-w-48'>
                                            Product Name
                                        </TableHead>
                                        <TableHead className='min-w-64'>
                                            Variants
                                        </TableHead>
                                        <TableHead className='text-center'>
                                            Total Qty
                                        </TableHead>
                                        <TableHead className='text-center'>
                                            Regular Price
                                        </TableHead>
                                        <TableHead className='text-center'>
                                            Sale Price
                                        </TableHead>
                                        {/* <TableHead className="text-center w-48">Actions</TableHead> */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.inventory?.map(
                                        (inventory: TInventory) => {
                                            const priceRange = getPriceRange(
                                                inventory?.variants
                                            );
                                            const totalQty = getTotalQuantity(
                                                inventory?.variants
                                            );

                                            return (
                                                <TableRow
                                                    key={inventory?._id}
                                                    className='hover:bg-accent'
                                                >
                                                    <TableCell>
                                                        <div className='relative size-20 overflow-hidden rounded-lg bg-accent'>
                                                            <Image
                                                                src={
                                                                    getImgFullUrl(
                                                                        inventory
                                                                            ?.product
                                                                            ?.thumbnail
                                                                    ) ||
                                                                    '/placeholder.svg'
                                                                }
                                                                alt={
                                                                    inventory
                                                                        ?.product
                                                                        ?.name ||
                                                                    'Product'
                                                                }
                                                                fill
                                                                className='object-cover'
                                                                sizes='100px'
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className='max-w-[250px]'>
                                                        <div className='w-full'>
                                                            <h3 className='mb-1 font-medium text-primary'>
                                                                {
                                                                    inventory
                                                                        ?.product
                                                                        ?.name
                                                                }
                                                            </h3>
                                                            <p className='line-clamp-3 text-sm text-muted-foreground'>
                                                                {inventory?.product?.description?.replace(
                                                                    /<[^>]*>/g,
                                                                    ''
                                                                ) ||
                                                                    'No description'}
                                                            </p>
                                                            <div className='mt-2 flex items-center gap-2'>
                                                                <Badge
                                                                    variant='outline'
                                                                    className='text-xs'
                                                                >
                                                                    <ShoppingCart />{' '}
                                                                    Sold:{' '}
                                                                    {inventory
                                                                        ?.product
                                                                        ?.total_sold ||
                                                                        0}
                                                                </Badge>

                                                                <Badge
                                                                    variant='outline'
                                                                    className='text-xs'
                                                                >
                                                                    ⭐{' '}
                                                                    {inventory
                                                                        ?.product
                                                                        ?.total_rating ||
                                                                        0.0}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='grid gap-2 xl:grid-cols-2'>
                                                            {renderVariantBadges(
                                                                inventory?.variants
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className='text-center'>
                                                        <div className='flex flex-col items-center'>
                                                            <span className='text-lg font-semibold text-primary'>
                                                                {totalQty}
                                                            </span>
                                                            <span className='text-xs text-gray-500'>
                                                                units
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className='text-center'>
                                                        <div className='flex flex-col items-center'>
                                                            <span className='font-medium text-gray-700'>
                                                                {
                                                                    priceRange?.regular
                                                                }
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className='text-center'>
                                                        <div className='flex flex-col items-center'>
                                                            <span className='font-medium text-green-600'>
                                                                {
                                                                    priceRange?.sale
                                                                }
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {(data?.totalPages || 0) > 1 && (
                            <div className='mt-6 flex justify-center'>
                                <Pagination>
                                    <PaginationContent>
                                        {renderPaginationItems()}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                ) : (
                    <div className='py-12 text-center'>
                        <Package className='mx-auto mb-4 h-16 w-16 text-gray-300' />
                        <h3 className='mb-2 text-lg font-medium text-gray-900'>
                            No Inventory Found
                        </h3>
                        <p className='text-gray-500'>
                            This warehouse/outlet doesn&apos;t have any products
                            in inventory yet.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductInventoryTable;
