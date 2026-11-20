'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Package,
    CheckCircle2,
    Truck,
    MapPin,
    Search,
    Loader2,
    TruckIcon
} from 'lucide-react';
import { useGetSingleTrackOrderQuery } from '@/shop/redux/api/order';
import { useGetPreOrderTrackingQuery } from '@/shop/redux/api/pre-order';
import { WHATSAPP_NUMBER } from '@/shop/config';
import { Input } from '@/shop/components/ui/input';
import { Button } from '@/shop/components/ui/button';

// Components
import OrderDetailsCard from './_components/OrderDetailsCard';
import OrderItemsCard from './_components/OrderItemsCard';
import OrderTimelineCard from './_components/OrderTimelineCard';

import React from 'react';
import TrackAnimation from './_components/TrackAnimation';
import PreOrderTrackResult from './_components/PreOrderTrackResult';

const page = () => {
    return (
        <Suspense
            fallback={
                <div className='p-20 text-center'>Loading Tracker...</div>
            }
        >
            <TrackOrderContent />
        </Suspense>
    );
};

export default page;

const TrackOrderContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Support both 'id' (from SMS link) and 'order' query parameters
    const idQuery = searchParams.get('id') || '';
    const orderQuery = searchParams.get('order') || '';
    // Use 'id' if present, otherwise fall back to 'order'
    const activeQuery = idQuery || orderQuery;
    // Pre-orders link here via ?type=pre-order&id=<serial>
    const isPreOrder = searchParams.get('type') === 'pre-order';

    const [searchInput, setSearchInput] = useState(activeQuery);

    // API Call - will fetch whenever activeQuery changes
    const { data, isFetching, isLoading, isError } =
        useGetSingleTrackOrderQuery(
            { track_id: activeQuery },
            { skip: !activeQuery || isPreOrder }
        );

    // Pre-order tracking (separate collection/endpoint)
    const {
        data: preOrderData,
        isFetching: preFetching,
        isError: preError
    } = useGetPreOrderTrackingQuery(
        { serial: activeQuery },
        { skip: !activeQuery || !isPreOrder }
    );
    const preOrderDetails = preOrderData?.data;

    const trackDetails = data?.data;
    const loading = isLoading || isFetching || preFetching;

    // Handle Search Submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/track?order=${searchInput.trim()}`);
        }
    };

    // Status Mapping Logic
    const getOrderSteps = (currentStatus: string, date: string) => {
        const statuses = [
            'PLACED',
            'IN_REVIEW',
            'HANDED_OVER_TO_COURIER',
            'DELIVERED'
        ];
        const currentIndex = statuses.indexOf(currentStatus);

        return [
            {
                id: 'placed',
                title: 'Order Placed',
                description: 'Your order has been received',
                date: date ? new Date(date).toLocaleString() : '',
                completed: currentIndex >= 0,
                active: currentStatus === 'PLACED',
                icon: Package
            },
            {
                id: 'confirmed',
                title: 'Confirmed',
                description: 'Order is being verified',
                date: '',
                completed: currentIndex >= 1,
                active: currentStatus === 'IN_REVIEW',
                icon: CheckCircle2
            },
            {
                id: 'transit',
                title: 'In Transit',
                description: 'Handed over to courier',
                date: '',
                completed: currentIndex >= 2,
                active:
                    currentStatus === 'HANDED_OVER_TO_COURIER' ||
                    currentStatus === 'IN_TRANSIT',
                icon: Truck
            },
            {
                id: 'delivered',
                title: 'Delivered',
                description: 'Successfully received',
                date: '',
                completed: currentIndex >= 3,
                active: currentStatus === 'DELIVERED',
                icon: MapPin
            }
        ];
    };

    return (
        <div className='min-h-screen bg-slate-50 p-2 pt-8 pb-12 sm:p-4 md:p-8 lg:pb-24'>
            <div className='mx-auto w-full space-y-2 sm:space-y-8 lg:max-w-6xl'>
                {/* Header & Search */}
                <div className='space-y-4 text-center'>
                    <div className='space-y-2'>
                        <div className='flex items-center justify-center'>
                            <TruckIcon />
                        </div>
                        <h1 className='lg-medium'>Track Your Order</h1>
                        <p className='base-normal'>
                            Enter your Order ID to see live updates
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className='mx-auto flex max-w-md items-center justify-center gap-2'
                    >
                        <div className='relative'>
                            <Search className='base-normal absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
                            <Input
                                placeholder='Order ID (e.g. 1003)'
                                className='pl-10'
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <Button type='submit' disabled={isFetching}>
                            {isFetching ? (
                                <Loader2 className='animate-spin' />
                            ) : (
                                'Track'
                            )}
                        </Button>
                    </form>
                </div>

                {/* State: Error or No Result */}
                {((!isFetching && isError && !isPreOrder) ||
                    (!preFetching && preError && isPreOrder)) && (
                    <div className='rounded-xl border bg-white py-10 text-center shadow-sm'>
                        <p className='font-medium text-red-500'>
                            {isPreOrder ? 'Pre-order' : 'Order'} not found.
                            Please check the ID.
                        </p>
                    </div>
                )}

                {/* Pre-order result */}
                {isPreOrder && preOrderDetails && !preFetching && !preError && (
                    <PreOrderTrackResult data={preOrderDetails} />
                )}

                {/* Result Area */}
                {!isPreOrder && trackDetails && !isFetching && !isError && (
                    <div className='grid animate-in gap-2 !text-[10px] duration-500 fade-in slide-in-from-bottom-4 sm:gap-8 lg:grid-cols-3'>
                        <OrderTimelineCard
                            orderSteps={getOrderSteps(
                                trackDetails.status,
                                trackDetails.order_date
                            )}
                            orderId={trackDetails.order_serial_id}
                            whatsappNumber={WHATSAPP_NUMBER}
                        />

                        <div className='space-y-2 sm:space-y-6 lg:col-span-2'>
                            <OrderDetailsCard
                                orderId={trackDetails?.order_serial_id.toString()}
                                trackingId={
                                    trackDetails?.tracking_code ||
                                    'Processing...'
                                }
                                invoiceNo={trackDetails?.invoice_number}
                                orderDate={new Date(
                                    trackDetails?.order_date
                                ).toLocaleString()}
                                status={trackDetails.status}
                                paymentStatus={
                                    trackDetails.paid_amount >=
                                    trackDetails.payable_amount
                                        ? 'PAID'
                                        : 'PENDING'
                                }
                                orderNote={trackDetails?.order_note}
                            />

                            <OrderItemsCard
                                items={trackDetails?.products?.map(
                                    (p: any) => ({
                                        id: p?.product?.id,
                                        name: p?.product?.name,
                                        sku: p?.selected_variant?.sku,
                                        quantity: p?.total_quantity,
                                        price: p?.selected_variant?.sale_price,
                                        image: p?.product?.thumbnail
                                    })
                                )}
                                shippingCost={trackDetails?.delivery_charge}
                                trackDetails={trackDetails}
                            />
                        </div>
                    </div>
                )}

                {/* Loading Skeleton Placeholder */}
                {loading && <TrackAnimation />}
            </div>
        </div>
    );
};
