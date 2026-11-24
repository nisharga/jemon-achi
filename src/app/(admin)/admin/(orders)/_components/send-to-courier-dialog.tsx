'use client';

import { Button } from '@/components/ui/admin-button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/admin-utils';
import {
    useGetSuggestedOutletProductsQuery,
    useUpdatOrderStatusMutation
} from '@/redux/admin/api/order-api';
import { OrderStatus } from '@/types/admin/order';
import { Label } from '@radix-ui/react-label';
import { CheckCircle, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type DialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    order_id: string;
};

const SendToCourierDialog = ({ open, setOpen, order_id }: DialogProps) => {
    // === selected outlet states ===
    const [selectedOutletId, setSelectedOutletId] = useState('');

    // === suggested outlets api data ===
    const { data, isLoading, isFetching } = useGetSuggestedOutletProductsQuery({
        order_id
    });
    const outlets = data?.data;

    // === transfer to courier api mutation hook ===
    const [transferToCourier, { isLoading: isTransferOrderToCouriarLoading }] =
        useUpdatOrderStatusMutation();

    // === handle send to courier ===
    const handleSendToCourier = async () => {
        const payload = {
            status: OrderStatus.IN_REVIEW,
            business_location: selectedOutletId
        };

        try {
            const res: any = await transferToCourier({
                order_id,
                payload
            });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Order sent to courier!');
            } else if (res?.error?.data?.message) {
                toast.error(res?.error?.data?.message);
            }
        } catch (error: any) {
            console.error('SEND TO COUTIER ERROR: ', error);
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

    // === set selected id to "" when dialog is closed ===
    useEffect(() => {
        if (!open) {
            setSelectedOutletId('');
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='overflow-hidden p-0 sm:max-w-md lg:max-w-xl'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle className='text-lg font-semibold'>
                        Select Location to send Courier
                    </DialogTitle>
                    <DialogDescription className='sr-only'>
                        Dialog Description for Meta
                    </DialogDescription>
                </DialogHeader>

                <div className='flex flex-col gap-4 px-6'>
                    <Label className='flex flex-wrap text-muted-foreground'>
                        Select Warehouse
                    </Label>
                </div>

                {/* outlets */}
                <div className='h-fit max-h-[70vh] space-y-4 overflow-y-auto px-6'>
                    {outlets?.map((item: any, index: number) => {
                        // product variant
                        const variant = Object.entries(
                            item?.variant?.attribute_values || {}
                        )
                            ?.map((item) => item?.[1])
                            .join(' - ');

                        // product sku
                        const sku = item?.variant?.sku;

                        return (
                            <div
                                onClick={() =>
                                    setSelectedOutletId(
                                        item?.business_location?._id
                                    )
                                }
                                key={index}
                                className={cn(
                                    'relative space-y-2 rounded-md border-l-8 bg-background p-2 shadow-sm hover:cursor-pointer',
                                    {
                                        'border-primary bg-primary/5':
                                            selectedOutletId ===
                                            item?.business_location?._id
                                    }
                                )}
                            >
                                {selectedOutletId ===
                                    item?.business_location?._id && (
                                    <CheckCircle className='absolute top-2 right-2 size-5 text-primary' />
                                )}

                                <div className='space-y-1'>
                                    <p>
                                        {item?.business_location?._id &&
                                            `${item?.business_location?.name}`}
                                    </p>

                                    <div>
                                        <div className='text-xs font-medium'>
                                            <p>
                                                {item?.product?.name} - (
                                                {variant})
                                            </p>
                                            <p className='text-muted-foreground'>
                                                SKU: ({sku})
                                            </p>
                                            <p className='text-muted-foreground'>
                                                Available Qty: (
                                                {item?.available_quantity})
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* loading state */}
                    {(isLoading || isFetching) && (
                        <div className='mx-auto w-fit py-6'>
                            <Loader className='size-4 animate-spin' />
                        </div>
                    )}
                </div>

                <div className='grid w-full grid-cols-2 gap-4 border-t bg-muted/50 p-6'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <Button
                        disabled={
                            isTransferOrderToCouriarLoading || !selectedOutletId
                        }
                        onClick={handleSendToCourier}
                    >
                        {isTransferOrderToCouriarLoading ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Send to Courier
                            </>
                        ) : (
                            `Send to Courier`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SendToCourierDialog;
