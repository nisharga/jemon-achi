'use client';

import { Badge } from '@/components/ui/admin-badge';
import { useGetAllAssignedOrdersQuery } from '@/redux/admin/api/assigned-order-api';
import { useGetAllOrdersQuery } from '@/redux/admin/api/order-api';
import { TOrder } from '@/types/admin/order';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const OrderTabs = () => {
    // === pathname ===
    const pathname = usePathname();

    // === get all orders ===
    const { data, isLoading, isFetching } = useGetAllOrdersQuery({
        page: 1,
        limit: 20,
        searchQuery: '',
        filter: ''
    });
    const orders = data?.data?.data;

    // === assigned orders ===
    const { data: assignedOrderData } = useGetAllAssignedOrdersQuery({
        page: 1,
        limit: 20
    });
    const assignedOrdersMeta = assignedOrderData?.data?.meta;

    // === count orders for each status ===
    const statusCounts = {
        INCOMPLETE:
            orders?.filter((order: TOrder) => order?.status === 'INCOMPLETE')
                ?.length || 0,
        PLACED:
            orders?.filter((order: TOrder) => order?.status === 'PLACED')
                ?.length || 0,
        IN_REVIEW:
            orders?.filter((order: TOrder) => order?.status === 'IN_REVIEW')
                ?.length || 0,
        HANDED_OVER_TO_COURIER:
            orders?.filter(
                (order: TOrder) => order?.status === 'HANDED_OVER_TO_COURIER'
            )?.length || 0,
        IN_TRANSIT:
            orders?.filter((order: TOrder) => order?.status === 'IN_TRANSIT')
                ?.length || 0,
        DELIVERED:
            orders?.filter((order: TOrder) => order?.status === 'DELIVERED')
                ?.length || 0,
        RETURN_REQUESTED:
            orders?.filter(
                (order: TOrder) => order?.status === 'RETURN_REQUESTED'
            )?.length || 0,
        RETURNED:
            orders?.filter((order: TOrder) => order?.status === 'RETURNED')
                ?.length || 0,
        CANCELLED:
            orders?.filter((order: TOrder) => order?.status === 'CANCELLED')
                ?.length || 0,
        FAILED:
            orders?.filter((order: TOrder) => order?.status === 'FAILED')
                ?.length || 0,
        NO_RESPONSE:
            orders?.filter((order: TOrder) => order?.status === 'NO_RESPONSE')
                ?.length || 0
    };

    // === making tabs array ==
    const TABS = [
        {
            label: `All - ${orders?.length || 0}`,
            url: `/admin/orders`
        },
        {
            label: `Assigned - ${assignedOrdersMeta?.total || 0}`,
            url: `/admin/assigned-orders`
        },
        {
            label: `Placed - ${statusCounts.PLACED}`,
            url: `/admin/new-orders`
        },
        {
            label: `In Transit - ${statusCounts.IN_TRANSIT}`,
            url: `/admin/in-transit-orders`
        },
        {
            label: `Delivered - ${statusCounts.DELIVERED}`,
            url: `/admin/delivered-orders`
        },
        {
            label: `Cancelled - ${statusCounts.CANCELLED}`,
            url: `/admin/cancelled-orders`
        },
        {
            label: `Returned - ${statusCounts.RETURNED}`,
            url: `/admin/returned-orders`
        },
        {
            label: `Failed - ${statusCounts.FAILED}`,
            url: `/admin/failed-orders`
        },
        {
            label: `Incomplete - ${statusCounts.INCOMPLETE}`,
            url: `/admin/incomplete-orders`
        },
        {
            label: `No Response - ${statusCounts.NO_RESPONSE}`,
            url: `/admin/no-response`
        }
    ];

    // === handling loading state ===
    if (isLoading || isFetching) {
        <div className='animate-skeleton h-14 rounded-md bg-secondary' />;
    }
    return (
        <div className='flex flex-wrap items-center gap-2 rounded-md bg-background p-2 shadow-lg'>
            {TABS.map((tab, index) => {
                const isActive = pathname === tab.url;
                return (
                    <Badge
                        key={index}
                        variant={isActive ? 'default' : 'outline'}
                        className='p-0'
                    >
                        <Link href={tab.url} className='px-3 py-1 text-base'>
                            {tab.label}
                        </Link>
                    </Badge>
                );
            })}
        </div>
    );
};

export default OrderTabs;
