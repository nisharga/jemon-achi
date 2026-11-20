'use client';

import { Button } from '@/admin/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/admin/components/ui/dialog';
import { useDeleteCategoryMutation } from '@/admin/redux/api-queries/category-api';
import { AlertTriangle, Loader } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

type DeleteCategoryDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    categoryId: string;
    categoryName: string;
};

const DeleteCategoryDialog = ({
    open,
    setOpen,
    categoryId,
    categoryName
}: DeleteCategoryDialogProps) => {
    // === delete category api mutation hook ===
    const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();

    // === handle delete category ===
    const handleDeleteCategory = async () => {
        try {
            const res: any = await deleteCategory({ category_id: categoryId });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Category deleted successfully!');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to delete category!'
                );
            }
        } catch (error: any) {
            console.error('DELETE CATEGORY ERROR: ', error);

            // Handle error with existing products SKUs
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                toast.error(err.join('\n'));
            } else {
                // Check if error contains SKU information
                const errorMsg = error?.data?.message || error?.message || '';
                if (
                    errorMsg.includes('sku') ||
                    errorMsg.includes('SKU') ||
                    errorMsg.includes('product')
                ) {
                    toast.error(errorMsg);
                } else {
                    toast.error('Failed to delete category!');
                }
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='overflow-hidden p-0 sm:max-w-md'>
                <DialogHeader className='px-6 pt-6 pb-2'>
                    <div className='flex items-center gap-3'>
                        <div className='flex size-10 items-center justify-center rounded-full bg-destructive/10'>
                            <AlertTriangle className='size-5 text-destructive' />
                        </div>
                        <DialogTitle className='text-lg'>
                            Delete Category
                        </DialogTitle>
                    </div>
                    <DialogDescription className='pt-2 pl-13'>
                        This action cannot be undone. This will permanently
                        delete the category{' '}
                        <strong className='text-foreground'>
                            &quot;{categoryName}&quot;
                        </strong>
                        .{isLoading && ' Checking for products...'}
                    </DialogDescription>
                </DialogHeader>

                <div className='grid w-full grid-cols-2 gap-4 border-t bg-muted/50 p-6'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='destructive'
                        disabled={isLoading}
                        onClick={handleDeleteCategory}
                    >
                        {isLoading ? (
                            <>
                                Deleting...
                                <Loader className='ml-2 size-4 animate-spin' />
                            </>
                        ) : (
                            'Delete Category'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteCategoryDialog;
