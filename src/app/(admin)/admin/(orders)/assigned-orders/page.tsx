'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Pagination from '@/admin/components/shared/pagination';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { DateRange } from 'react-day-picker';
import {
    parseAsIsoDate,
    parseAsString,
    useQueryState,
    useQueryStates
} from 'nuqs';
import useDebounce from '@/admin/hooks/use-debounce';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/admin/components/ui/accordion';
import { Filter } from 'lucide-react';
import { Input } from '@/admin/components/ui/input';
import { DateRangeCalendar } from '@/admin/components/ui/date-range-calendar';
import { Button } from '@/admin/components/ui/button';
import { Label } from '@/admin/components/ui/label';
import {
    SelectItem,
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import OrderTabsV2 from '../_components/order-tabs-v2';
import { useOrderData } from '@/admin/hooks/useOrderData';
import { OrdersTable } from '../orders/_components/orders-table';

const AssignedOrdersComponent = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.ORDER_VIEW]
    });

    // === query states ===
    const [orderStatus, setOrderStatus] = useQueryState('status');
    const [assignedBusinessLocation, setaAsignedBusinessLocation] =
        useState('');

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);
    const [searchQuery, setSearchQuery] = useQueryState('searchQuery');
    const [businessLocation, setBusinessLocation] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery);
    const [sku, setSku] = useQueryState('sku');
    const debouncedSku = useDebounce(sku);

    // === date range state ===
    const [{ from, to, selectedOption }, setDateRangeAndOption] =
        useQueryStates(
            {
                from: parseAsIsoDate,
                to: parseAsIsoDate,
                selectedOption: parseAsString.withDefault('All Time')
            },
            { history: 'replace' }
        );

    const dateRange: DateRange | undefined =
        from && to ? { from, to } : undefined;

    // === use the unified order data hook with isAssignedOrders: true ===
    const {
        currentData: orders,
        currentMeta: ordersMeta,
        currentStatusCounts,
        statusCount,
        businessLocationOptions,
        isLoading,
        isFetching
    } = useOrderData({
        page,
        limit,
        searchQuery: debouncedSearchQuery,
        businessLocation,
        sku: debouncedSku,
        orderStatus,
        from,
        created_by: '',
        to,
        assignedBusinessLocation,
        isAllOrdersRoute: true, // Use main orders query
        isAssignedOrders: true // IMPORTANT: This tells the hook to use assigned orders queries
    });

    const handleClearFilter = () => {
        setDateRangeAndOption({
            from: null,
            to: null,
            selectedOption: 'All Time'
        });
        setSearchQuery(null);
        setSku(null);
        setBusinessLocation('');
        setOrderStatus(null);
    };

    // === pagination handlers ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    useEffect(() => {
        setPage(1);
    }, [limit, searchQuery, sku, businessLocation, from, to, orderStatus]);

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>
                    Assigned Orders ({ordersMeta?.total || 0})
                </h1>
            </div>

            {/* search filter */}
            <div className='rounded-lg bg-background shadow-md'>
                <Accordion type='single' collapsible defaultValue='item-1'>
                    <AccordionItem value='item-1'>
                        <AccordionTrigger
                            isHideChevron={true}
                            className='rounded-b-none border-b p-4 text-lg font-medium hover:cursor-pointer hover:no-underline'
                        >
                            <span className='flex items-center gap-2 text-emerald-600'>
                                <Filter className='size-5' /> Filter
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className='flex flex-wrap gap-6 px-4 pt-4'>
                                <div className='w-80 space-y-2'>
                                    <p className='text-sm font-medium'>
                                        Search
                                    </p>
                                    <Input
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder='Order id, phone, tracking code'
                                        value={searchQuery ? searchQuery : ''}
                                    />
                                </div>
                                <div className='w-80 space-y-2'>
                                    <p className='text-sm font-medium'>SKU</p>
                                    <Input
                                        onChange={(e) => setSku(e.target.value)}
                                        placeholder='521CL-5'
                                        value={sku ? sku : ''}
                                    />
                                </div>

                                {/* filter by date range */}
                                <div className='space-y-2 lg:col-span-2'>
                                    <p className='text-sm font-medium'>
                                        Date Range
                                    </p>
                                    <DateRangeCalendar
                                        value={dateRange}
                                        selectedOption={selectedOption}
                                        onDateChange={(newDateRange) => {
                                            if (
                                                newDateRange?.from &&
                                                newDateRange?.to
                                            ) {
                                                setDateRangeAndOption({
                                                    from: newDateRange.from,
                                                    to: newDateRange.to,
                                                    selectedOption: 'Custom'
                                                });
                                            } else {
                                                setDateRangeAndOption({
                                                    from: null,
                                                    to: null,
                                                    selectedOption: 'All Time'
                                                });
                                            }
                                        }}
                                        onOptionChange={(newOption) => {
                                            if (newOption === 'All Time') {
                                                setDateRangeAndOption({
                                                    from: null,
                                                    to: null,
                                                    selectedOption: newOption
                                                });
                                            } else {
                                                setDateRangeAndOption({
                                                    selectedOption: newOption
                                                });
                                            }
                                        }}
                                        defaultOption='All Time'
                                    />
                                </div>

                                <div className='w-80 space-y-2 pt-1.5'>
                                    <Label>Business Location</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setBusinessLocation(
                                                value === 'all' ? '' : value
                                            );
                                        }}
                                        value={businessLocation || 'all'}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select business location' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {businessLocationOptions?.map(
                                                (
                                                    businessLocation: {
                                                        label: string;
                                                        value: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={
                                                            businessLocation?.value
                                                        }
                                                    >
                                                        {
                                                            businessLocation?.label
                                                        }
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className='px-4 pt-4'>
                                <Button
                                    onClick={handleClearFilter}
                                    className='mt-auto w-fit'
                                >
                                    Clear Filter
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* OrderTabsV2 now receives the assigned orders status counts */}
            <OrderTabsV2
                orderStatus={orderStatus as string}
                processingOrderStatusCounts={currentStatusCounts} // This now contains assigned orders status counts
                setaAsignedBusinessLocation={setaAsignedBusinessLocation}
                setOrderStatus={setOrderStatus}
                statusCount={statusCount}
            />

            {/* table */}
            <OrdersTable
                orders={orders}
                isLoading={isLoading}
                isFetching={isFetching}
            />

            {/* pagination */}
            <div className='rounded-lg bg-background p-2 shadow-md'>
                <Pagination
                    limit={limit}
                    setLimit={setLimit}
                    currentPage={page}
                    onPageChange={handlePageChange}
                    totalItems={ordersMeta?.total || 0}
                />
            </div>
        </section>
    );
};

const AssignedOrders = () => {
    return (
        <Suspense fallback={<>Loading..</>}>
            <AssignedOrdersComponent />
        </Suspense>
    );
};

export default AssignedOrders;
