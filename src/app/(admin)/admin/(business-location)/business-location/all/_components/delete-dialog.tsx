'use client';

import { Button } from '@/admin/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/admin/components/ui/dialog';
import { useDeleteBusinessLocationMutation } from '@/admin/redux/api-queries/business-location-api';
import { Loader } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

type DeleteProductDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    productId: string;
    productName: string;
};

const DeleteBusinessDialog = ({
    open,
    setOpen,
    productId,
    productName
}: DeleteProductDialogProps) => {
    // === delete product api mutation hook ===
    const [deleteLocation, { isLoading }] = useDeleteBusinessLocationMutation();

    // === handle delete product ===
    const handleDeleteProduct = async () => {
        try {
            const res: any = await deleteLocation({ id: productId });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Location deleted successfully!');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to delete Location!'
                );
            }
        } catch (error: any) {
            console.error('DELETE Location ERROR: ', error);
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                toast.error(err.join('\n'));
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='overflow-hidden p-0 sm:max-w-sm'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle>Delete Location</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. Are you sure you want to
                        delete{' '}
                        <strong className='text-foreground'>
                            {productName}
                        </strong>
                        ?
                    </DialogDescription>
                </DialogHeader>

                <div className='grid w-full grid-cols-2 gap-4 border-t bg-muted/50 p-6'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='destructive'
                        disabled={isLoading}
                        onClick={handleDeleteProduct}
                    >
                        {isLoading ? (
                            <>
                                Deleting..
                                <Loader className='ml-2 size-4 animate-spin' />
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteBusinessDialog;
