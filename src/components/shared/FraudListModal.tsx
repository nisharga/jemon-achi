import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    AlertTriangle,
    CheckCircleIcon,
    XCircle as XCircleIcon
} from 'lucide-react';
import { Badge } from '../ui/admin-badge';
import FraudChecker from '@/app/(admin)/admin/(orders)/orders/_components/FraudChecker';

const FraudListModal = ({ fraudData, loading, className }: any) => {
    const getStatusIcon = () => {
        if (loading)
            return (
                <div className='h-2.5 w-2.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
            );
        if (fraudData?.error)
            return <XCircleIcon className='h-2.5 w-2.5 text-red-500' />;
        if (!fraudData)
            return <AlertTriangle className='h-2.5 w-2.5 text-gray-500' />;

        const successRate = fraudData?.successRate || 0;
        if (successRate >= 80)
            return <CheckCircleIcon className='h-3 w-3 text-green-500' />;
        if (successRate >= 50)
            return <AlertTriangle className='h-3 w-3 text-yellow-500' />;
        return <AlertTriangle className='h-3 w-3 text-red-500' />;
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className={`flex cursor-pointer flex-col items-center justify-center space-x-2 ${className}`}
                >
                    <FraudChecker loading={loading} fraudData={fraudData} />
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
                                <p className='font-medium'>Error</p>
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
                                    <span className='font-medium'>Status:</span>
                                    <Badge
                                        variant={
                                            fraudData.statusTag
                                                ?.toLowerCase()
                                                .includes('risk')
                                                ? 'red'
                                                : fraudData.statusTag
                                                        ?.toLowerCase()
                                                        .includes('safe')
                                                  ? 'green'
                                                  : 'default'
                                        }
                                    >
                                        {fraudData.statusTag || 'N/A'}
                                    </Badge>
                                </div>

                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <span className='font-medium'>
                                            Success Rate:
                                        </span>
                                        <span className='font-semibold'>
                                            {fraudData.successRate || 0}%
                                        </span>
                                    </div>
                                    <div className='h-2 w-full rounded-full bg-gray-200'>
                                        <div
                                            className={`h-2 rounded-full ${
                                                (fraudData.successRate || 0) >=
                                                80
                                                    ? 'bg-green-500'
                                                    : (fraudData.successRate ||
                                                            0) >= 50
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
                                            {fraudData.totalParcels || 0}
                                        </p>
                                        <p className='text-xs text-blue-600'>
                                            Total Parcels
                                        </p>
                                    </div>
                                    <div className='rounded bg-green-50 p-2 text-center'>
                                        <p className='font-semibold text-green-700'>
                                            {fraudData.totalDelivered || 0}
                                        </p>
                                        <p className='text-xs text-green-600'>
                                            Delivered
                                        </p>
                                    </div>
                                    <div className='rounded bg-red-50 p-2 text-center'>
                                        <p className='font-semibold text-red-700'>
                                            {fraudData.totalCancel || 0}
                                        </p>
                                        <p className='text-xs text-red-600'>
                                            Cancelled
                                        </p>
                                    </div>
                                    <div className='rounded bg-purple-50 p-2 text-center'>
                                        <p className='font-semibold text-purple-700'>
                                            {Math.abs(
                                                (fraudData.totalParcels || 0) -
                                                    (fraudData.totalDelivered ||
                                                        0) -
                                                    (fraudData.totalCancel || 0)
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
                                                    courier: any,
                                                    index: number
                                                ) => {
                                                    const totalParcels =
                                                        courier?.totalOrders ||
                                                        0;
                                                    const totalDelivered =
                                                        courier?.totalDelivered ||
                                                        0;

                                                    const courierSuccessRate =
                                                        totalParcels > 0
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
                                                                        width: `${Math.min(
                                                                            courierSuccessRate,
                                                                            100
                                                                        )}%`
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
                                    {fraudData.successRate}% Success Rate
                                </p>
                                <p className='mt-1 text-xs text-gray-500'>
                                    Based on {fraudData.totalParcels} total
                                    parcels
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className='p-4 text-center text-muted-foreground'>
                            <AlertTriangle className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                            <p>No fraud data available for this customer</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FraudListModal;
