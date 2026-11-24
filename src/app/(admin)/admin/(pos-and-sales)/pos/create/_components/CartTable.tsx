'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/admin-input';
import { Button } from '@/components/ui/admin-button';
import { Trash2 } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch'; // Assuming this is a custom component
import {
    CartItemPatch,
    CartItemUI,
    DiscountCalculationType
    // type PosSaleRequest,
} from '@/types/admin/pos';

interface Props {
    cart: CartItemUI[];
    onItemChange: (i: number, changes: CartItemPatch) => void;
    onRemove: (i: number) => void;
}

export const CartTable: React.FC<Props> = ({
    cart,
    onItemChange,
    onRemove
}) => {
    return (
        <div className='rounded-lg border'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className=''>Product SKU</TableHead>
                        <TableHead className=''>Qty</TableHead>
                        <TableHead className=''>Regular Price</TableHead>
                        <TableHead className=''>Discount Type</TableHead>
                        <TableHead className=''>Discount Value</TableHead>
                        <TableHead className='text-right'>Total</TableHead>
                        <TableHead className='text-center'>Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {cart.length > 0 ? (
                        cart.map((item, i) => {
                            // product variant
                            const variant = Object.entries(
                                item?.selected_variant?.attribute_values || {}
                            )
                                ?.map((i) => i?.[1])
                                .join('-');

                            // All calculation logic remains the same
                            const line =
                                item.selected_variant.regular_price *
                                item.quantity;

                            const discVal = item.product_discount.value ?? 0; // null-safe
                            const disc =
                                item.product_discount.type === 'PERCENTAGE'
                                    ? (line * discVal) / 100
                                    : discVal;
                            const total = line - disc;

                            return (
                                <TableRow
                                    key={`${item.selected_variant.sku}-${i}`}
                                >
                                    <TableCell className='flex max-w-96 flex-col gap-1 px-2'>
                                        <span className='text-wrap'>
                                            {item?.productName} ({variant})
                                        </span>
                                        <span className='text-xs text-muted-foreground'>
                                            SKU: {item?.selected_variant?.sku}
                                        </span>
                                    </TableCell>
                                    <TableCell className='min-w-28 px-2'>
                                        <Input
                                            type='number'
                                            value={item.quantity}
                                            onChange={(e) =>
                                                onItemChange(i, {
                                                    quantity:
                                                        parseInt(
                                                            e.target.value
                                                        ) || 1
                                                })
                                            }
                                            className='h-9 w-full max-w-28 shrink-0'
                                            min={1}
                                        />
                                    </TableCell>
                                    <TableCell className='min-w-28 px-2'>
                                        ৳ {item.selected_variant.regular_price}
                                    </TableCell>

                                    <TableCell className='px-2'>
                                        <ToggleSwitch
                                            enabled={
                                                item.product_discount.type ===
                                                'PERCENTAGE'
                                            }
                                            onChange={(on) =>
                                                onItemChange(i, {
                                                    product_discount: {
                                                        ...item.product_discount,
                                                        type: on
                                                            ? DiscountCalculationType.PERCENTAGE
                                                            : DiscountCalculationType.FLAT
                                                    }
                                                })
                                            }
                                            labelOn='Percentage'
                                            labelOff='TK'
                                        />
                                    </TableCell>
                                    <TableCell className='w-fit max-w-28 px-2'>
                                        <Input
                                            type='number'
                                            className='h-9'
                                            value={
                                                item.product_discount.value ??
                                                ''
                                            } // blank when null
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                onItemChange(i, {
                                                    product_discount: {
                                                        ...item.product_discount,
                                                        value:
                                                            v === ''
                                                                ? null
                                                                : Number(v) // allow clearing
                                                    }
                                                });
                                            }}
                                        />
                                    </TableCell>

                                    <TableCell className='w-28 px-2 text-right'>
                                        ৳ {total}
                                    </TableCell>
                                    <TableCell className='px-2 text-center'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            onClick={() => onRemove(i)}
                                            className='text-red-500 hover:text-red-600'
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className='h-24 text-center text-gray-500'
                            >
                                Your cart is empty. Add products to get started.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
