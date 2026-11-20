'use client';

import { Button } from '@/admin/components/ui/button';
import { usePublishProductMutation } from '@/admin/redux/api-queries/product-api';
import { Loader } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

const ProductPublishedStatus = ({
    isPublished,
    productId
}: {
    isPublished: boolean;
    productId: string;
}) => {
    // === publish product api mutation hook ===
    const [publishProduct, { isLoading }] = usePublishProductMutation();

    // === handle publish product ===
    const handlePublishProduct = async (value: boolean) => {
        const payload = {
            is_published: value
        };
        try {
            const res = await publishProduct({
                product_id: productId,
                payload
            });
            if (res?.data?.success) {
                toast.success('Product live status changed!');
            } else {
                toast.error('Failed to change live status! Try again.');
            }
        } catch (error: any) {
            console.log('PRODUCT PUBLISH TOGGLE ERROR:', error);
            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );

            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            }
        }
    };

    return (
        <>
            {isPublished ? (
                <div className='flex flex-col gap-1'>
                    <Button
                        size='sm'
                        variant='green-outline'
                        className='mx-auto h-6 w-fit'
                    >
                        Published
                    </Button>
                    <Button
                        size='sm'
                        variant='link'
                        disabled={isLoading}
                        onClick={() => handlePublishProduct(false)}
                        className='text-[10px] underline'
                    >
                        Make it Unpublish
                        {isLoading && (
                            <Loader size={12} className='ml-1 animate-spin' />
                        )}
                    </Button>
                </div>
            ) : (
                <div className='flex flex-col gap-1'>
                    <Button
                        size='sm'
                        variant='red-outline'
                        className='mx-auto h-6 w-fit'
                    >
                        Unpublished
                    </Button>
                    <Button
                        size='sm'
                        variant='link'
                        disabled={isLoading}
                        onClick={() => handlePublishProduct(true)}
                        className='text-[10px] underline'
                    >
                        Make it Publish
                        {isLoading && (
                            <Loader size={12} className='ml-1 animate-spin' />
                        )}
                    </Button>
                </div>
            )}
        </>
    );
};

export default ProductPublishedStatus;
