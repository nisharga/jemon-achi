'use client';

import { Button } from '@/admin/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/admin/components/ui/dialog';
import { Input } from '@/admin/components/ui/input';
import { useUpdatOrderStatusMutation } from '@/admin/redux/api-queries/order-api';
import { Label } from '@radix-ui/react-label';
import { Loader } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type DialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    order_id: string;
};

const CancelOrderDialog = ({ open, setOpen, order_id }: DialogProps) => {
    // === confirmation state ===
    const [confirmation, setConfirmation] = useState('');
    const confirmationText = `CANCELLED`;

    // === cancel order api mutation hook ===
    const [cancelOrder, { isLoading }] = useUpdatOrderStatusMutation();

    // === handle cancel product ===
    const handleCancelOrder = async () => {
        const payload = {
            status: 'CANCELLED'
        };
        try {
            const res: any = await cancelOrder({ order_id, payload });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Order cancelled!');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to cancel order!'
                );
            }
        } catch (error: any) {
            console.error('CANCELLED ORDER ERROR: ', error);
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='overflow-hidden p-0 sm:max-w-sm'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle>Cancel Order</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Dialog Description for Meta
                    </DialogDescription>
                </DialogHeader>

                <div className='flex flex-col gap-4 px-6'>
                    <Label className='flex flex-wrap text-muted-foreground'>
                        Are you sure you want to cancel this order?
                    </Label>
                    <span className='space-y-2'>
                        <p className='text-sm font-medium text-muted-foreground'>
                            Type{' '}
                            <span className='text-destructive'>
                                {confirmationText}
                            </span>{' '}
                            to cancel this order.
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
                        onClick={handleCancelOrder}
                    >
                        {isLoading ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Cancel Order
                            </>
                        ) : (
                            `Cancel Order`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CancelOrderDialog;
