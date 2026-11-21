'use client';

import { Badge } from '@/components/ui/admin-badge';
import { OrderStatus } from '@/types/order';
import { Options } from 'nuqs';
import React from 'react';

type OrderStatusTotals = {
    all: number;
    placed: number;
    in_transit: number;
    delivered: number;
    cancelled: number;
    returned: number;
    failed: number;
    incomplete: number;
    in_review: number;
    handed_over_to_courier: number;
    return_requested: number;
    partial: number;
    full_returned: number;
    pending_return: number;
    no_response: number;
    pre_order: number;
    awaiting_stock: number;
    accepted: number;
    assigned?: number; // Add assigned if needed
};

type OrderTabsProps = {
    orderStatus: string;
    setOrderStatus: (
        value: string | ((old: string | null) => string | null) | null,
        options?: Options | undefined
    ) => Promise<URLSearchParams>;
    statusCount: OrderStatusTotals;
    processingOrderStatusCounts?: Partial<OrderStatusTotals>;
    processingAssignedOrderStatusCounts?: Partial<OrderStatusTotals>;
    setaAsignedBusinessLocation?: React.Dispatch<React.SetStateAction<string>>;
};

const OrderTabsV2 = ({
    orderStatus,
    setOrderStatus,
    processingOrderStatusCounts,
    processingAssignedOrderStatusCounts,
    setaAsignedBusinessLocation
}: OrderTabsProps) => {
    // Use assigned counts if available, otherwise fall back to regular counts
    const countsToUse =
        processingAssignedOrderStatusCounts || processingOrderStatusCounts;
    // console.log(countsToUse, "countsToUse");

    const TABS = [
        { label: `All - ${countsToUse?.all || 0}`, status: '' },
        {
            label: `Placed - ${countsToUse?.placed || 0}`,
            status: OrderStatus.PLACED
        },
        {
            label: `Accepted - ${countsToUse?.accepted || 0}`,
            status: OrderStatus.ACCEPTED
        },
        {
            label: `In Review - ${countsToUse?.in_review || 0}`,
            status: OrderStatus.IN_REVIEW
        },
        {
            label: `Handed over to courier - ${
                countsToUse?.handed_over_to_courier || 0
            }`,
            status: OrderStatus.HANDED_OVER_TO_COURIER
        },
        {
            label: `In Transit - ${countsToUse?.in_transit || 0}`,
            status: OrderStatus.IN_TRANSIT
        },
        {
            label: `Delivered - ${countsToUse?.delivered || 0}`,
            status: OrderStatus.DELIVERED
        },
        {
            label: `Pending Return - ${countsToUse?.pending_return || 0}`,
            status: OrderStatus.PENDING_RETURN
        },
        {
            label: `Partial - ${countsToUse?.partial || 0}`,
            status: OrderStatus.PARTIAL
        },
        {
            label: `Returned Requested - ${countsToUse?.return_requested || 0}`,
            status: OrderStatus.RETURN_REQUESTED
        },
        {
            label: `Returned - ${countsToUse?.returned || 0}`,
            status: OrderStatus.RETURNED
        },
        {
            label: `Cancelled - ${countsToUse?.cancelled || 0}`,
            status: OrderStatus.CANCELLED
        },
        {
            label: `Failed - ${countsToUse?.failed || 0}`,
            status: OrderStatus.FAILED
        },
        {
            label: `Incomplete - ${countsToUse?.incomplete || 0}`,
            status: OrderStatus.INCOMPLETE
        },
        {
            label: `No Response - ${countsToUse?.no_response || 0}`,
            status: OrderStatus.NO_RESPONSE
        },
        {
            label: `Pre Order - ${countsToUse?.pre_order || 0}`,
            status: OrderStatus.PRE_ORDER
        },
        {
            label: `Awaiting Stock - ${countsToUse?.awaiting_stock || 0}`,
            status: OrderStatus.AWAITING_STOCK
        }

        // {
        //  label: `Processing - ${countsToUse?.processing || 0}`,
        //  status: OrderStatus.PROCESSING,
        // },
    ];

    return (
        <div className='flex flex-wrap items-center gap-4 rounded-md bg-background p-2 shadow-md lg:p-4'>
            {TABS.map((tab, index) => {
                const statusToSet = tab.status === '' ? null : tab.status;
                const isActive =
                    tab.status === ''
                        ? !orderStatus
                        : orderStatus === tab.status;

                return (
                    <Badge
                        key={index}
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => {
                            setOrderStatus(statusToSet);
                            // Reset assigned business location when "All" tab is clicked
                            if (
                                tab.status === '' &&
                                setaAsignedBusinessLocation
                            ) {
                                setaAsignedBusinessLocation('');
                            }
                        }}
                        className='text-sm hover:cursor-pointer'
                    >
                        {tab.label}
                    </Badge>
                );
            })}
        </div>
    );
};

export default OrderTabsV2;
