'use client';

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/admin/components/ui/alert-dialog';
import { Button } from '@/admin/components/ui/button';
import { useDeleteFeaturedProductMutation } from '@/admin/redux/api-queries/featured-product-api';
import { Loader } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

type RemoveFeaturedProductDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    variantId: string;
};

const RemoveFeaturedProductDialog = ({
    open,
    setOpen,
    variantId
}: RemoveFeaturedProductDialogProps) => {
    // === remove featured product api mutation hook ===
    const [removeFeaturedProduct, { isLoading }] =
        useDeleteFeaturedProductMutation();

    // === handle remove product from featured products ===
    const handleRemoveFeaturedProduct = async () => {
        try {
            const res: any = await removeFeaturedProduct({
                variant_id: variantId
            });
            if (res?.data?.success) {
                toast.success('Item removed from featured products!');
                setOpen(false);
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to remove featured product!'
                );
            }
        } catch (error: any) {
            console.log('REMOVE FEATURED PRODUCT ERROR:', error);
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
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className='sm:max-w-sm'>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Remove from featured products?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                        variant='destructive'
                        disabled={isLoading}
                        onClick={handleRemoveFeaturedProduct}
                    >
                        Yes Remove
                        {isLoading && (
                            <Loader size={16} className='ml-2 animate-spin' />
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default RemoveFeaturedProductDialog;
