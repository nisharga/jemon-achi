'use client';

import Pagination from '@/components/shared/pagination';
import React, { Suspense, useEffect, useState } from 'react';
import { useGetAllStockAdjustmentQuery } from '@/redux/api-queries/stock-api';
import { StockAdjustmentTable } from './_components/stock-adjustment-table';
import {
    parseAsIsoDate,
    parseAsString,
    useQueryState,
    useQueryStates
} from 'nuqs';
import useDebounce from '@/hooks/use-debounce';
import { endOfYear, startOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { Filter } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/admin-label';
import { Input } from '@/components/ui/admin-input';
import { DateRangeCalendar } from '@/components/ui/date-range-calendar';
import { Button } from '@/components/ui/admin-button';
import { useGetAllBusinessLocationsQuery } from '@/redux/api-queries/business-location-api';
import { IBusiness_location } from '@/types/business-location';
import { useGetAllStaffsQuery } from '@/redux/api-queries/staff-api';
import { IRoles, TUser } from '@/types/admin-user';
import { getRoleBadgeVariant } from '@/utils/getRoleBadgeVariant';
import { Badge } from '@/components/ui/admin-badge';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { PermissionEnum } from '@/types/permistion';
import { useHasPermission } from '@/hooks/use-has-permission';

const AllStockAdjustmentComponent = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.STOCK_VIEW]
    });

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);
    const [businessLocation, setBusinessLocation] =
        useQueryState('businessLocation');
    const [search, setSearch] = useQueryState('search');
    const debouncedSearch = useDebounce(search);
    const [{ from, to, selectedOption }, setDateRangeAndOption] =
        useQueryStates(
            {
                from: parseAsIsoDate.withDefault(startOfYear(new Date())),
                to: parseAsIsoDate.withDefault(endOfYear(new Date())),
                selectedOption: parseAsString.withDefault('This Year')
            },
            { history: 'replace' }
        );
    const dateRange: DateRange | undefined = { from, to };
    const [action, setAction] = useQueryState('action');
    const [adjustBy, setAdjustBy] = useQueryState('adjustBy');

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map(
            (businessLocation: IBusiness_location) => ({
                label: businessLocation?.name,
                value: businessLocation?._id
            })
        ) || [];

    // === get all staffs ===
    const { data: staffData } = useGetAllStaffsQuery({
        page: 1,
        limit: 20,
        role: [
            'SUPER_ADMIN',
            'ADMIN',
            'OUTLET_MANAGER',
            'OUTLET_STAFF',
            'INVENTORY_MANAGER'
        ]
    });
    const staffs = staffData?.data?.data;

    const staffOptions = staffs?.map((staff: TUser) => ({
        name: staff?.full_name,
        id: staff?._id,
        role: staff?.role
    }));

    // === get all stock adjustments ===
    const { data, isLoading, isFetching } = useGetAllStockAdjustmentQuery({
        page,
        limit,
        action,
        search: debouncedSearch,
        adjust_by: adjustBy,
        business_location: businessLocation,
        startDate: from?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }),
        endDate: to?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    });
    const stockAdjustments = data?.data;
    const stockAdjustmentsMeta = data?.meta;
    // console.log("stockAdjustments", stockAdjustments);

    // // === lazy query for full sales data ===
    // const [fetchAllStockAdjustments, { isFetching: isDownloading }] =
    //   useLazyGetAllStockAdjustmentQuery();

    // === handle clear filter ===
    const handleClearFilter = () => {
        setSearch(null);
        setBusinessLocation(null);
        setAction(null);
        setAdjustBy(null);
        setDateRangeAndOption(null);
    };

    // === paginations ===
    // === handling page change ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };
    // === reset to first page whenover limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit]);

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-lg font-medium'>
                    All Stock Adjustment ({stockAdjustmentsMeta?.total})
                </h1>
            </div>
            {/* search filter */}
            <div className='rounded-lg bg-background shadow-md'>
                <Accordion type='single' collapsible defaultValue='item-1'>
                    <AccordionItem value='item-1'>
                        <AccordionTrigger
                            isHideChevron={true}
                            className='hover: cursor-pointer rounded-b-none border-b p-4 text-lg font-medium hover:no-underline'
                        >
                            <span className='flex items-center gap-2 text-emerald-600'>
                                <Filter className='size-5' /> Filter
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className='grid gap-6 px-4 pt-4 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-7'>
                                {/* search by sky */}
                                <div className='mt-1.5 space-y-2'>
                                    <Label>SKU</Label>
                                    <Input
                                        placeholder='Search by sku'
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value !== ''
                                                    ? e.target.value
                                                    : null
                                            )
                                        }
                                        value={search ? search : ''}
                                    />
                                </div>
                                {/* filter by business location */}
                                <div className='space-y-2'>
                                    <p className='text-sm font-medium'>
                                        Business Location
                                    </p>
                                    <Select
                                        onValueChange={(value) => {
                                            setBusinessLocation(
                                                value === 'all' ? null : value
                                            );
                                        }}
                                        defaultValue='all'
                                        value={
                                            businessLocation
                                                ? businessLocation
                                                : 'all'
                                        }
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
                                {/* filter by action */}
                                <div className='space-y-2'>
                                    <p className='text-sm font-medium'>
                                        Action
                                    </p>
                                    <Select
                                        onValueChange={(value) => {
                                            setAction(
                                                value === 'all' ? null : value
                                            );
                                        }}
                                        defaultValue='all'
                                        value={action ? action : 'all'}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select action' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            <SelectItem value='ADDITION'>
                                                Add Stock
                                            </SelectItem>
                                            <SelectItem value='DEDUCTION'>
                                                Deduct Stock
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* filter by user */}
                                <div className='space-y-2'>
                                    <p className='text-sm font-medium'>
                                        Adjust By
                                    </p>
                                    <Select
                                        onValueChange={(value) => {
                                            setAdjustBy(
                                                value === 'all' ? null : value
                                            );
                                        }}
                                        defaultValue='all'
                                        value={adjustBy ? adjustBy : 'all'}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select user' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {staffOptions?.map(
                                                (
                                                    staff: {
                                                        name: string;
                                                        id: string;
                                                        role: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={staff?.id}
                                                    >
                                                        <p>{staff?.name}</p>
                                                        <Badge
                                                            variant={getRoleBadgeVariant(
                                                                staff?.role as IRoles
                                                            )}
                                                            className='rounded-sm px-1 text-[8px]'
                                                        >
                                                            {staff?.role.replace(
                                                                /_/g,
                                                                ' '
                                                            )}
                                                        </Badge>
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
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
                                            if (newDateRange) {
                                                setDateRangeAndOption({
                                                    from: newDateRange.from,
                                                    to: newDateRange.to
                                                });
                                            }
                                        }}
                                        onOptionChange={(newOption) => {
                                            setDateRangeAndOption({
                                                selectedOption: newOption
                                            });
                                        }}
                                        defaultOption='This Year'
                                    />
                                </div>
                                {/* handle clear filter */}
                                <div className='flex h-full items-end justify-end'>
                                    <Button onClick={handleClearFilter}>
                                        Clear Filter
                                    </Button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* table */}
            <StockAdjustmentTable
                stockAdjustments={stockAdjustments}
                isLoading={isLoading}
                isFetching={isFetching}
            />
            {/* pagination */}
            {stockAdjustmentsMeta?.total > 0 && (
                <div className='rounded-lg bg-background p-2 shadow-md'>
                    <Pagination
                        limit={limit}
                        setLimit={setLimit}
                        currentPage={page}
                        onPageChange={handlePageChange}
                        totalItems={stockAdjustmentsMeta?.total}
                    />
                </div>
            )}
        </section>
    );
};

const AllStockAdjustmentPage = () => {
    return (
        <Suspense fallback={<>Loading..</>}>
            <AllStockAdjustmentComponent />
        </Suspense>
    );
};

export default AllStockAdjustmentPage;
