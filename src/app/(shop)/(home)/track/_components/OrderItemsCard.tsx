import React from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '@/shop/components/ui/card';
import { Separator } from '@/shop/components/ui/separator';
import { getMediaUrl } from '@/shop/lib/get-media-url';

interface OrderItem {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    image: string;
}

interface OrderItemsCardProps {
    items: OrderItem[];
    shippingCost: number;
    currencySymbol?: string;
    trackDetails?: any;
}

const OrderItemsCard: React.FC<OrderItemsCardProps> = ({
    items,
    shippingCost,
    currencySymbol = '৳',
    trackDetails
}) => {
    // Calculate subtotal dynamically based on items array
    /* const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  ); */

    const subtotal = trackDetails?.sub_total || 0;
    const total_discount = trackDetails?.total_discount || 0;
    const delivery_charge = trackDetails?.delivery_charge || 0;
    const total_amount = trackDetails?.total_amount || 0;
    const advanced_amount = trackDetails?.paid_amount || 0;
    const cod_amount = trackDetails?.payable_amount || 0;

    const total = subtotal + shippingCost;
    return (
        <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
            <CardHeader>
                <CardTitle className='base-normal flex items-center gap-2'>
                    <Package className='h-6 w-6' />
                    Order Items ({items.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Scrollable area if there are many items */}
                <div className='space-y-4'>
                    {items?.map((item) => (
                        <div
                            key={item.id}
                            className='flex items-center gap-4 rounded-lg bg-slate-50 p-4'
                        >
                            <div className='flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm'>
                                <Image
                                    height={80}
                                    width={80}
                                    src={getMediaUrl(item?.image)}
                                    alt={item?.name}
                                    className='h-full w-full object-cover'
                                />
                            </div>

                            <div className='flex w-full flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0'>
                                <div className='min-w-0 flex-1'>
                                    <h3 className='base-medium truncate font-normal text-slate-900'>
                                        {item.name}
                                    </h3>
                                    <p className='xs-normal mt-1 text-slate-600'>
                                        SKU: {item?.sku}
                                    </p>
                                    <div className='mt-2 flex items-center gap-4'>
                                        <span className='xs-normal text-slate-600'>
                                            Qty:{' '}
                                            <span className='font-medium'>
                                                {item?.quantity}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div className='text-left sm:text-right'>
                                    <span className='base-medium text-base font-normal text-slate-900'>
                                        {currencySymbol}
                                        {item?.price * item?.quantity}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Separator className='my-6' />

                {/* Pricing Summary */}
                <div className='space-y-3'>
                    <ContentList title='Subtotal' content={subtotal} />
                    <ContentList title='Discount' content={total_discount} />
                    <ContentList
                        title='Delivery Charge'
                        content={delivery_charge}
                    />
                    <ContentList title='Total Amount' content={total_amount} />
                    <ContentList
                        title='Advanced Amount'
                        content={advanced_amount}
                    />

                    {/* <Separator />
          <div className="flex justify-between font-medium text-sm text-slate-900">
            <span>Payable Amount:</span>
            <span className="text-primary">
              {currencySymbol}
              {cod_amount}
            </span>
          </div> */}
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderItemsCard;

interface IProps {
    currencySymbol?: string;
    title: string;
    content: string;
}
const ContentList = ({ currencySymbol = '৳', title, content }: IProps) => {
    return (
        <div className='flex justify-between text-slate-600'>
            <span className='sm-normal'>{title}:</span>
            <span className='sm-normal'>
                {currencySymbol}
                {content}
            </span>
        </div>
    );
};
