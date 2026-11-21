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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useHasPermission } from '@/hooks/use-has-permission';
import { usePosSaleReturnMutation } from '@/redux/api-queries/pos-sale-api';
import { PermissionEnum } from '@/types/permistion';
import { IPOSSale } from '@/types/pos-sale';
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type DialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    sale: IPOSSale;
};

const SaleReturnDialog = ({ open, setOpen, sale }: DialogProps) => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.POS_UPDATE]
    });

    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENTAGE'>(
        'FLAT'
    );
    const [discountValue, setDiscountValue] = useState<number>(0);

    const handleQuantityChange = (productId: string, value: string) => {
        const numValue = Number.parseInt(value) || 0;
        setQuantities((prev) => ({
            ...prev,
            [productId]: Math.max(0, numValue)
        }));
    };

    // === pos sale return api mutation hook ===
    const [saleReturn, { isLoading }] = usePosSaleReturnMutation();

    const handleReturn = async () => {
        if (!hasPermission) {
            toast.error("You don't have permission to perform this action!");
            return;
        }

        const payload = {
            business_location: sale.business_location?._id || '',
            items:
                sale?.products
                    ?.filter((p) => quantities[p._id] > 0)
                    .map((p) => ({
                        product: p.product,
                        quantity: quantities[p._id],
                        // selected_variant: p.selected_variant,
                        barcode: p?.selected_variant?.barcode,
                        product_discount: p.product_discount
                    })) || [],
            overall_discount: {
                type: discountType,
                value: discountValue
            },
            paid_amount: paidAmount,
            payment_method: sale.payment_method || 'Cash',
            payment_account: sale.payment_account || '',
            sale_note: sale?.sale_note || '',
            payment_note: sale?.payment_note || ''
        };

        try {
            const res: any = await saleReturn({ sale_id: sale?._id, payload });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Sale returned successfully!');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to return sale product!'
                );
            }
        } catch (error: any) {
            console.log('SALE RETURN ERROR: ', error);
            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            } else {
                toast.error('Somthing went wrong! Please try again.');
            }
        }
    };

    // === set default data from api on state ===
    useEffect(() => {
        if (sale?.products) {
            const initialQuantities: Record<string, number> = {};
            sale.products.forEach((product) => {
                initialQuantities[product._id] = product.quantity || 0;
            });
            setQuantities(initialQuantities);
            setPaidAmount(sale?.paid_amount);
            setDiscountType(sale?.overall_discount?.type);
            setDiscountValue(sale?.overall_discount?.value);
        }
    }, [sale]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='overflow-hidden p-0 sm:max-w-5xl'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle>Sale Return</DialogTitle>
                    <DialogDescription className='sr-only'>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                    </DialogDescription>
                </DialogHeader>

                <div className='flex-1 space-y-6 overflow-y-auto px-6'>
                    <Table>
                        <TableHeader className='bg-primary/10 text-white'>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Sale Price</TableHead>
                                <TableHead>Regular Price</TableHead>
                                <TableHead>Original Qty</TableHead>
                                <TableHead>Return Qty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sale?.products?.map((product: any) => {
                                const variant = Object.entries(
                                    product?.selected_variant?.attribute_values
                                )
                                    ?.map((item) => item?.[1])
                                    .join('-');

                                return (
                                    <TableRow key={product?._id}>
                                        <TableCell className='font-medium'>
                                            {product?.selected_variant?.sku} (
                                            {variant})
                                        </TableCell>
                                        <TableCell>
                                            {product?.selected_variant
                                                ?.sale_price || 0}
                                        </TableCell>
                                        <TableCell>
                                            {product?.selected_variant
                                                ?.regular_price || 0}
                                        </TableCell>
                                        <TableCell>
                                            {product?.quantity}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type='number'
                                                value={quantities[product?._id]}
                                                onChange={(e) =>
                                                    handleQuantityChange(
                                                        product?._id,
                                                        e.target.value
                                                    )
                                                }
                                                className='w-20'
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <div className='grid grid-cols-3 gap-4 pb-2'>
                        <div>
                            <label className='mb-2 block text-sm font-medium'>
                                Discount Type
                            </label>
                            <Select
                                value={discountType}
                                onValueChange={(value: any) =>
                                    setDiscountType(value)
                                }
                            >
                                <SelectTrigger className='w-full'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='FLAT'>Flat</SelectItem>
                                    <SelectItem value='PERCENTAGE'>
                                        Percentage
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className='mb-2 block text-sm font-medium'>
                                Discount Value
                            </label>
                            <Input
                                type='number'
                                min='0'
                                value={discountValue}
                                onChange={(e) =>
                                    setDiscountValue(
                                        Number.parseFloat(e.target.value) || 0
                                    )
                                }
                                placeholder='0'
                            />
                        </div>

                        <div>
                            <label className='mb-2 block text-sm font-medium'>
                                Paid Amount
                            </label>
                            <Input
                                type='number'
                                min='0'
                                value={paidAmount}
                                onChange={(e) =>
                                    setPaidAmount(
                                        Number.parseFloat(e.target.value) || 0
                                    )
                                }
                                placeholder='0'
                            />
                        </div>
                    </div>
                </div>

                <div className='flex w-full items-center justify-end gap-4 border-t bg-muted/50 p-6'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReturn}
                        disabled={isLoading || isPermissionLoading}
                    >
                        {isLoading ? (
                            <>
                                Returning..
                                <Loader className='size-4 animate-spin' />
                            </>
                        ) : (
                            `Return`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SaleReturnDialog;
