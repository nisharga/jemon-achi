import React, { useState } from 'react';
import { Package, Copy, CreditCard } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '@/shop/components/ui/card';
import { Button } from '@/shop/components/ui/button';
import { Badge } from '@/shop/components/ui/badge';
import { Separator } from '@/shop/components/ui/separator';
import { toast } from 'sonner'; // Or your preferred toast library

interface OrderDetailsCardProps {
    orderId: string;
    trackingId: string;
    invoiceNo: string;
    orderDate: string;
    status: string;
    paymentStatus: 'PAID' | 'UNPAID' | 'PENDING';
    orderNote?: string;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({
    orderId,
    trackingId,
    invoiceNo,
    orderDate,
    status,
    paymentStatus,
    orderNote
}) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(`${field} copied to clipboard`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
            <CardHeader>
                <CardTitle className='base-normal flex items-center gap-2'>
                    <Package className='h-6 w-6' />
                    Order Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='grid gap-6 md:grid-cols-2'>
                    <div className='space-y-4'>
                        {/* Order ID */}
                        <div className='base-normal flex items-center justify-between'>
                            <span className='text-slate-600'>Order ID:</span>
                            <div className='flex items-center gap-2'>
                                <span className='base-normal font-mono font-normal'>
                                    {orderId}
                                </span>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                        copyToClipboard(orderId, 'orderId')
                                    }
                                    className='h-6 w-6 p-0'
                                >
                                    <Copy className='h-3 w-3' />
                                </Button>
                                {copiedField === 'orderId' && (
                                    <span className='base-normal animate-pulse text-green-600'>
                                        Copied!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Tracking ID */}
                        <div className='base-normal flex items-start justify-between'>
                            <span className='text-slate-600'>Tracking ID:</span>
                            <div className='flex max-w-48 items-center gap-2'>
                                <span className='base-normal truncate font-mono break-all'>
                                    {trackingId.slice(0, 14)}...
                                </span>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                        copyToClipboard(
                                            trackingId,
                                            'trackingId'
                                        )
                                    }
                                    className='h-6 w-6 flex-shrink-0 p-0'
                                >
                                    <Copy className='h-3 w-3' />
                                </Button>
                                {copiedField === 'trackingId' && (
                                    <span className='base-normal animate-pulse text-green-600'>
                                        Copied!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Invoice */}
                        <div className='base-normal flex items-center justify-between'>
                            <span className='base-normal text-slate-600'>
                                Invoice:
                            </span>
                            <span className='base-normal font-mono font-normal'>
                                {invoiceNo}
                            </span>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        {/* Order Date */}
                        <div className='base-normal flex items-center justify-between'>
                            <span className='base-normal text-slate-600'>
                                Order Date:
                            </span>
                            <span className='base-normal font-normal'>
                                {orderDate}
                            </span>
                        </div>

                        {/* Status */}
                        <div className='base-normal flex items-center justify-between'>
                            <span className='base-normal text-slate-600'>
                                Status:
                            </span>
                            <Badge className='base-normal bg-primary !text-[10px] uppercase hover:bg-[#4a8291]'>
                                {status}
                            </Badge>
                        </div>

                        {/* Payment Status */}
                        <div className='base-normal flex items-center justify-between'>
                            <span className='base-normal text-slate-600'>
                                Payment:
                            </span>
                            <Badge
                                variant='outline'
                                className={`base-normal ${
                                    paymentStatus === 'PAID'
                                        ? 'border-emerald-300 text-green-600'
                                        : 'border-amber-300 text-amber-600'
                                } !text-[10px]`}
                            >
                                <CreditCard className='mr-1 h-3 w-3' />
                                {paymentStatus}
                            </Badge>
                        </div>
                    </div>
                </div>

                {orderNote && (
                    <>
                        <Separator className='my-6' />
                        <div className='rounded-lg bg-slate-50 p-4'>
                            <h4 className='base-normal'>Order Note:</h4>
                            <p className='xs-normal text-slate-600 italic'>
                                {orderNote}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default OrderDetailsCard;
