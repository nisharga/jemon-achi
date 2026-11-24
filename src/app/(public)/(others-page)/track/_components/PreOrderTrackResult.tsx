'use client';

import React from 'react';
import Image from 'next/image';
import {
    Package,
    BadgeCheck,
    Ship,
    Truck,
    MapPin,
    CheckCircle2
} from 'lucide-react';
import { getMediaUrl } from '@/shop/lib/get-media-url';

type PreOrderTrack = {
    invoice_number: string;
    pre_order_serial_id: number;
    status: string;
    source_type: 'LISTED' | 'EXTERNAL';
    product_name?: string;
    product_image?: string;
    reference?: { product_name?: string; images?: string[] };
    quantity: number;
    tracking_code?: string;
    estimated_delivery_time?: string;
    createdAt?: string;
    status_history?: { status: string; changed_at: string }[];
};

// Map a granular pre-order status to a macro stage index (0-4)
const STAGE_OF: Record<string, number> = {
    REQUESTED: 0,
    QUOTED: 0,
    CONFIRMED: 1,
    PURCHASED: 2,
    SHIPPED_TO_BD: 2,
    ARRIVED_IN_BD: 3,
    READY_FOR_DELIVERY: 3,
    HANDED_OVER_TO_COURIER: 4,
    IN_TRANSIT: 4,
    DELIVERED: 5
};

const STAGES = [
    { title: 'Requested', description: 'Pre-order received', icon: Package },
    { title: 'Confirmed', description: 'Advance confirmed', icon: BadgeCheck },
    {
        title: 'Shipping (China → BD)',
        description: 'Sourced & in transit',
        icon: Ship
    },
    {
        title: 'Arrived in Bangladesh',
        description: 'Received & processing',
        icon: MapPin
    },
    {
        title: 'Out for Delivery',
        description: 'Handed to courier',
        icon: Truck
    },
    { title: 'Delivered', description: 'Received by you', icon: CheckCircle2 }
];

export default function PreOrderTrackResult({ data }: { data: PreOrderTrack }) {
    const currentStage = STAGE_OF[data.status] ?? 0;
    const isTerminal = ['CANCELLED', 'RETURNED', 'ON_HOLD'].includes(
        data.status
    );
    const name =
        data.source_type === 'LISTED'
            ? data.product_name
            : data.reference?.product_name;
    const image =
        data.source_type === 'LISTED'
            ? data.product_image
            : data.reference?.images?.[0];

    return (
        <div className='grid animate-in gap-4 duration-500 fade-in slide-in-from-bottom-4 sm:gap-8 lg:grid-cols-3'>
            {/* Timeline */}
            <div className='rounded-xl border bg-white p-4 shadow-sm sm:p-6'>
                <h3 className='mb-1 font-semibold'>
                    Pre-Order {data.invoice_number}
                </h3>
                {isTerminal ? (
                    <p className='mb-4 text-sm text-red-500 capitalize'>
                        Status: {data.status.toLowerCase()}
                    </p>
                ) : (
                    <p className='mb-4 text-sm text-gray-600'>Live status</p>
                )}
                <div className='space-y-4'>
                    {STAGES.map((stage, i) => {
                        const completed = i < currentStage;
                        const active = i === currentStage;
                        const Icon = stage.icon;
                        return (
                            <div key={stage.title} className='flex gap-3'>
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                        completed
                                            ? 'bg-emerald-500 text-white'
                                            : active
                                              ? 'bg-[#ff5c00] text-white'
                                              : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    <Icon className='h-4 w-4' />
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-medium ${
                                            active ? 'text-primary-ink' : ''
                                        }`}
                                    >
                                        {stage.title}
                                    </p>
                                    <p className='text-xs text-gray-600'>
                                        {stage.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Details */}
            <div className='space-y-4 lg:col-span-2'>
                <div className='rounded-xl border bg-white p-4 shadow-sm sm:p-6'>
                    <h3 className='mb-3 font-semibold'>Details</h3>
                    <div className='flex items-center gap-3'>
                        {image && (
                            <Image
                                src={getMediaUrl(image)}
                                alt={name || 'product'}
                                width={64}
                                height={64}
                                className='h-16 w-16 rounded border object-cover'
                            />
                        )}
                        <div>
                            <p className='font-medium'>{name}</p>
                            <p className='text-sm text-gray-600'>
                                Quantity: {data.quantity}
                            </p>
                            {data.tracking_code && (
                                <p className='text-sm text-gray-600'>
                                    Tracking: {data.tracking_code}
                                </p>
                            )}
                        </div>
                    </div>
                    {data.estimated_delivery_time && (
                        <p className='mt-3 text-sm text-gray-600'>
                            Estimated delivery: {data.estimated_delivery_time}
                        </p>
                    )}
                </div>

                {data.status_history && data.status_history.length > 0 && (
                    <div className='rounded-xl border bg-white p-4 shadow-sm sm:p-6'>
                        <h3 className='mb-3 font-semibold'>History</h3>
                        <div className='space-y-2'>
                            {data.status_history.map((h, i) => (
                                <div
                                    key={i}
                                    className='flex items-center justify-between border-b pb-2 text-sm last:border-0'
                                >
                                    <span className='capitalize'>
                                        {h.status
                                            .split('_')
                                            .join(' ')
                                            .toLowerCase()}
                                    </span>
                                    <span className='text-xs text-gray-600'>
                                        {h.changed_at
                                            ? new Date(
                                                  h.changed_at
                                              ).toLocaleString()
                                            : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
