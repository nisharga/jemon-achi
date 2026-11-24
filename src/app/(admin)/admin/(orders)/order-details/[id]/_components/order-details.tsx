'use client';

import { Button } from '@/components/ui/admin-button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/admin-utils';
import { useGetSingleOrderByIdQuery } from '@/redux/admin/api/order-api';
import { TOrder } from '@/types/admin/order';
import { format } from 'date-fns';
import React, { useState } from 'react';
import AssignOrderDialog from '../../../_components/assign-order-dialog';
import { Printer } from 'lucide-react';
import Image from 'next/image';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import OrderActions from '../../../_components/order-actions';
import { OrderStatusBadge } from '@/components/shared/order-status-badge';

type OrderLog = {
    _id: string;
    user: string | null;
    time: string;
    action: string;
};

export function formatString(inputString: string) {
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

const TABLE_HEADERS = ['Product', 'Quantity', 'Unit Price', 'Amount'];

const OrderDetails = ({ id }: { id: string }) => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.ORDER_VIEW]
    });

    // === assign order dialog state ===
    const [openAssignOrderDialog, setOpenAssignOrderDialog] = useState(false);

    // === get single order by id ===
    const { data, isLoading } = useGetSingleOrderByIdQuery({
        order_id: id
    });
    const order: TOrder = data?.data;

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading || isLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <>
            <section className='grid gap-6 xl:grid-cols-3'>
                {/* left section - PRINTABLE AREA */}
                <div className='space-y-6 overflow-x-auto rounded-lg bg-background p-4 shadow-md lg:p-6 xl:col-span-2 print:rounded-none print:shadow-none'>
                    <div className='space-y-6'>
                        {/* brand, order id and invoice id */}
                        <div className='flex w-full flex-wrap items-center justify-between gap-2'>
                            <div className='space-y-2'>
                                <Image
                                    src='/logo/r_logo_black.png'
                                    alt='Griipbuddy Logo'
                                    width={1080}
                                    height={1080}
                                    className='size-12 rounded-md'
                                />
                                <p className='text-xl font-bold text-accent-foreground'>
                                    Griipbuddy
                                </p>
                            </div>
                            <div className='space-y-2'>
                                <h3 className='text-lg font-medium'>
                                    ORDER ID: #{order?.order_serial_id}{' '}
                                </h3>
                                <p className='text-sm font-medium text-muted-foreground'>
                                    Invoice: {order?.invoice_number}
                                </p>
                                <OrderStatusBadge status={order?.status} />
                            </div>
                        </div>
                        {/* bill to */}
                        <div className='spyace-y-2'>
                            <h3 className='text-lg font-medium'>BILL TO:</h3>
                            <p className='text-sm font-medium text-muted-foreground'>
                                Name: {order?.customer_name}
                            </p>
                            <p className='text-sm font-medium text-muted-foreground'>
                                Phone: {order?.customer_phone}
                            </p>
                            <span className='flex flex-wrap items-center gap-1 text-sm font-medium text-muted-foreground'>
                                <p>
                                    Address: {order?.delivery_address?.address},
                                </p>
                                <p>
                                    Upazila: {order?.delivery_address?.thana},
                                </p>
                                <p>
                                    District:{' '}
                                    {order?.delivery_address?.district},
                                </p>
                                <p>
                                    {' '}
                                    Division:{' '}
                                    {order?.delivery_address?.division}
                                </p>
                            </span>
                        </div>

                        {/* order date, payment type */}
                        <div className='grid gap-6 sm:grid-cols-3'>
                            {order?.order_date && (
                                <div className='flex flex-col gap-1 border bg-accent p-2 text-sm font-medium text-primary'>
                                    <p className='text-foreground'>
                                        Order Date:
                                    </p>
                                    <p>
                                        {format(
                                            new Date(order?.order_date),
                                            'dd MMM yyyy'
                                        )}
                                        {', '}
                                        {format(
                                            new Date(order?.order_date),
                                            'hh:mm a'
                                        )}
                                    </p>
                                </div>
                            )}
                            <div className='flex flex-col gap-1 border bg-accent p-2 text-sm font-medium text-primary'>
                                <p className='text-foreground'>Payment Type:</p>
                                <p>{formatString(order?.payment_type)}</p>
                            </div>
                        </div>

                        {order?.payment_info && (
                            <div className='flex flex-col gap-1 border bg-accent p-2 text-sm font-medium text-primary print:hidden'>
                                <p className='text-foreground'>Payment Info:</p>
                                <p>
                                    Payment Amount: ৳
                                    {order?.payment_info?.amount}
                                </p>
                                <p>
                                    Payment Date:{' '}
                                    {order?.payment_info?.payment_date ? (
                                        <>
                                            {format(
                                                new Date(
                                                    order?.payment_info
                                                        ?.payment_date
                                                ),
                                                'dd MMM yyyy'
                                            )}
                                            {', '}
                                            {format(
                                                new Date(
                                                    order?.payment_info
                                                        ?.payment_date
                                                ),
                                                'hh:mm a'
                                            )}
                                        </>
                                    ) : (
                                        'N/A'
                                    )}
                                </p>
                                <p>
                                    Transaction Id:{' '}
                                    {order?.payment_info?.trx_id}
                                </p>
                                <p>
                                    Transaction Status:{' '}
                                    {order?.payment_info?.trx_status}
                                </p>
                            </div>
                        )}
                    </div>
                    {/* order items table */}
                    <Table className='print:border'>
                        {/* table header */}
                        <TableHeader className='relative h-9 bg-sidebar'>
                            <TableRow className='border-b-primary/50'>
                                {TABLE_HEADERS.map((header) => (
                                    <TableHead
                                        key={header}
                                        className={cn(
                                            'bg-primary px-4 text-white'
                                        )}
                                    >
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        {/* table body */}
                        {order?.products?.length > 0 && (
                            <TableBody>
                                {order?.products?.map((product: any) => {
                                    // product variant
                                    const variant = Object?.entries(
                                        product?.selected_variant
                                            ?.attribute_values
                                    )?.map((item) => item?.[1]);

                                    // product sku
                                    const sku = product?.selected_variant?.sku;

                                    return (
                                        <TableRow key={product?.product?._id}>
                                            <TableCell className='space-y-1 px-4'>
                                                <div className='max-w-60 text-sm font-medium text-wrap text-primary'>
                                                    {product?.product?.name} (
                                                    {variant?.join(' - ')})
                                                </div>
                                                <p className='text-xs text-foreground'>
                                                    SKU: {sku}
                                                </p>
                                            </TableCell>
                                            <TableCell className='px-4'>
                                                {product?.total_quantity}
                                            </TableCell>
                                            <TableCell className='px-4'>
                                                {
                                                    product?.selected_variant
                                                        ?.sale_price
                                                }{' '}
                                                TK
                                            </TableCell>
                                            <TableCell className='px-4'>
                                                {product?.total_price} TK
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        )}
                    </Table>

                    {/* totals */}
                    <div className='ms-auto w-60 space-y-2'>
                        <span className='flex w-full items-center justify-between text-sm font-medium text-muted-foreground'>
                            <p>Sub Total:</p>{' '}
                            <p className='w-24 bg-accent p-2 text-foreground'>
                                {order?.sub_total} TK
                            </p>
                        </span>
                        <span className='flex w-full items-center justify-between text-sm font-medium text-muted-foreground'>
                            <p>Discount:</p>{' '}
                            <p className='w-24 bg-accent p-2 text-destructive'>
                                -{order?.total_discount} TK
                            </p>
                        </span>
                        <span className='flex w-full items-center justify-between text-sm font-medium text-muted-foreground'>
                            <p>Delivery Charge:</p>{' '}
                            <p className='w-24 bg-accent p-2 text-foreground'>
                                +{order?.delivery_charge} TK
                            </p>
                        </span>

                        <span className='flex w-full items-center justify-between text-sm font-medium text-muted-foreground'>
                            <p>Total:</p>{' '}
                            <p className='w-24 bg-accent p-2 text-foreground'>
                                {order?.total_amount} TK
                            </p>
                        </span>

                        <span className='flex w-full items-center justify-between text-sm font-medium text-muted-foreground'>
                            <p>Advance Amount:</p>{' '}
                            <p className='w-24 bg-accent p-2 text-foreground'>
                                {order?.paid_amount} TK
                            </p>
                        </span>
                        <span className='flex w-full items-center justify-between bg-primary text-sm font-medium text-white'>
                            <p className='pl-2'>COD:</p>{' '}
                            <p className='w-24 p-2'>{order?.COD} TK</p>
                        </span>
                    </div>

                    {/* Logs and Discount Logs */}
                    <div className='space-y-4 rounded-lg border bg-background p-4 shadow-md lg:p-6 print:hidden'>
                        <h3 className='mb-2 border-b pb-2 text-lg font-medium'>
                            Order Logs
                        </h3>
                        {order?.logs?.length > 0 ? (
                            <div className='max-h-60 space-y-2 overflow-y-auto'>
                                {/* Reverse the array to show newest first */}
                                {[...order.logs]
                                    .reverse() // Reverse the array to show newest first at top
                                    .map((log: OrderLog) => {
                                        // Safely get user display with type assertions
                                        const user = log?.user;
                                        let userDisplay = 'System';

                                        if (user) {
                                            if (typeof user === 'string') {
                                                userDisplay = user;
                                            } else {
                                                // Cast to any to access properties
                                                const userAny = user as any;
                                                userDisplay =
                                                    userAny?.full_name ??
                                                    'User';
                                            }
                                        }

                                        return (
                                            <div
                                                key={log._id}
                                                className='border-b pb-2'
                                            >
                                                <p className='text-sm text-muted-foreground'>
                                                    By: {userDisplay}
                                                </p>
                                                <p className='text-sm'>
                                                    {log?.action}
                                                </p>
                                                <p className='text-xs text-muted-foreground'>
                                                    {log?.time
                                                        ? new Date(log.time)
                                                              .toLocaleString(
                                                                  'en-GB',
                                                                  {
                                                                      day: '2-digit',
                                                                      month: 'short',
                                                                      year: 'numeric',
                                                                      hour: '2-digit',
                                                                      minute: '2-digit',
                                                                      hour12: true
                                                                  }
                                                              )
                                                              .replace(',', '')
                                                        : 'No timestamp'}
                                                </p>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <p className='text-sm text-muted-foreground'>
                                No logs found.
                            </p>
                        )}

                        <h3 className='mt-4 mb-2 border-b pb-2 text-lg font-medium'>
                            Discount Logs
                        </h3>
                        {(order?.discount_logs || []).length > 0 ? (
                            <div className='max-h-40 space-y-2 overflow-y-auto'>
                                {(order?.discount_logs || []).map((log) => (
                                    <div
                                        key={
                                            log._id?.toString() || Math.random()
                                        }
                                        className='border-b pb-2'
                                    >
                                        <p className='text-sm'>
                                            Discount Type:{' '}
                                            {log?.discount_type || 'N/A'} —
                                            Amount: {log?.discount_amount || 0}{' '}
                                            TK
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                            Applied At:{' '}
                                            {new Date(log.applied_at)
                                                .toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })
                                                .replace(',', '')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='text-sm text-muted-foreground'>
                                No discount logs found.
                            </p>
                        )}
                    </div>

                    {/* contact */}
                    <hr className='h-px w-full bg-border' />
                    <div className='flex flex-wrap items-center justify-between gap-2 text-sm'>
                        <div className='flex items-center gap-1 font-medium'>
                            <p className='text-muted-foreground'>Support:</p>
                            <p>01871-087090</p>
                        </div>
                        <p>contact@griipbuddy.com</p>
                    </div>
                </div>

                {/* right section */}
                <div className='space-y-6 print:hidden'>
                    {/* Actions */}
                    <div className='rounded-lg bg-background shadow-md'>
                        {/* <UpdateStatus
              order_status={order?.status as string}
              order_id={order?._id as string}
            /> */}
                        <div className='flex w-full items-center justify-between gap-2 px-4 py-4 lg:px-6'>
                            <h3 className='text-lg font-medium'>Actions</h3>
                            {/* <Button
                disabled={
                  order?.status !== OrderStatus.PLACED ||
                  order?.is_assigned_to_business_location
                }
                variant="green"
                onClick={() => {
                  setOpenAssignOrderDialog(true);
                }}
              >
                Assign Order to Outlet
              </Button> */}
                            <OrderActions
                                order={order}
                                triggerBtn={<Button>Order Actions</Button>}
                            />
                            <div className='print:hidden'>
                                <Button
                                    onClick={() => window.print()}
                                    size='lg'
                                    variant='green'
                                >
                                    Print Invoice <Printer />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* customer info */}
                    <div className='rounded-lg bg-background shadow-md'>
                        <h3 className='w-full border-b px-4 py-4 text-lg font-medium lg:px-6'>
                            Customer Info
                        </h3>
                        <div className='flex flex-col gap-1 p-4 lg:p-6'>
                            <p className='font-medium text-muted-foreground'>
                                Name:{' '}
                                <span className='text-foreground'>
                                    {order?.customer_name || 'N/A'}
                                </span>
                            </p>
                            <p className='font-medium text-muted-foreground'>
                                Phone:{' '}
                                <span className='text-foreground'>
                                    {order?.customer_phone || 'N/A'}
                                </span>
                            </p>
                            <p className='font-medium text-muted-foreground'>
                                District:{' '}
                                <span className='text-foreground'>
                                    {order?.delivery_address?.district || 'N/A'}
                                </span>
                            </p>
                            <p className='font-medium text-muted-foreground'>
                                Thana:{' '}
                                <span className='text-foreground'>
                                    {order?.delivery_address?.thana || 'N/A'}
                                </span>
                            </p>
                            <p className='font-medium text-muted-foreground'>
                                Full Address:{' '}
                                <span className='text-foreground'>
                                    {order?.delivery_address?.address || 'N/A'}
                                </span>
                            </p>
                        </div>
                    </div>
                    {/* notes */}
                    <div className='rounded-lg bg-background shadow-md'>
                        <h3 className='w-full border-b px-4 py-4 text-lg font-medium lg:px-6'>
                            Executive Notes
                        </h3>
                        <div className='flex flex-col gap-1 p-4 lg:p-6'>
                            {order?.admin_notes?.length > 0 ? (
                                <div className='grid gap-2'>
                                    {order?.admin_notes
                                        ?.slice()
                                        ?.reverse()
                                        ?.map((n, i) => {
                                            return (
                                                <div
                                                    key={n?._id}
                                                    className={cn(
                                                        'w-full space-y-2 border bg-accent p-2',
                                                        {
                                                            'border-accent-foreground bg-accent-foreground/10':
                                                                i == 0
                                                        }
                                                    )}
                                                >
                                                    <p className='text-sm'>
                                                        {n?.note}
                                                    </p>
                                                    <div className='flex w-full items-center justify-between gap-2 text-sm font-medium text-primary'>
                                                        <p className='text-xs text-muted-foreground'>
                                                            Added By:{' '}
                                                            {
                                                                n?.added_by
                                                                    ?.full_name
                                                            }
                                                        </p>
                                                        <p className='text-xs text-muted-foreground'>
                                                            {format(
                                                                new Date(
                                                                    n?.added_at
                                                                ),
                                                                'dd MMM yyyy'
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className='text-center text-sm font-medium'>
                                    No Note Found!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* print invoice action */}

            {/* assign order dialog */}
            <AssignOrderDialog
                open={openAssignOrderDialog}
                setOpen={setOpenAssignOrderDialog}
                order_id={order?._id as string}
            />
        </>
    );
};

export default OrderDetails;

// {
//   "rounded-tr-md": index === TABLE_HEADERS?.length - 1,
//   "rounded-tl-md": index === 0,
// }

// "2025-08-02T18:22:42.373Z"
