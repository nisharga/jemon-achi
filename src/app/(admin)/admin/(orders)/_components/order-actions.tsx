'use client';

import { Button } from '@/admin/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/admin/components/ui/dropdown-menu';
import { OrderStatus, TOrder } from '@/admin/types/order';
import { Ellipsis } from 'lucide-react';
import Link from 'next/link';
import React, { ReactElement, useState, useMemo } from 'react';
import CancelOrderDialog from './cancel-order-dialog';
import AssignOrderDialog from './assign-order-dialog';
import DeleteOrderDialog from './delete-order-dialog';
import SendToCourierDialog from './send-to-courier-dialog';
import UpdateOrderStatusDialog from './update-order-status-dialog';
import UpdateOrderNoteDialog from './update-order-note-dialog';
import ReturnOrderDialog from './return-order-dialog';
import {
    useMarkAsDeliveredMutation,
    useMarkAsPendingReturnMutation
} from '@/admin/redux/api-queries/order-api';
import { toast } from 'sonner';

const OrderActions = ({
    order,
    triggerBtn,
    triggerBtnVariant
}: {
    order: TOrder;
    triggerBtn?: ReactElement;
    triggerBtnVariant?:
        'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
}) => {
    // === delete order dialog state ===
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    // === cancel order dialog state ===
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    // === assign order dialog state ===
    const [openAssignOrderDialog, setOpenAssignOrderDialog] = useState(false);
    // === send to courier dialog state ===
    const [openSendToCourierDialog, setOpenSendToCourierDialog] =
        useState(false);
    // === update order status dialog state ===
    const [openOrderStatusDialog, setOpenOrderStatusDialog] = useState(false);
    // === update order note dialog state ===
    const [openOrderNoteDialog, setOpenOrderNoteDialog] = useState(false);
    // === return order dialog state ===
    const [openReturnOrderDialog, setOpenReturnOrderDialog] = useState(false);

    // === mutations for dedicated status updates ===
    const [markAsDelivered, { isLoading: isMarkingDelivered }] =
        useMarkAsDeliveredMutation();
    const [markAsPendingReturn, { isLoading: isMarkingPendingReturn }] =
        useMarkAsPendingReturnMutation();

    // === Validation helper functions ===
    const invalidStatusesForReturn = useMemo(
        () => [
            OrderStatus.PLACED,
            OrderStatus.CANCELLED,
            OrderStatus.FAILED,
            OrderStatus.INCOMPLETE,
            OrderStatus.NO_RESPONSE,
            OrderStatus.PRE_ORDER
        ],
        []
    );

    const canMarkAsReturned = useMemo(() => {
        return (
            order?.status !== OrderStatus.RETURNED &&
            !invalidStatusesForReturn.includes(order?.status as OrderStatus)
        );
    }, [order?.status, invalidStatusesForReturn]);

    const canMarkAsPendingReturn = useMemo(() => {
        return (
            order?.status !== OrderStatus.PENDING_RETURN &&
            order?.status !== OrderStatus.RETURNED &&
            !invalidStatusesForReturn.includes(order?.status as OrderStatus)
        );
    }, [order?.status, invalidStatusesForReturn]);

    // === handlers for dedicated status updates ===
    const handleMarkAsDelivered = async () => {
        try {
            await markAsDelivered({ order_id: order?._id as string }).unwrap();
            toast.success('Order marked as delivered successfully');
        } catch (error: any) {
            toast.error(
                error?.data?.message || 'Failed to mark order as delivered'
            );
        }
    };

    const handleMarkAsPendingReturn = async () => {
        try {
            await markAsPendingReturn({
                order_id: order?._id as string
            }).unwrap();
            toast.success('Order marked as pending return successfully');
        } catch (error: any) {
            toast.error(
                error?.data?.message || 'Failed to mark order as pending return'
            );
        }
    };

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {triggerBtn ? (
                        <div>{triggerBtn}</div>
                    ) : (
                        <Button
                            size='icon'
                            variant={
                                triggerBtnVariant
                                    ? triggerBtnVariant
                                    : 'outline'
                            }
                        >
                            <Ellipsis />
                        </Button>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='min-w-52'>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/order-details/${order?._id}`}>
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/orders/edit/${order?._id}`}>
                            Edit Order
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setOpenOrderStatusDialog(true);
                        }}
                    >
                        Update Status
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setOpenOrderNoteDialog(true);
                        }}
                    >
                        Update Note
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* ==================== Dedicated Status Actions ==================== */}

                    {/* Mark as Delivered - Only show if NOT already delivered */}
                    {order?.status !== OrderStatus.DELIVERED && (
                        <DropdownMenuItem
                            onClick={handleMarkAsDelivered}
                            disabled={isMarkingDelivered}
                            className='text-green-600 focus:text-green-600'
                        >
                            {isMarkingDelivered
                                ? 'Marking as Delivered...'
                                : 'Mark as Delivered'}
                        </DropdownMenuItem>
                    )}

                    {/* Mark as Returned - Only show if NOT already returned AND status allows return */}
                    {/* {canMarkAsReturned && (
      <DropdownMenuItem
       onClick={handleMarkAsReturned}
       disabled={isMarkingReturned}
       className='text-red-600 focus:text-red-600'>
       {isMarkingReturned ? "Marking as Returned..." : "Mark as Returned"}
      </DropdownMenuItem>
     )} */}
                    {canMarkAsReturned && (
                        <DropdownMenuItem
                            onClick={() => {
                                setOpenReturnOrderDialog(true);
                            }}
                            className='text-red-600'
                        >
                            Return Order
                        </DropdownMenuItem>
                    )}

                    {/* Mark as Pending Return - Only show if NOT already pending return/returned AND status allows return */}
                    {canMarkAsPendingReturn && (
                        <DropdownMenuItem
                            onClick={handleMarkAsPendingReturn}
                            disabled={isMarkingPendingReturn}
                            className='text-orange-600 focus:text-orange-600'
                        >
                            {isMarkingPendingReturn
                                ? 'Marking as Pending Return...'
                                : 'Mark as Pending Return'}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    {/* ===================================================================== */}

                    {/* {!order?.is_assigned_to_business_location &&
            order?.status !== OrderStatus.INCOMPLETE &&
            order?.status !== "FAILED" && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    setOpenAssignOrderDialog(true);
                  }}
                >
                  Assign to Outlet
                </DropdownMenuItem>
              </>
            )} */}

                    {!order?.is_assigned_to_business_location &&
                        (order?.status === OrderStatus.PLACED ||
                            order?.status === OrderStatus.NO_RESPONSE ||
                            order?.status === OrderStatus.PRE_ORDER ||
                            order?.status === OrderStatus.ACCEPTED) && (
                            <>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setOpenSendToCourierDialog(true);
                                    }}
                                >
                                    Send to Courier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}

                    {order?.status !== OrderStatus.INCOMPLETE &&
                        order?.status !== 'FAILED' && (
                            <DropdownMenuItem
                                variant='destructive'
                                onClick={() => {
                                    setOpenCancelDialog(true);
                                }}
                            >
                                Cancel Order
                            </DropdownMenuItem>
                        )}

                    {(order?.status === OrderStatus.INCOMPLETE ||
                        order?.status === 'FAILED') && (
                        <DropdownMenuItem
                            variant='destructive'
                            onClick={() => {
                                setOpenDeleteDialog(true);
                            }}
                        >
                            Delete Order
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* send to courier dialog */}
            <SendToCourierDialog
                open={openSendToCourierDialog}
                setOpen={setOpenSendToCourierDialog}
                order_id={order?._id as string}
            />
            {/* delete order dialog */}
            <DeleteOrderDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                order_id={order?._id as string}
            />
            {/* cancel order dialog */}
            <CancelOrderDialog
                open={openCancelDialog}
                setOpen={setOpenCancelDialog}
                order_id={order?._id as string}
            />
            {/* assign order dialog */}
            <AssignOrderDialog
                open={openAssignOrderDialog}
                setOpen={setOpenAssignOrderDialog}
                order_id={order?._id as string}
            />
            {/*  update order status dialog */}
            <UpdateOrderStatusDialog
                open={openOrderStatusDialog}
                setOpen={setOpenOrderStatusDialog}
                order_id={order?._id as string}
                order_status={order?.status as string}
            />
            {/*  update order note dialog */}
            <UpdateOrderNoteDialog
                open={openOrderNoteDialog}
                setOpen={setOpenOrderNoteDialog}
                order_id={order?._id as string}
                notes={order?.admin_notes}
            />
            {/*  return order dialog */}
            <ReturnOrderDialog
                open={openReturnOrderDialog}
                setOpen={setOpenReturnOrderDialog}
                order={order}
            />
        </>
    );
};

export default OrderActions;
