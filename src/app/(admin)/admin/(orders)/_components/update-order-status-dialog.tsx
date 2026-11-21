'use client';

import { Button } from '@/components/ui/admin-button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/admin-label';
import { useUpdatOrderStatusMutation } from '@/redux/api-queries/order-api';
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { OrderStatus } from '@/types/order';

type DialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    order_id: string;
    order_status: string;
};

function formatString(inputString: string) {
    if (!inputString || typeof inputString !== 'string') {
        return '';
    }
    const spacedString = inputString.replace(/_/g, ' ').toLowerCase();

    const titleCaseString = spacedString
        .split(' ')
        .map((word) => {
            if (word.length === 0) {
                return '';
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

    return titleCaseString;
}

const updateAbleOrderStatusList = [
    OrderStatus.PLACED,
    OrderStatus.INCOMPLETE,
    OrderStatus.NO_RESPONSE,
    OrderStatus.HANDED_OVER_TO_COURIER,
    OrderStatus.CANCELLED,
    OrderStatus.PRE_ORDER
];

const UpdateOrderStatusDialog = ({
    open,
    setOpen,
    order_id,
    order_status
}: DialogProps) => {
    // === update order status and note state ===
    const [selectedStatus, setSelectedStatus] = useState(order_status);

    // === update order status api mutation hook ===
    const [updateOrderStatus, { isLoading }] = useUpdatOrderStatusMutation();
    // === handle update order status ===
    const handleUpdateOrderStatus = async () => {
        const payload = {
            status: selectedStatus
        };

        try {
            const res: any = await updateOrderStatus({ order_id, payload });
            if (res?.data?.success) {
                toast.success('Order status updated!');
                setOpen(false);
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to update order status!'
                );
            }
        } catch (error: any) {
            console.error('UPDATE ORDER STATUS ERROR: ', error);
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

    useEffect(() => {
        if (!open) {
            setSelectedStatus(order_status);
        }
    }, [open, order_status]);

    return (
        <Dialog open={open} onOpenChange={setOpen} modal>
            <DialogContent className='overflow-hidden p-0 sm:max-w-sm'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle>Update Status</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Dialog Description for Meta
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 px-6'>
                    <div className='space-y-2'>
                        <Label>Select Order Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                            defaultValue={order_status}
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select Status' />
                            </SelectTrigger>
                            <SelectContent>
                                {updateAbleOrderStatusList?.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {formatString(status)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className='grid w-full grid-cols-2 gap-4 border-t bg-muted/50 p-6'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <Button
                        disabled={isLoading || order_status === selectedStatus}
                        onClick={handleUpdateOrderStatus}
                    >
                        {isLoading ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Updating Status
                            </>
                        ) : (
                            `Update Status`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateOrderStatusDialog;
