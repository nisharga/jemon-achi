'use client';

import { Button } from '@/admin/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { orderStatusList } from '@/admin/types/order';
import React, { useState } from 'react';
import { formatString } from './order-details';
import { useUpdatOrderStatusMutation } from '@/admin/redux/api-queries/order-api';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

const UpdateStatus = ({
    order_status,
    order_id
}: {
    order_status: string;
    order_id: string;
}) => {
    // === update order status state ===
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

    return (
        <div>
            <h3 className='w-full border-b px-4 py-4 text-lg font-medium lg:px-6'>
                Update Order Status
            </h3>
            <div className='flex items-center gap-6 p-4 lg:p-6'>
                <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                >
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select Status' />
                    </SelectTrigger>
                    <SelectContent>
                        {orderStatusList?.map((status) => (
                            <SelectItem key={status} value={status}>
                                {formatString(status)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button disabled={isLoading} onClick={handleUpdateOrderStatus}>
                    {isLoading ? (
                        <>
                            Updating..
                            <Loader className='size-4 animate-spin' />
                        </>
                    ) : (
                        `Update Status`
                    )}
                </Button>
            </div>
        </div>
    );
};

export default UpdateStatus;
