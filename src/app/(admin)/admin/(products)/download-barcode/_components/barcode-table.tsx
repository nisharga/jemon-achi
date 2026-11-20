/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from '@/admin/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/admin/components/ui/table';
import { Checkbox } from '@/admin/components/ui/checkbox'; // ✅ Add a checkbox UI component
import { cn } from '@/admin/lib/utils';
import { TVariantCombination } from '@/admin/types/product';
import { useBarcode } from 'next-barcode';
import React, { useState } from 'react';
import './print.css';

type OrdersTableProps = {
    inventories: [];
    isLoading: boolean;
    isFetching: boolean;
};

const INVENTORY_TABLE_HEADERS = [
    'Select',
    'Product Name',
    'SKU',
    'Barcode',
    'Print'
];

const BarcodeImage = ({
    barcode,
    imgClass
}: {
    barcode: string;
    imgClass?: string;
}) => {
    const { inputRef } = useBarcode({
        value: barcode,
        options: {
            width: 1.5,
            height: 40,
            displayValue: false,
            fontSize: 10,
            margin: 0
        }
    });

    return (
        <div className={cn('flex justify-center', imgClass)}>
            <img ref={inputRef} className='object-contain' />
        </div>
    );
};

export function BarcodeTable({
    inventories,
    isLoading,
    isFetching
}: OrdersTableProps) {
    const [barcodeQty, setBarcodeQty] = useState(0);

    // ✅ Selected barcodes storage (persist even after searching new data)
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    // === handle single print (old) ===
    const handlePrintBarcode = (variant: TVariantCombination) => {
        setSelectedItems([{ ...variant, qty: barcodeQty }]);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    // ✅ handle checkbox toggle
    const toggleSelect = (inventory: any) => {
        setSelectedItems((prev) => {
            const exists = prev.find((item) => item._id === inventory._id);
            if (exists) {
                return prev.filter((item) => item._id !== inventory._id);
            } else {
                return [...prev, { ...inventory, qty: barcodeQty }];
            }
        });
    };

    // ✅ handle bulk print
    const handlePrintSelected = () => {
        if (selectedItems.length === 0) return;
        setTimeout(() => {
            window.print();
        }, 500);
    };

    return (
        <>
            <div className='rounded-lg bg-background p-2 shadow-md print:hidden'>
                {/* ✅ Top bar */}
                {selectedItems.length > 0 && (
                    <div className='mb-3 flex items-center justify-between rounded-md bg-yellow-100 p-2'>
                        <p className='text-sm font-medium'>
                            Selected for print: {selectedItems.length}
                        </p>
                        <Button onClick={handlePrintSelected}>
                            Print Selected ({selectedItems.length})
                        </Button>
                    </div>
                )}

                {!isLoading && !isFetching && (
                    <Table>
                        <TableHeader className='relative h-9 bg-sidebar'>
                            <TableRow className='border-b-primary/50'>
                                {INVENTORY_TABLE_HEADERS.map(
                                    (header, index) => (
                                        <TableHead
                                            key={header}
                                            className={cn(
                                                'bg-primary/10 px-4',
                                                {
                                                    'rounded-tr-md':
                                                        index ===
                                                        INVENTORY_TABLE_HEADERS?.length -
                                                            1,
                                                    'rounded-tl-md': index === 0
                                                }
                                            )}
                                        >
                                            {header}
                                        </TableHead>
                                    )
                                )}
                            </TableRow>
                        </TableHeader>

                        {/* table body */}
                        {inventories?.length > 0 && (
                            <TableBody>
                                {inventories?.map((inventory: any) => {
                                    const variant = Object.entries(
                                        inventory?.attribute_values || {}
                                    )
                                        ?.map((item) => item?.[1])
                                        .join('-');

                                    const isChecked = selectedItems.some(
                                        (i) => i._id === inventory._id
                                    );

                                    return (
                                        <TableRow key={inventory?._id}>
                                            {/* ✅ Select checkbox */}
                                            <TableCell className='px-4'>
                                                <Checkbox
                                                    checked={isChecked}
                                                    className='size-6'
                                                    onCheckedChange={() =>
                                                        toggleSelect(inventory)
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell className='px-4'>
                                                {inventory?.product?.name} (
                                                {variant})
                                            </TableCell>
                                            <TableCell className='px-4'>
                                                {inventory?.sku}
                                            </TableCell>
                                            <TableCell className='px-4'>
                                                <BarcodeImage
                                                    barcode={inventory?.barcode}
                                                />
                                            </TableCell>
                                            <TableCell className='px-4'>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        value={barcodeQty}
                                                        onChange={(e) =>
                                                            setBarcodeQty(
                                                                Number(
                                                                    e?.target
                                                                        ?.value
                                                                )
                                                            )
                                                        }
                                                        placeholder='Quantity'
                                                        type='number'
                                                        className='w-24'
                                                    />
                                                    <Button
                                                        onClick={() =>
                                                            handlePrintBarcode(
                                                                inventory
                                                            )
                                                        }
                                                    >
                                                        Print Barcode
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        )}
                    </Table>
                )}

                {/* loading state */}
                {(isLoading || isFetching) && (
                    <div className='grid w-full gap-4'>
                        {Array.from({ length: 10 }).map((_, index) => (
                            <span
                                key={index}
                                className='animate-skeleton h-14 rounded-md bg-secondary'
                            />
                        ))}
                    </div>
                )}

                {/* empty state */}
                {!isLoading && inventories?.length <= 0 && (
                    <div className='py-4 text-center'>No data found!</div>
                )}
            </div>

            {/* ✅ Bulk Print Page */}
            <div className='barcode-labels hidden print:block'>
                <div className='flex flex-wrap'>
                    {selectedItems.map((item) =>
                        Array.from({ length: item.qty || 1 }).map((_, i) => (
                            <div
                                key={`${item._id}-${i}`}
                                className='barcode-label'
                            >
                                <p className='barcode-text'>
                                    Size:{' '}
                                    <span className='font-medium'>
                                        {String(
                                            Object.values(
                                                item.attribute_values
                                            )[0] ?? ''
                                        )}
                                    </span>
                                </p>
                                <p className='barcode-sku'>{item?.sku}</p>
                                <p className='barcode-price'>
                                    Price: {item?.regular_price} TK
                                </p>
                                <BarcodeImage
                                    barcode={item?.barcode}
                                    imgClass='barcode-img'
                                />
                                <p className='barcode-number'>
                                    {item?.barcode}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
