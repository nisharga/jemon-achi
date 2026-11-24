'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';
import React from 'react';
import './print.css';
import { useGetOutletSaleByIdQuery } from '@/redux/admin/api/pos-sale-api';
import { IPosSaleProduct } from '@/types/admin/pos';
import { cn } from '@/lib/admin-utils';

const TABLE_HEADERS = ['Items', 'Qty', 'Price'];

const PrintableSaleInvoice = ({ saleId }: { saleId: string }) => {
    const { data } = useGetOutletSaleByIdQuery(
        { pos_sale_id: saleId! },
        { skip: !saleId }
    );

    const sale = data?.data;
    console.log('sale', sale);

    return (
        <>
            <section
                id='invoice-print-area'
                className='no-break hidden space-y-4 print:block'
            >
                <div className='flex w-full flex-col items-center gap-4'>
                    <div className='flex w-full flex-col items-center justify-center gap-1'>
                        <p className='text-center text-base font-medium'>
                            Rs Leather
                        </p>
                        <span className='text-center text-xs font-medium'>
                            {sale?.business_location?.address?.local_address}
                        </span>
                        <p className='text-center text-xs font-medium'>
                            Contact: +8801709306560
                        </p>
                    </div>

                    <div className='w-full'>
                        <h3 className='w-full border-b pb-1 text-center text-base font-medium'>
                            INVOICE
                        </h3>
                        <div className='flex w-full items-center justify-between gap-2 py-1 text-xs font-medium'>
                            <p>Sale Id:</p>
                            <p>#{sale?.sale_serial_id}</p>
                        </div>
                        <div className='flex w-full items-center justify-between gap-2 py-1 text-xs font-medium'>
                            <p>Date:</p>
                            <p>
                                {sale?.sale_date &&
                                    format(
                                        new Date(sale?.sale_date),
                                        'dd MMM yyyy, hh:mm a'
                                    )}
                            </p>
                        </div>
                        <div className='flex w-full items-center justify-between gap-2 py-1 text-xs font-medium'>
                            <p>Customer:</p>
                            <span className='flex flex-wrap gap-1'>
                                <p>
                                    {sale?.user?.full_name
                                        ? sale?.user?.full_name
                                        : 'Walk-in Customer'}
                                </p>
                                <p>
                                    {sale?.user?.phone_number
                                        ? sale?.user?.phone_number
                                        : ''}
                                </p>
                            </span>
                        </div>
                    </div>
                </div>

                <div className='space-y-2'>
                    {/* order items table */}
                    <Table className='border-b'>
                        <TableHeader className='py-1'>
                            <TableRow className='border-b'>
                                {TABLE_HEADERS?.map((header, index) => (
                                    <TableHead
                                        key={header}
                                        className={cn('h-7 text-xs', {
                                            'text-right':
                                                index ===
                                                TABLE_HEADERS.length - 1
                                        })}
                                    >
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        {sale?.products?.length > 0 && (
                            <TableBody>
                                {sale?.products?.map((p: IPosSaleProduct) => {
                                    const variant = Object.entries(
                                        p?.selected_variant?.attribute_values ||
                                            {}
                                    )?.map((item) => item?.[1]);

                                    const variantString = variant?.length
                                        ? `Size: ${variant?.join(' - ')}`
                                        : '';
                                    return (
                                        <TableRow
                                            key={p?._id}
                                            className='border-none text-xs'
                                        >
                                            <TableCell>
                                                <div className='max-w-60 font-medium text-wrap'>
                                                    {p?.selected_variant?.sku}
                                                    {variantString &&
                                                        ` (${variantString})`}
                                                </div>
                                            </TableCell>
                                            <TableCell className='text-center font-medium'>
                                                {p?.quantity}
                                            </TableCell>
                                            <TableCell className='text-right font-medium'>
                                                {p.total_price.toLocaleString()}{' '}
                                                Tk
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        )}
                    </Table>

                    <div className='w-full space-y-1 p-1'>
                        <span className='flex w-full items-center justify-between text-base font-medium'>
                            <p className='text-[14px]'>Sub Total:</p>{' '}
                            <p className='text-[14px]'>{sale?.sub_total} Tk</p>
                        </span>
                        <span className='flex w-full items-center justify-between text-base font-medium'>
                            <p className='text-[14px]'>Discount:</p>{' '}
                            <p className='text-[14px]'>
                                {sale?.total_discount} Tk
                            </p>
                        </span>
                        <span className='flex w-full items-center justify-between text-base font-medium'>
                            <p className='text-[14px]'>Total:</p>{' '}
                            <p className='text-[14px]'>
                                {sale?.total_amount} Tk
                            </p>
                        </span>
                        <span className='flex w-full items-center justify-between text-base font-medium'>
                            <p className='text-[14px]'>Cash:</p>{' '}
                            <p className='text-[14px]'>
                                {sale?.paid_amount} Tk
                            </p>
                        </span>
                        <span className='flex w-full items-center justify-between text-base font-medium'>
                            <p className='text-[14px]'>Total Paid:</p>{' '}
                            <p className='text-[14px]'>
                                {sale?.paid_amount} Tk
                            </p>
                        </span>
                    </div>
                </div>

                <div className='mt-2 pb-1 text-center text-[10px] text-muted-foreground'>
                    নোটঃ ৪ মাস ওয়ারেন্টির সাথে থাকছে ৬ মাস সোল রিপ্লেসমেন্ট
                    গ্যারান্টি। শর্তঃ আগুনে পোড়ানো কিংবা বাহ্যিক আঘাতে ক্ষতিগ্রস্ত হলে
                    ওয়ারেন্টি প্রযোজ্য নয়।
                </div>
            </section>
        </>
    );
};

export default PrintableSaleInvoice;
