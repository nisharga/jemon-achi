'use client';
import React from 'react';
import { Input } from '@/components/ui/admin-input';
import { Scan } from 'lucide-react';
import { VariantItem } from '@/types/pos';
import { Button } from '@/components/ui/admin-button';
import { Label } from '@/components/ui/admin-label';

interface Props {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    results: any[];
    isLoading: boolean;
    onAddVariant: (item: VariantItem) => void;
    onScanBarcode: (barcode: string) => void;
    businessLocation: string;
}

export const ProductSelector: React.FC<Props> = ({
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    onAddVariant,
    onScanBarcode,
    businessLocation
}) => {
    // Flatten each inventory item into its variants
    // const listItems: VariantItem[] = results.flatMap((item) =>
    //   item?.variants?.map((variant) => ({
    //     productId: item?.product?._id,
    //     productName: item?.product?.name,
    //     thumbnail: item?.product?.thumbnail,
    //     variant,
    //   }))
    // );

    const listItems = results?.map((item) => {
        return {
            productId: item?.product?._id,
            productName: item?.product?.name,
            thumbnail: item?.product?.thumbnail,
            variant: {
                ...item?.variant,
                availableQuantity: item?.available_quantity
            }
        };
    });

    return (
        <div className='relative space-y-2'>
            <Label htmlFor='product-search'>Add Product</Label>
            <div className='flex items-center'>
                <Input
                    id='product-search'
                    placeholder='Scan barcode or search by product name or sku or slug'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onScanBarcode(searchTerm);
                        }
                    }}
                    disabled={!businessLocation}
                />
                <Button
                    variant='outline'
                    type='button'
                    size='icon'
                    className='ml-2'
                    onClick={() => onScanBarcode(searchTerm)}
                    title='Search'
                >
                    <Scan size={20} />
                </Button>
            </div>

            {searchTerm && (
                <div className='absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border bg-white shadow-lg'>
                    {isLoading && (
                        <div className='p-3 text-sm text-muted-foreground'>
                            Searching...
                        </div>
                    )}
                    {!isLoading && listItems?.length === 0 && (
                        <div className='p-3 text-sm text-muted-foreground'>
                            No variants found.
                        </div>
                    )}

                    {!isLoading &&
                        listItems?.map((it, idx) => {
                            // product variant
                            const variant = Object.entries(
                                it?.variant?.attribute_values || {}
                            )
                                ?.map((i) => i?.[1])
                                .join('-');

                            return (
                                <div
                                    key={`${it?.variant?.sku}-${idx}`}
                                    className='flex cursor-pointer items-center border-b p-3 last:border-b-0 hover:bg-gray-100'
                                    onClick={() => onAddVariant(it)}
                                >
                                    <div>
                                        <div className='font-medium text-gray-800'>
                                            {it?.productName} ({variant})
                                        </div>
                                        <div className='text-sm text-muted-foreground'>
                                            SKU: {it?.variant?.sku} | Sale
                                            Price: {it?.variant?.sale_price} |
                                            Reagular Price:{' '}
                                            {it?.variant?.regular_price} |
                                            Stock:{' '}
                                            {it?.variant?.availableQuantity}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
};
