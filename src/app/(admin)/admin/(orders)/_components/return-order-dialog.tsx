'use client';

import { OrderStatusBadge } from '@/components/shared/order-status-badge';
import { Button } from '@/components/ui/admin-button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/admin-input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/admin-utils';
import { useReturnOrderMutation } from '@/redux/api-queries/order-api';
import { OrderStatus, TOrder } from '@/types/order';
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type DialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    order: TOrder;
};

const TABLE_HEADERS = ['', 'SKU', 'Price', 'Qty', 'Total', 'Status'];

type ReturnQuantities = {
    [itemId: string]: number;
};

const ReturnOrderDialog = ({ open, setOpen, order }: DialogProps) => {
    const orderItems = order?.products;

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [returnQuantities, setReturnQuantities] = useState<ReturnQuantities>(
        {}
    );

    // === handle checked change ===
    const handleCheckedChange = (checked: boolean, itemId: string) => {
        if (typeof checked !== 'boolean') return;

        setSelectedItems((prevItems) => {
            if (checked) {
                return [...prevItems, itemId];
            } else {
                setReturnQuantities((prev) => {
                    const newQuantities = { ...prev };
                    delete newQuantities[itemId];
                    return newQuantities;
                });
                return prevItems.filter((id) => id !== itemId);
            }
        });
    };

    // === handle quantity input change (Minimal logic) ===
    const handleQuantityChange = (itemId: string, value: string) => {
        const qty = parseInt(value, 10);

        setReturnQuantities((prev) => ({
            ...prev,
            [itemId]: qty
        }));
    };

    // === return order api muation hook ===
    const [returnOrder, { isLoading }] = useReturnOrderMutation();

    // === handle full return ===
    const handleFullReturn = async () => {
        if (selectedItems?.length !== orderItems?.length) {
            toast.error('Please select all items!');
            return;
        }

        const payload = {
            order: order?._id,
            status: OrderStatus.RETURNED
        };

        try {
            const res: any = await returnOrder({ payload });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Order returned!');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to return full order!'
                );
            }
        } catch (error: any) {
            console.error('RETURN FULL ORDER ERROR: ', error);
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

    // === handle partial return ===
    const handlePartialReturn = async () => {
        if (selectedItems?.length === 0) {
            toast.error('Please select at least 1 item!');
            return;
        }

        const products = selectedItems
            .map((variantId) => {
                const found = orderItems?.find(
                    (it: any) => it?.selected_variant?._id === variantId
                );
                if (!found) return null;

                const originalQty = Number(found?.total_quantity ?? 0);
                // use the user provided qty if present, otherwise fall back to the original qty
                const qty = Number(returnQuantities[variantId] ?? originalQty);

                return { variant: variantId, quantity: qty };
            })
            .filter(Boolean) as { variant: string; quantity: number }[];

        const payload = {
            order: order?._id,
            products: products,
            status: OrderStatus.PARTIAL
        };

        try {
            const res: any = await returnOrder({ payload });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Order returned!');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to return partial order!'
                );
            }
        } catch (error: any) {
            console.error('RETURN PARTIAL ORDER ERROR: ', error);
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

    // === reset states on dialog close ===
    useEffect(() => {
        if (!open) {
            setSelectedItems([]);
            setReturnQuantities({});
        }
    }, [open, setSelectedItems, setReturnQuantities]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='overflow-hidden p-0 sm:max-w-2xl'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle>
                        Return Order (#{order?.order_serial_id})
                    </DialogTitle>
                    <DialogDescription className='sr-only'>
                        Dialog Description for Meta
                    </DialogDescription>
                </DialogHeader>

                <div className='px-6'>
                    <Table>
                        {/* table header */}
                        <TableHeader className='relative h-9 bg-sidebar'>
                            <TableRow className='border-b-primary/50'>
                                {TABLE_HEADERS.map((header) => (
                                    <TableHead
                                        key={header}
                                        className={cn('bg-primary/10 px-4')}
                                    >
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        {/* table body */}
                        {orderItems && orderItems?.length > 0 && (
                            <TableBody>
                                {orderItems?.map((item: any, index) => {
                                    const itemVariantId =
                                        item?.selected_variant?._id;
                                    const originalQty = item?.total_quantity;
                                    const isSelected =
                                        selectedItems?.includes(itemVariantId);
                                    const currentReturnQty =
                                        returnQuantities[itemVariantId] ||
                                        originalQty;

                                    return (
                                        <TableRow key={index}>
                                            <TableCell className='w-10 px-4'>
                                                <Checkbox
                                                    id={itemVariantId}
                                                    checked={isSelected}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleCheckedChange(
                                                            Boolean(checked),
                                                            itemVariantId
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className='px-4'>
                                                {item?.selected_variant?.sku}
                                            </TableCell>
                                            <TableCell className='px-4'>
                                                {
                                                    item?.selected_variant
                                                        ?.sale_price
                                                }
                                            </TableCell>

                                            <TableCell className='flex flex-col justify-center gap-1 px-4'>
                                                <Input
                                                    type='number'
                                                    value={
                                                        currentReturnQty
                                                            ? currentReturnQty
                                                            : originalQty
                                                    }
                                                    onChange={(e) =>
                                                        handleQuantityChange(
                                                            itemVariantId,
                                                            e.target.value
                                                        )
                                                    }
                                                    className={cn(
                                                        'h-8 w-20 text-center'
                                                    )}
                                                />
                                            </TableCell>

                                            <TableCell className='px-4 font-medium'>
                                                {currentReturnQty *
                                                    item?.selected_variant
                                                        ?.sale_price}
                                            </TableCell>
                                            <TableCell className='px-4 font-medium'>
                                                <OrderStatusBadge
                                                    status={item?.status}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        )}
                    </Table>
                </div>

                <div className='flex w-full items-center justify-end gap-4 border-t bg-muted/50 p-6'>
                    <Button
                        variant='outline'
                        disabled={
                            selectedItems?.length < 1 ||
                            orderItems?.length === selectedItems?.length ||
                            isLoading
                        }
                        onClick={handlePartialReturn}
                    >
                        {isLoading ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Return Partial
                            </>
                        ) : (
                            `Return Partial`
                        )}
                    </Button>
                    <Button disabled={isLoading} onClick={handleFullReturn}>
                        {isLoading ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Return All
                            </>
                        ) : (
                            `Return All`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReturnOrderDialog;
