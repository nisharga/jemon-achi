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
    useAssignOrderToOutletMutation,
    useGetSuggestedOutletProductsQuery
} from '@/redux/api-queries/order-api';
import { CheckCircle, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type DialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    order_id: string;
};

const AssignOrderDialog = ({ open, setOpen, order_id }: DialogProps) => {
    // === selected outlet states ===
    const [selectedOutletId, setSelectedOutletId] = useState('');

    // === suggested outlets api data ===
    const { data, isLoading, isFetching } = useGetSuggestedOutletProductsQuery({
        order_id
    });
    const outlets = data?.data;

    // === assign order to outlet api mutation hook ===
    const [assignOrderToOutlet, { isLoading: isAssignOrderToOutletLoading }] =
        useAssignOrderToOutletMutation();

    // === handle assign order to outlet ===
    const handleAssignOrderToOutlet = async () => {
        const payload = {
            order: order_id,
            business_location: selectedOutletId
        };

        try {
            const res: any = await assignOrderToOutlet({ payload });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Order assigned!');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to assign order!'
                );
            }
        } catch (error: any) {
            console.error('ASSIGN ORDER ERROR: ', error);
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
                    <DialogTitle>Select Outlet or Warehouse</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Dialog Description for Meta
                    </DialogDescription>
                </DialogHeader>

                {/* outlets */}
                <div className='space-y-4 px-6'>
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
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssignOrderToOutlet}
                        disabled={
                            isAssignOrderToOutletLoading ||
                            isLoading ||
                            !selectedOutletId
                        }
                    >
                        {isAssignOrderToOutletLoading ? (
                            <>
                                Assinging..
                                <Loader className='size-4 animate-spin' />
                            </>
                        ) : (
                            `Confirm Assign`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AssignOrderDialog;
