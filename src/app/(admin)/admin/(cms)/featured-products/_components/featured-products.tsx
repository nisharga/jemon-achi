'use client';

import { Button } from '@/components/ui/admin-button';
import { TProduct } from '@/types/product';
import { Trash } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import RemoveFeaturedProductDialog from './remove-featured-product-dialog';
import { getImgFullUrl } from '@/lib/admin-utils';

const FeaturedProducts = ({ featuredProducts }: { featuredProducts: any }) => {
    // === remove dialog state ===
    const [open, setOpen] = useState(false);
    const [variantId, setVariantId] = useState('');

    return (
        <>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {featuredProducts?.slice(0, 3)?.map((p: any) => {
                    const product: TProduct = p?.product;
                    const variant = p?.variant;

                    return (
                        <div
                            key={product?._id}
                            className='group relative space-y-4 overflow-hidden rounded-lg border shadow-md lg:space-y-6'
                        >
                            <div className='max-h-[250px] overflow-hidden'>
                                <Image
                                    src={getImgFullUrl(product?.thumbnail)}
                                    alt={product?.name}
                                    height={720}
                                    width={1080}
                                    className='aspect-video h-full object-cover transition-transform group-hover:scale-110'
                                />
                            </div>
                            <div className='px-4 lg:px-6'>
                                <p className='font-medium'>{product?.name}</p>
                                <p className='font-medium text-muted-foreground'>
                                    Total Sold: {product?.total_sold}
                                </p>
                            </div>

                            {/* remove button */}
                            <Button
                                size='icon'
                                variant='destructive'
                                className='absolute top-2 right-2 size-7'
                                onClick={() => {
                                    setOpen(true);
                                    setVariantId(variant?._id);
                                }}
                            >
                                <Trash />
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* remove featured product dialog */}
            <RemoveFeaturedProductDialog
                open={open}
                setOpen={setOpen}
                variantId={variantId}
            />
        </>
    );
};

export default FeaturedProducts;
