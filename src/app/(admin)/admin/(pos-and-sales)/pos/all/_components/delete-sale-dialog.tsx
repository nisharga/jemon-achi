'use client';

import { Button } from '@/components/ui/admin-button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/admin-input';
import { useDeletePosSaleMutation } from '@/redux/api-queries/pos-sale-api';
import { Label } from '@radix-ui/react-label';
import { Loader } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type DialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    pos_sale_id: string;
};

const DeleteSaleDialog = ({ open, setOpen, pos_sale_id }: DialogProps) => {
    // === confirmation state ===
    const [confirmation, setConfirmation] = useState('');
    const confirmationText = `DELETE`;

    // === delete sale api mutation hook ===
    const [deleteSale, { isLoading }] = useDeletePosSaleMutation();

    // === handle delete sale ===
    const handleDeleteSale = async () => {
        try {
            const res: any = await deleteSale({ pos_sale_id });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Pos sale deleted!');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to delete sale!'
                );
            }
        } catch (error: any) {
            console.error('DELETE SALE ERROR: ', error);
            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            } else {
                toast.error('Somthing went wrong!');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='overflow-hidden p-0 sm:max-w-sm'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle>Delete Sale</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Dialog Description for Meta
                    </DialogDescription>
                </DialogHeader>

                <div className='flex flex-col gap-4 px-6'>
                    <Label className='flex flex-wrap text-muted-foreground'>
                        Are you sure you want to delete this sale?
                    </Label>
                    <span className='space-y-2'>
                        <p className='text-sm font-medium text-muted-foreground'>
                            Type{' '}
                            <span className='text-destructive'>
                                {confirmationText}
                            </span>{' '}
                            to delete this order.
                        </p>
                        <Input
                            onChange={(e) => setConfirmation(e.target.value)}
                            placeholder={confirmationText}
                        />
                    </span>
                </div>
                <div className='grid w-full grid-cols-2 gap-4 border-t bg-muted/50 p-6'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <Button
                        variant='destructive'
                        disabled={
                            confirmation !== confirmationText || isLoading
                        }
                        onClick={handleDeleteSale}
                    >
                        {isLoading ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Deleting..
                            </>
                        ) : (
                            `Delete Sale`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteSaleDialog;
