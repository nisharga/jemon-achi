'use client';

import { Button } from '@/components/ui/admin-button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    useDeleteSubCategoryMutation,
    useDeleteSubSubCategoryMutation
} from '@/redux/admin/api/subcategory-api';
import { AlertTriangle, Loader } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

type DeleteSubCategoryDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    subCategoryId: string;
    subCategoryName: string;
    isSubSubcategory?: boolean;
};

const DeleteSubCategoryDialog = ({
    open,
    setOpen,
    subCategoryId,
    subCategoryName,
    isSubSubcategory = false
}: DeleteSubCategoryDialogProps) => {
    // === delete subcategory api mutation hook ===
    const [deleteSubCategory, { isLoading: isDeletingSubCategory }] =
        useDeleteSubCategoryMutation();
    const [deleteSubSubCategory, { isLoading: isDeletingSubSubCategory }] =
        useDeleteSubSubCategoryMutation();

    const isLoading = isDeletingSubCategory || isDeletingSubSubCategory;

    // === handle delete subcategory ===
    const handleDeleteSubCategory = async () => {
        try {
            let res: any;
            if (isSubSubcategory) {
                res = await deleteSubSubCategory({
                    sub_subcategory_id: subCategoryId
                });
            } else {
                res = await deleteSubCategory({
                    sub_category_id: subCategoryId
                });
            }

            if (res?.data?.success) {
                setOpen(false);
                toast.success(
                    isSubSubcategory
                        ? 'Sub-subcategory deleted successfully!'
                        : 'Subcategory deleted successfully!'
                );
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to delete subcategory!'
                );
            }
        } catch (error: any) {
            console.error('DELETE SUBCATEGORY ERROR: ', error);

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
                    toast.error('Failed to delete subcategory!');
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
                            {isSubSubcategory
                                ? 'Delete Sub-subcategory'
                                : 'Delete Subcategory'}
                        </DialogTitle>
                    </div>
                    <DialogDescription className='pt-2 pl-13'>
                        This action cannot be undone. This will permanently
                        delete the{' '}
                        {isSubSubcategory ? 'sub-subcategory' : 'subcategory'}{' '}
                        <strong className='text-foreground'>
                            &quot;{subCategoryName}&quot;
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
                        onClick={handleDeleteSubCategory}
                    >
                        {isLoading ? (
                            <>
                                Deleting...
                                <Loader className='ml-2 size-4 animate-spin' />
                            </>
                        ) : (
                            `Delete ${isSubSubcategory ? 'Sub-subcategory' : 'Subcategory'}`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteSubCategoryDialog;
