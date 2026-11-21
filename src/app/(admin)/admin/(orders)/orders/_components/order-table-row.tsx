'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/admin-utils';
import { TOrder } from '@/types/order';
import OrderActions from '../../_components/order-actions';
import { Badge } from '@/components/ui/admin-badge';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { OrderStatusBadge } from '@/components/shared/order-status-badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Info,
    AlertTriangle,
    CheckCircle as CheckCircleIcon,
    XCircle as XCircleIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { RepeatCustomerModal } from './RepeatCustomerModal';
import FraudChecker from './FraudChecker';
import { getImgFullUrl } from '@/lib/admin-utils';
import {
    useAcceptAwaitingStockOrderMutation,
    useDeclineAwaitingStockOrderMutation,
    useMarkOrderAsCalledMutation
} from '@/redux/api-queries/order-api';
import { OrderStatus } from '@/types/order';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FraudData {
    apis: boolean;
    statusTag?: string;
    successRate?: number;
    totalParcels?: number;
    totalDelivered?: number;
    totalCancel?: number;
    error?: string;
}

interface ApiResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data?: FraudData;
}

interface CourierData {
    courierKey: string;
    courierName: string;
    totalParcels: number;
    lastCourierSyncAt?: string;
    raw?: any;
    successRate: number;
    totalDelivered: number;
    totalCancelled: number;
    totalOrdered: number;
    totalOrders?: number;
}

// eslint-disable-next-line react/display-name
const OrdersTableRow = React.memo(({ order }: { order: TOrder }) => {
    // ================================================
    // ================== Fraud Checker ===============
    // ================================================
    const [fraudData, setFraudData] = useState<FraudData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFraudData = async () => {
            if (!order?.customer_phone) {
                return;
            }

            const phone = order.customer_phone.replace(/\D/g, '');
            if (phone.length < 10) {
                return;
            }
            setLoading(true);

            try {
                const url = `/api/fraud-check?phone=${encodeURIComponent(phone)}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const apiResponse: ApiResponse = await response.json();
                const fraudInfo = apiResponse.data;
                setFraudData(fraudInfo || null);
            } catch (error) {
                console.error('Error fetching fraud data:', error);
                const errorData: FraudData = {
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Failed to fetch fraud data',
                    apis: false
                };
                setFraudData(errorData);
            } finally {
                setLoading(false);
            }
        };

        fetchFraudData();
    }, [order?.customer_phone]);

    // ================================================
    // ================== Awaiting Stock Actions ======
    // ================================================
    const [acceptAwaitingStockOrder, { isLoading: isAccepting }] =
        useAcceptAwaitingStockOrderMutation();
    const [declineAwaitingStockOrder, { isLoading: isDeclining }] =
        useDeclineAwaitingStockOrderMutation();
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);
    const [declineReason, setDeclineReason] = useState('');

    // ================================================
    // ================== Have you called? ============
    // ================================================
    const [markOrderAsCalled, { isLoading: isMarkingCalled }] =
        useMarkOrderAsCalledMutation();

    const handleMarkAsCalled = async () => {
        try {
            const res: any = await markOrderAsCalled({
                order_id: order?._id as string
            }).unwrap();
            if (res?.success) {
                toast.success('Order marked as called');
            }
        } catch (error: any) {
            toast.error(
                `Failed to mark as called: ${
                    error?.data?.message || error.message || 'Unknown error'
                }`
            );
        }
    };

    const callLogs = order?.call_logs || [];
    const latestCall = callLogs[callLogs.length - 1];

    const handleAcceptOrder = async () => {
        try {
            const res: any = await acceptAwaitingStockOrder({
                order_id: order?._id as string
            }).unwrap();
            console.log('res', res);
            if (res?.success) {
                toast.success('Order accepted successfully');
            } else {
                console.error(
                    'Failed to accept order:',
                    res?.message || 'Unknown error'
                );
                toast.error(
                    `Failed to accept order: ${res?.message || 'Unknown error'}`
                );
            }
        } catch (error: any) {
            console.error('Failed to accept order:', error);
            toast.error(
                `Failed to accept order: ${error?.data?.message || error.message || 'Unknown error'}`
            );
        }
    };

    const handleDeclineOrder = async () => {
        try {
            await declineAwaitingStockOrder({
                order_id: order?._id as string,
                reason: declineReason
            }).unwrap();
            setShowDeclineDialog(false);
            setDeclineReason('');
        } catch (error: any) {
            console.error('Failed to decline order:', error);
        }
    };

    const getStatusIcon = () => {
        if (loading)
            return (
                <div className='h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
            );
        if (fraudData?.error)
            return <XCircleIcon className='h-4 w-4 text-red-500' />;
        if (!fraudData)
            return <AlertTriangle className='h-4 w-4 text-gray-500' />;

        const successRate = fraudData.successRate || 0;
        if (successRate >= 80)
            return <CheckCircleIcon className='h-4 w-4 text-green-500' />;
        if (successRate >= 50)
            return <AlertTriangle className='h-4 w-4 text-yellow-500' />;
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
    };

    return (
        <>
            <TableRow>
                <TableCell className='max-w-[10px] pl-4'>
                    <OrderActions order={order} />
                </TableCell>

                <TableCell className='px-2 text-center'>
                    <div className='flex flex-col items-center gap-1'>
                        <p className='font-medium'>#{order?.order_serial_id}</p>
                        {order?.order_note !== '' && (
                            <p className='text-xs'>
                                <span className='text-[10px]'>
                                    Customer Note:
                                </span>{' '}
                                <br />{' '}
                                <span className='line-clamp-3 max-w-[150px] text-xs whitespace-normal text-amber-600'>
                                    {order?.order_note}
                                </span>
                            </p>
                        )}

                        {/* Show Repeat/New badge with modal */}
                        {order?.customer_phone && (
                            <RepeatCustomerModal
                                phoneNumber={order.customer_phone}
                                customerName={order.customer_name}
                            />
                        )}
                    </div>
                </TableCell>
                <TableCell className='px-2'>
                    <span className='flex flex-col gap-1'>
                        {order?.order_date ? (
                            <>
                                <p>
                                    {format(
                                        new Date(order?.order_date),
                                        'dd MMM yyyy'
                                    )}
                                </p>
                                <p>
                                    {format(
                                        new Date(order?.order_date),
                                        'hh:mm a'
                                    )}
                                </p>
                            </>
                        ) : (
                            <p>N/A</p>
                        )}
                    </span>
                </TableCell>
                <TableCell className='min-w-[150px] space-y-1 px-4'>
                    {order?.products?.map((product: any, index: number) => (
                        <ul key={index} className='flex gap-2 text-xs'>
                            <div>
                                <Image
                                    src={getImgFullUrl(
                                        product?.product?.thumbnail
                                    )}
                                    alt='thumb'
                                    width={360}
                                    height={360}
                                    className='size-12 rounded-md'
                                />
                                <p className='pt-0.5'>
                                    {product?.selected_variant?.attribute_values
                                        ?.Size &&
                                        product.selected_variant.attribute_values.Size.trim()
                                            .length > 0 &&
                                        `Size: ${product.selected_variant.attribute_values.Size}`}
                                </p>
                            </div>

                            <span>
                                <Link
                                    href={`/admin/product-details/${product?.product?._id}`}
                                    target='_blank'
                                >
                                    <li className='cursor-pointer text-sm font-medium hover:underline'>
                                        {product?.selected_variant?.sku}
                                    </li>
                                </Link>
                                <li className='mt-0.5 text-sm font-medium text-green-600'>
                                    <span className='text-xs text-muted-foreground'>
                                        Order Qty:
                                    </span>{' '}
                                    <br />
                                    {product.total_quantity} pair/pcs
                                </li>
                            </span>

                            {product.status === 'returned' && (
                                <Badge variant='red' className='h-fit text-xs'>
                                    Returned
                                </Badge>
                            )}
                            {product.status !== 'returned' &&
                                order?.status === 'partial' && (
                                    <Badge
                                        variant='green'
                                        className='h-fit text-xs'
                                    >
                                        Delivered
                                    </Badge>
                                )}
                        </ul>
                    ))}
                </TableCell>
                <TableCell className='max-w-[250px] min-w-[250px] px-4'>
                    <span className='flex flex-col gap-1 text-wrap'>
                        <div className='flex flex-wrap items-center gap-2'>
                            <p>
                                {order?.customer_name} - {order?.customer_phone}
                            </p>
                        </div>
                        <p className='text-xs'>
                            {order?.delivery_address?.address} -{' '}
                            {order?.delivery_address?.district}
                        </p>

                        {/* Fraud Check Modal Trigger */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className='flex cursor-pointer space-x-2'>
                                    <FraudChecker
                                        loading={loading}
                                        fraudData={fraudData}
                                    />
                                </div>
                            </DialogTrigger>

                            <DialogContent className='max-w-md'>
                                <DialogHeader>
                                    <DialogTitle className='flex items-center gap-2'>
                                        {getStatusIcon()}
                                        Fraud Check Details
                                    </DialogTitle>
                                </DialogHeader>

                                <div className='mt-2 space-y-4'>
                                    {loading ? (
                                        <div className='flex items-center justify-center py-4'>
                                            <div className='flex items-center gap-2'>
                                                <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
                                                <p className='text-blue-600'>
                                                    Loading fraud data...
                                                </p>
                                            </div>
                                        </div>
                                    ) : fraudData?.error ? (
                                        <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                                            <div className='flex items-center gap-2 text-red-800'>
                                                <XCircleIcon className='h-5 w-5' />
                                                <p className='font-medium'>
                                                    Error
                                                </p>
                                            </div>
                                            <p className='mt-1 text-sm text-red-700'>
                                                {fraudData.error}
                                            </p>
                                        </div>
                                    ) : fraudData ? (
                                        <div className='space-y-4'>
                                            <div className='space-y-3'>
                                                <h4 className='border-b pb-2 text-sm font-semibold text-gray-700'>
                                                    Summary
                                                </h4>

                                                <div className='flex items-center justify-between rounded bg-gray-50 p-2'>
                                                    <span className='font-medium'>
                                                        Status:
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            fraudData.statusTag
                                                                ?.toLowerCase()
                                                                .includes(
                                                                    'risk'
                                                                )
                                                                ? 'red'
                                                                : fraudData.statusTag
                                                                        ?.toLowerCase()
                                                                        .includes(
                                                                            'safe'
                                                                        )
                                                                  ? 'green'
                                                                  : 'default'
                                                        }
                                                    >
                                                        {fraudData.statusTag ||
                                                            'N/A'}
                                                    </Badge>
                                                </div>

                                                <div className='space-y-2'>
                                                    <div className='flex items-center justify-between'>
                                                        <span className='font-medium'>
                                                            Success Rate:
                                                        </span>
                                                        <span className='font-semibold'>
                                                            {fraudData.successRate ||
                                                                0}
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className='h-2 w-full rounded-full bg-gray-200'>
                                                        <div
                                                            className={`h-2 rounded-full ${
                                                                (fraudData.successRate ||
                                                                    0) >= 80
                                                                    ? 'bg-green-500'
                                                                    : (fraudData.successRate ||
                                                                            0) >=
                                                                        50
                                                                      ? 'bg-yellow-500'
                                                                      : 'bg-red-500'
                                                            }`}
                                                            style={{
                                                                width: `${Math.min(fraudData.successRate || 0, 100)}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className='grid grid-cols-2 gap-3 text-sm'>
                                                    <div className='rounded bg-blue-50 p-2 text-center'>
                                                        <p className='font-semibold text-blue-700'>
                                                            {fraudData.totalParcels ||
                                                                0}
                                                        </p>
                                                        <p className='text-xs text-blue-600'>
                                                            Total Parcels
                                                        </p>
                                                    </div>
                                                    <div className='rounded bg-green-50 p-2 text-center'>
                                                        <p className='font-semibold text-green-700'>
                                                            {fraudData.totalDelivered ||
                                                                0}
                                                        </p>
                                                        <p className='text-xs text-green-600'>
                                                            Delivered
                                                        </p>
                                                    </div>
                                                    <div className='rounded bg-red-50 p-2 text-center'>
                                                        <p className='font-semibold text-red-700'>
                                                            {fraudData.totalCancel ||
                                                                0}
                                                        </p>
                                                        <p className='text-xs text-red-600'>
                                                            Cancelled
                                                        </p>
                                                    </div>
                                                    <div className='rounded bg-purple-50 p-2 text-center'>
                                                        <p className='font-semibold text-purple-700'>
                                                            {Math.abs(
                                                                (fraudData.totalParcels ||
                                                                    0) -
                                                                    (fraudData.totalDelivered ||
                                                                        0) -
                                                                    (fraudData.totalCancel ||
                                                                        0)
                                                            )}
                                                        </p>
                                                        <p className='text-xs text-purple-600'>
                                                            Pending
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {fraudData.apis &&
                                                Array.isArray(fraudData.apis) &&
                                                fraudData.apis.length > 0 && (
                                                    <div className='space-y-3'>
                                                        <h4 className='border-b pb-2 text-sm font-semibold text-gray-700'>
                                                            Courier Performance
                                                        </h4>

                                                        <div className='max-h-60 space-y-2 overflow-y-auto'>
                                                            {fraudData.apis.map(
                                                                (
                                                                    courier: CourierData,
                                                                    index: number
                                                                ) => {
                                                                    const totalParcels =
                                                                        courier?.totalOrders ||
                                                                        0;
                                                                    const totalDelivered =
                                                                        courier?.totalDelivered ||
                                                                        0;

                                                                    const courierSuccessRate =
                                                                        totalParcels >
                                                                        0
                                                                            ? (totalDelivered /
                                                                                  totalParcels) *
                                                                              100
                                                                            : 0;

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                courier.courierKey ||
                                                                                index
                                                                            }
                                                                            className='rounded-lg border bg-white p-3'
                                                                        >
                                                                            <div className='mb-2 flex items-center justify-between'>
                                                                                <span className='text-sm font-medium'>
                                                                                    {
                                                                                        courier.courierName
                                                                                    }
                                                                                </span>
                                                                                <Badge
                                                                                    variant={
                                                                                        courierSuccessRate >=
                                                                                        80
                                                                                            ? 'green'
                                                                                            : courierSuccessRate >=
                                                                                                50
                                                                                              ? 'yellow'
                                                                                              : 'red'
                                                                                    }
                                                                                    className='text-xs'
                                                                                >
                                                                                    {
                                                                                        courierSuccessRate
                                                                                    }

                                                                                    %
                                                                                </Badge>
                                                                            </div>

                                                                            <div className='mb-2 h-1.5 w-full rounded-full bg-gray-200'>
                                                                                <div
                                                                                    className={`h-1.5 rounded-full ${
                                                                                        courierSuccessRate >=
                                                                                        80
                                                                                            ? 'bg-green-500'
                                                                                            : courierSuccessRate >=
                                                                                                50
                                                                                              ? 'bg-yellow-500'
                                                                                              : 'bg-red-500'
                                                                                    }`}
                                                                                    style={{
                                                                                        width: `${Math.min(courierSuccessRate, 100)}%`
                                                                                    }}
                                                                                />
                                                                            </div>

                                                                            <div className='grid grid-cols-3 gap-2 text-xs'>
                                                                                <div className='text-center'>
                                                                                    <p className='font-semibold text-blue-600'>
                                                                                        {
                                                                                            courier.totalParcels
                                                                                        }
                                                                                    </p>
                                                                                    <p className='text-gray-500'>
                                                                                        Total
                                                                                    </p>
                                                                                </div>
                                                                                <div className='text-center'>
                                                                                    <p className='font-semibold text-green-600'>
                                                                                        {
                                                                                            courier.totalDelivered
                                                                                        }
                                                                                    </p>
                                                                                    <p className='text-gray-500'>
                                                                                        Delivered
                                                                                    </p>
                                                                                </div>
                                                                                <div className='text-center'>
                                                                                    <p className='font-semibold text-red-600'>
                                                                                        {
                                                                                            courier.totalCancelled
                                                                                        }
                                                                                    </p>
                                                                                    <p className='text-gray-500'>
                                                                                        Cancelled
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {courier.lastCourierSyncAt && (
                                                                                <p className='mt-2 text-right text-xs text-gray-400'>
                                                                                    Updated:{' '}
                                                                                    {new Date(
                                                                                        courier.lastCourierSyncAt
                                                                                    ).toLocaleDateString()}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            <div className='rounded-lg bg-gray-50 p-3 text-center'>
                                                <p className='text-sm font-medium text-gray-700'>
                                                    Overall Delivery Performance
                                                </p>
                                                <p className='mt-1 text-lg font-bold text-blue-600'>
                                                    {fraudData.successRate}%
                                                    Success Rate
                                                </p>
                                                <p className='mt-1 text-xs text-gray-500'>
                                                    Based on{' '}
                                                    {fraudData.totalParcels}{' '}
                                                    total parcels
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='p-4 text-center text-muted-foreground'>
                                            <AlertTriangle className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                                            <p>
                                                No fraud data available for this
                                                customer
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </span>
                </TableCell>

                <TableCell className='px-2'>
                    {' '}
                    TK {order?.COD?.toLocaleString()}
                </TableCell>
                <TableCell className='px-2'>
                    {order?.courier_cod_amount ? (
                        <span>
                            TK {order?.courier_cod_amount?.toLocaleString()}
                        </span>
                    ) : (
                        <span>-</span>
                    )}
                </TableCell>
                <TableCell className='px-2 text-center'>
                    <div className='flex flex-col items-center gap-1'>
                        <span>TK {order?.paid_amount?.toLocaleString()}</span>
                        {order?.manual_payment_info && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className='cursor-pointer text-xs text-blue-600 underline'>
                                        Pay Info
                                    </button>
                                </DialogTrigger>
                                <DialogContent className='max-w-md'>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Manual Payment Details
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className='mt-4 space-y-4'>
                                        {order?.manual_payment_info?.trxId && (
                                            <div className='flex items-center justify-between rounded-lg bg-gray-50 p-3'>
                                                <span className='text-sm font-medium'>
                                                    Transaction ID:
                                                </span>
                                                <span className='text-sm font-semibold'>
                                                    {
                                                        order
                                                            ?.manual_payment_info
                                                            ?.trxId
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        {order?.manual_payment_info
                                            ?.paid_amount && (
                                            <div className='flex items-center justify-between rounded-lg bg-green-50 p-3'>
                                                <span className='text-sm font-medium'>
                                                    Paid Amount:
                                                </span>
                                                <span className='text-sm font-semibold text-green-700'>
                                                    TK{' '}
                                                    {order?.manual_payment_info?.paid_amount?.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {order?.manual_payment_info
                                            ?.sender_number && (
                                            <div className='flex items-center justify-between rounded-lg bg-blue-50 p-3'>
                                                <span className='text-sm font-medium'>
                                                    Sender Number:
                                                </span>
                                                <span className='text-sm font-semibold text-blue-700'>
                                                    {
                                                        order
                                                            ?.manual_payment_info
                                                            ?.sender_number
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        {order?.manual_payment_info?.files &&
                                            order?.manual_payment_info?.files
                                                ?.length > 0 && (
                                                <div className='space-y-2'>
                                                    <p className='text-sm font-medium'>
                                                        Payment Proofs:
                                                    </p>
                                                    <div className='grid grid-cols-2 gap-2'>
                                                        {order?.manual_payment_info?.files?.map(
                                                            (
                                                                file: string,
                                                                index: number
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className='group relative'
                                                                >
                                                                    <Dialog>
                                                                        <DialogTrigger
                                                                            asChild
                                                                        >
                                                                            <div className='cursor-pointer overflow-hidden rounded-lg border transition-all hover:ring-2 hover:ring-blue-500'>
                                                                                <Image
                                                                                    src={getImgFullUrl(
                                                                                        file
                                                                                    )}
                                                                                    alt={`Payment proof ${index + 1}`}
                                                                                    width={
                                                                                        200
                                                                                    }
                                                                                    height={
                                                                                        200
                                                                                    }
                                                                                    className='h-32 w-full object-cover'
                                                                                />
                                                                                <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                                                                                    <span className='text-xs font-medium text-white'>
                                                                                        Click
                                                                                        to
                                                                                        view
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </DialogTrigger>
                                                                        <DialogContent className='max-w-3xl'>
                                                                            <div className='flex items-center justify-center'>
                                                                                <Image
                                                                                    src={getImgFullUrl(
                                                                                        file
                                                                                    )}
                                                                                    alt={`Payment proof ${index + 1}`}
                                                                                    width={
                                                                                        800
                                                                                    }
                                                                                    height={
                                                                                        800
                                                                                    }
                                                                                    className='max-h-[70vh] max-w-full rounded-lg object-contain'
                                                                                />
                                                                            </div>
                                                                            <div className='mt-4 flex justify-center gap-2'>
                                                                                <a
                                                                                    href={getImgFullUrl(
                                                                                        file
                                                                                    )}
                                                                                    download
                                                                                    target='_blank'
                                                                                    rel='noopener noreferrer'
                                                                                    className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
                                                                                >
                                                                                    Download
                                                                                </a>
                                                                            </div>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </TableCell>

                {/* order status  */}
                <TableCell className='max-w-[180px] px-2 whitespace-normal'>
                    <div className='flex flex-col items-center justify-center whitespace-nowrap'>
                        <OrderStatusBadge status={order?.status} />

                        {order?.assigned_business_location?.name && (
                            <p className='mt-1 text-center whitespace-normal'>
                                <span className='text-muted-foreground'>
                                    Assigned To:
                                </span>{' '}
                                {order?.assigned_business_location?.name}
                            </p>
                        )}

                        {/* Accept/Decline buttons for AWAITING_STOCK orders */}
                        {order?.status === OrderStatus.AWAITING_STOCK && (
                            <div className='mt-2 flex gap-2'>
                                <button
                                    onClick={handleAcceptOrder}
                                    disabled={isAccepting}
                                    className='flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    {isAccepting ? (
                                        <>
                                            <Loader2 className='h-3 w-3 animate-spin' />
                                            Accepting...
                                        </>
                                    ) : (
                                        'Accept'
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowDeclineDialog(true)}
                                    disabled={isDeclining}
                                    className='rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    Decline
                                </button>
                            </div>
                        )}

                        <Dialog>
                            <DialogTrigger asChild>
                                <button className='flex cursor-pointer items-center gap-1 pt-0.5 text-blue-600 hover:underline'>
                                    <Info size={14} />{' '}
                                    <span className='text-sm'>Status Logs</span>
                                </button>
                            </DialogTrigger>

                            <DialogContent className='max-w-md'>
                                <DialogHeader>
                                    <DialogTitle>Status History</DialogTitle>
                                </DialogHeader>

                                <div className='custom-scrollbar mt-4 max-h-96 space-y-4 overflow-y-auto'>
                                    {order?.status_history?.map(
                                        (item: any, index: number) => (
                                            <div
                                                key={item._id}
                                                className='group relative rounded-xl border border-gray-600/30 p-4 transition-all duration-300'
                                            >
                                                {index <
                                                    (order?.status_history
                                                        ?.length || 0) -
                                                        1 && (
                                                    <div className='absolute top-14 left-6 h-8 w-0.5 bg-blue-500/30'></div>
                                                )}

                                                <div className='flex items-start space-x-3'>
                                                    <div
                                                        className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ${
                                                            item.status ===
                                                            'completed'
                                                                ? 'animate-pulse bg-green-500'
                                                                : item.status ===
                                                                    'processing'
                                                                  ? 'bg-blue-500'
                                                                  : item.status ===
                                                                      'pending'
                                                                    ? 'bg-yellow-500'
                                                                    : item.status ===
                                                                        'cancelled'
                                                                      ? 'bg-red-500'
                                                                      : 'bg-purple-500'
                                                        }`}
                                                    ></div>

                                                    <div className='flex-1'>
                                                        <div
                                                            className={`mb-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                                item.status ===
                                                                'completed'
                                                                    ? 'border border-green-500/30 bg-green-500/20 text-green-400'
                                                                    : item.status ===
                                                                        'processing'
                                                                      ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
                                                                      : item.status ===
                                                                          'pending'
                                                                        ? 'border border-yellow-500/30 bg-yellow-500/20 text-yellow-400'
                                                                        : item.status ===
                                                                            'cancelled'
                                                                          ? 'border border-red-500/30 bg-red-500/20 text-red-400'
                                                                          : 'border border-purple-500/30 bg-purple-500/20 text-purple-400'
                                                            }`}
                                                        >
                                                            <span className='capitalize'>
                                                                {item.status ||
                                                                    'N/A'}
                                                            </span>
                                                        </div>

                                                        <div className='mb-2 flex items-center space-x-2 text-sm'>
                                                            <svg
                                                                className='h-4 w-4'
                                                                fill='none'
                                                                stroke='currentColor'
                                                                viewBox='0 0 24 24'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                                                />
                                                            </svg>
                                                            <span>
                                                                {new Date(
                                                                    item.changed_at
                                                                )
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
                                                                    .replace(
                                                                        ',',
                                                                        ''
                                                                    )}
                                                            </span>
                                                        </div>

                                                        <div className='flex items-center space-x-2 text-sm'>
                                                            <svg
                                                                className='h-4 w-4'
                                                                fill='none'
                                                                stroke='currentColor'
                                                                viewBox='0 0 24 24'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                                                />
                                                            </svg>
                                                            <span className=''>
                                                                Changed by:{' '}
                                                                <span className='font-medium text-blue-400'>
                                                                    {item
                                                                        .changed_by
                                                                        ?.full_name ||
                                                                        'N/A'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xs font-bold text-white'>
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className='mt-6 rounded-xl border border-gray-600/30 p-4'>
                                    <div className='flex items-center justify-between text-sm'>
                                        <span className=''>
                                            Total Status Changes:
                                        </span>
                                        <span className='font-semibold'>
                                            {order?.status_history?.length || 0}
                                        </span>
                                    </div>
                                    <div className='mt-2 flex items-center justify-between text-sm'>
                                        <span className=''>
                                            Current Status:
                                        </span>
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-semibold ${
                                                order?.status === 'completed'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : order?.status ===
                                                        'processing'
                                                      ? 'bg-blue-500/20 text-blue-400'
                                                      : order?.status ===
                                                          'pending'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : order?.status ===
                                                            'cancelled'
                                                          ? 'bg-red-500/20 text-red-400'
                                                          : 'bg-purple-500/20 text-purple-400'
                                            }`}
                                        >
                                            {order?.status || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </TableCell>
                {/* Have you called? action */}
                <TableCell className='max-w-[180px] min-w-[140px] px-2 text-center whitespace-normal'>
                    {order?.is_called ? (
                        <div className='flex flex-col items-center gap-1'>
                            <p className='text-sm font-medium text-green-700'>
                                Already called by{' '}
                                {latestCall?.called_by_name || 'N/A'}
                            </p>
                            {latestCall?.called_at && (
                                <p className='text-[11px] text-muted-foreground'>
                                    {format(
                                        new Date(latestCall.called_at),
                                        'dd MMM yyyy, hh:mm a'
                                    )}
                                </p>
                            )}

                            {callLogs.length > 1 && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className='flex cursor-pointer items-center gap-1 pt-0.5 text-blue-600 hover:underline'>
                                            <Info size={14} />{' '}
                                            <span className='text-xs'>
                                                Call History
                                            </span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className='max-w-md'>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Call History
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className='custom-scrollbar mt-4 max-h-96 space-y-3 overflow-y-auto'>
                                            {[...callLogs]
                                                .reverse()
                                                .map(
                                                    (
                                                        log: any,
                                                        index: number
                                                    ) => (
                                                        <div
                                                            key={
                                                                log?._id ||
                                                                index
                                                            }
                                                            className='rounded-lg border border-gray-600/30 p-3'
                                                        >
                                                            <p className='text-sm font-medium text-blue-600'>
                                                                {log?.called_by_name ||
                                                                    'N/A'}
                                                            </p>
                                                            {log?.called_at && (
                                                                <p className='mt-1 text-xs text-muted-foreground'>
                                                                    {format(
                                                                        new Date(
                                                                            log.called_at
                                                                        ),
                                                                        'dd MMM yyyy, hh:mm a'
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    ) : (
                        <div className='flex flex-col items-center gap-2'>
                            <p className='text-xs text-muted-foreground'>
                                Have you called?
                            </p>
                            <div className='flex gap-2'>
                                <button
                                    onClick={handleMarkAsCalled}
                                    disabled={isMarkingCalled}
                                    className='flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    {isMarkingCalled ? (
                                        <>
                                            <Loader2 className='h-3 w-3 animate-spin' />
                                            ...
                                        </>
                                    ) : (
                                        'Yes'
                                    )}
                                </button>
                                <button
                                    disabled={isMarkingCalled}
                                    className='rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    )}
                </TableCell>
                <TableCell className='max-w-[200px] min-w-[100px] px-2 whitespace-normal'>
                    <span className='text-muted-foreground'>Last Note: </span>{' '}
                    <br />
                    {order?.admin_notes?.length > 0 ? (
                        <p className='w-full text-sm text-wrap break-words text-yellow-600'>
                            {order?.admin_notes?.slice(-1)?.[0]?.note}
                        </p>
                    ) : (
                        'N/A'
                    )}
                </TableCell>

                {/* Track Order  */}
                <TableCell className='px-2'>
                    <p
                        className={cn(
                            order.consignment_id
                                ? 'text-black'
                                : 'text-muted-foreground'
                        )}
                    >
                        Parcel Id: {order?.consignment_id ?? 'N/A'}
                    </p>

                    {order?.tracking_code ? (
                        <Link
                            href={`https://steadfast.com.bd/t/${order?.tracking_code}`}
                            target='_blank'
                            className='text-blue-600 underline'
                        >
                            Track Order
                        </Link>
                    ) : (
                        <p className='text-muted-foreground'>
                            Tracking Link: N/A
                        </p>
                    )}

                    <Dialog>
                        {order?.logs?.length > 0 && (
                            <DialogTrigger asChild>
                                <button className='flex cursor-pointer items-center gap-1 pt-0.5 text-blue-600 hover:underline'>
                                    <Info size={14} />{' '}
                                    <span className='text-sm'>
                                        Tracking Logs
                                    </span>
                                </button>
                            </DialogTrigger>
                        )}

                        <DialogContent className='max-w-md'>
                            <DialogHeader>
                                <DialogTitle>Tracking Logs History</DialogTitle>
                            </DialogHeader>

                            <div className='custom-scrollbar mt-4 max-h-96 space-y-4 overflow-y-auto'>
                                {order?.logs?.length > 0 ? (
                                    order.logs.map(
                                        (log: any, index: number) => (
                                            <div
                                                key={log._id}
                                                className='group relative rounded-xl border border-gray-600/30 p-4 transition-all duration-300'
                                            >
                                                {index <
                                                    (order?.logs?.length || 0) -
                                                        1 && (
                                                    <div className='absolute top-14 left-6 h-8 w-0.5 bg-blue-500/30'></div>
                                                )}

                                                <div className='flex items-start space-x-3'>
                                                    <div
                                                        className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ${
                                                            index === 0
                                                                ? 'bg-green-500'
                                                                : index ===
                                                                    order.logs
                                                                        .length -
                                                                        1
                                                                  ? 'animate-pulse bg-blue-500'
                                                                  : 'bg-yellow-500'
                                                        }`}
                                                    ></div>

                                                    <div className='flex-1'>
                                                        <div
                                                            className={`mb-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                                index === 0
                                                                    ? 'border border-green-500/30 bg-green-500/20 text-green-400'
                                                                    : index ===
                                                                        order
                                                                            .logs
                                                                            .length -
                                                                            1
                                                                      ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
                                                                      : 'border border-yellow-500/30 bg-yellow-500/20 text-yellow-400'
                                                            }`}
                                                        >
                                                            <span className='capitalize'>
                                                                {index ===
                                                                order.logs
                                                                    .length -
                                                                    1
                                                                    ? 'Latest Update'
                                                                    : index ===
                                                                        0
                                                                      ? 'First Update'
                                                                      : `Update ${index + 1}`}
                                                            </span>
                                                        </div>

                                                        <p className='mb-2 text-sm font-medium'>
                                                            {log?.action}
                                                        </p>

                                                        <div className='mb-2 flex items-center space-x-2 text-sm'>
                                                            <svg
                                                                className='h-4 w-4'
                                                                fill='none'
                                                                stroke='currentColor'
                                                                viewBox='0 0 24 24'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                                                />
                                                            </svg>
                                                            <span>
                                                                {new Date(
                                                                    log?.time
                                                                )
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
                                                                    .replace(
                                                                        ',',
                                                                        ''
                                                                    )}
                                                            </span>
                                                        </div>

                                                        <div className='flex items-center space-x-2 text-sm'>
                                                            <svg
                                                                className='h-4 w-4'
                                                                fill='none'
                                                                stroke='currentColor'
                                                                viewBox='0 0 24 24'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                                                />
                                                            </svg>
                                                            <span className=''>
                                                                By:{' '}
                                                                <span className='font-medium text-blue-400'>
                                                                    {log?.user
                                                                        ?.full_name ||
                                                                        'System'}
                                                                </span>
                                                                <span className='ml-2 text-xs text-muted-foreground'>
                                                                    (
                                                                    {log?.user
                                                                        ?.role ||
                                                                        'User'}
                                                                    )
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xs font-bold text-white'>
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div className='py-8 text-center text-muted-foreground'>
                                        No logs available for this order.
                                    </div>
                                )}
                            </div>

                            <div className='mt-6 rounded-xl border border-gray-600/30 p-4'>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className=''>Total Logs:</span>
                                    <span className='font-semibold'>
                                        {order?.logs?.length || 0}
                                    </span>
                                </div>
                                <div className='mt-2 flex items-center justify-between text-sm'>
                                    <span className=''>Last Updated:</span>
                                    <span className='font-medium'>
                                        {order?.logs?.[0]?.time
                                            ? new Date(
                                                  order.logs[0].time
                                              ).toLocaleDateString('en-GB', {
                                                  day: '2-digit',
                                                  month: 'short',
                                                  year: 'numeric'
                                              })
                                            : 'N/A'}
                                    </span>
                                </div>
                                {order?.logs?.length > 0 && (
                                    <div className='mt-2 flex items-center justify-between text-sm'>
                                        <span className=''>
                                            Last Updated By:
                                        </span>
                                        <span className='font-medium text-blue-400'>
                                            {order?.logs?.[0]?.user
                                                ?.full_name || 'System'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </TableCell>

                <TableCell className='w-24 max-w-[200px] min-w-[100px] px-2 whitespace-normal'>
                    <p> {order?.user?.full_name || 'N/A'}</p>
                    <p className='text-[11px] text-green-700'>
                        {order?.user?.role || 'N/A'}
                    </p>
                </TableCell>
            </TableRow>

            {/* Decline Order Dialog */}
            {showDeclineDialog && (
                <Dialog
                    open={showDeclineDialog}
                    onOpenChange={setShowDeclineDialog}
                >
                    <DialogContent className='max-w-md'>
                        <DialogHeader>
                            <DialogTitle>Decline Order</DialogTitle>
                        </DialogHeader>
                        <div className='mt-4 space-y-4'>
                            <p className='text-sm text-gray-600'>
                                Are you sure you want to decline this order?
                                This action cannot be undone.
                            </p>
                            <div className='space-y-2'>
                                <label
                                    htmlFor='decline-reason'
                                    className='text-sm font-medium text-gray-700'
                                >
                                    Reason for declining (optional):
                                </label>
                                <textarea
                                    id='decline-reason'
                                    value={declineReason}
                                    onChange={(e) =>
                                        setDeclineReason(e.target.value)
                                    }
                                    placeholder='Enter reason for declining this order...'
                                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                    rows={3}
                                />
                            </div>
                            <div className='flex justify-end gap-3'>
                                <button
                                    onClick={() => {
                                        setShowDeclineDialog(false);
                                        setDeclineReason('');
                                    }}
                                    className='rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeclineOrder}
                                    disabled={isDeclining}
                                    className='flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    {isDeclining ? (
                                        <>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Declining...
                                        </>
                                    ) : (
                                        'Decline Order'
                                    )}
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
});

export default OrdersTableRow;
