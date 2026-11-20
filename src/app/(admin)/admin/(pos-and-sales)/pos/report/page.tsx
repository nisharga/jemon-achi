'use client';

import React, { useState } from 'react';
import {
    SelectItem,
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/admin/components/ui/accordion';
import {
    BarChart3,
    Clock,
    DollarSign,
    Filter,
    Percent,
    ShoppingCart,
    TrendingUp
} from 'lucide-react';
import { useGetAllBusinessLocationsQuery } from '@/admin/redux/api-queries/business-location-api';
import { IBusiness_location } from '@/admin/types/business-location';
import { useGetPosSalesReportQuery } from '@/admin/redux/api-queries/pos-sale-api';
import { DateRangeCalendar } from '@/admin/components/ui/date-range-calendar';
import type { DateRange } from 'react-day-picker';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/admin/components/ui/card';

const PosSalesReportPage = () => {
    // === api query states ===
    const [businessLocation, setBusinessLocation] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date()
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedOption, setSelectedOption] = useState<string>('');

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map(
            (businessLocation: IBusiness_location) => ({
                label: businessLocation?.name,
                value: businessLocation?._id
            })
        ) || [];

    // === get pos sale reports ===
    const { data, isLoading, isFetching } = useGetPosSalesReportQuery({
        business_location_id: businessLocation,
        startDate: dateRange?.from?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }),
        endDate: dateRange?.to?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    });
    const posSalesReport = data?.data;

    const cards = [
        {
            title: 'Total Sales',
            value: posSalesReport?.totalSales,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20'
        },
        {
            title: 'Total Profit',
            value: posSalesReport?.totalProfit,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20'
        },
        {
            title: 'Total Cost',
            value: posSalesReport?.totalCost,
            icon: ShoppingCart,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20'
        },
        {
            title: 'Total Discount',
            value: posSalesReport?.totalDiscount,
            icon: Percent,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950/20'
        },
        {
            title: 'Amount Due',
            value: posSalesReport?.totalDue,
            icon: Clock,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/20'
        },
        // {
        //   title: "Total Tax",
        //   value: posSalesReport?.totalTax,
        //   icon: Receipt,
        //   color: "text-indigo-600",
        //   bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
        // },
        {
            title: 'Number of Sales',
            value: posSalesReport?.numberOfSales?.toLocaleString(),
            icon: BarChart3,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50 dark:bg-teal-950/20'
        }
    ];

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>Pos Sales Report</h1>
            </div>
            {/* search filter */}
            <div className='rounded-lg bg-background shadow-md'>
                <Accordion type='single' collapsible>
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
                            <div className='grid gap-6 px-4 pt-4 md:grid-cols-2 lg:grid-cols-5'>
                                {/* filter by business location */}
                                <div className='space-y-2'>
                                    <p className='text-sm font-medium'>
                                        Business Location
                                    </p>
                                    <Select
                                        onValueChange={(value) => {
                                            setBusinessLocation(
                                                value === 'all' ? '' : value
                                            );
                                        }}
                                        defaultValue='all'
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

                                {/* filter by date range */}
                                <div className='space-y-2 lg:col-span-2'>
                                    <p className='text-sm font-medium'>
                                        Date Range
                                    </p>
                                    <DateRangeCalendar
                                        onDateChange={setDateRange}
                                        onOptionChange={setSelectedOption}
                                        defaultOption='Today'
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* data cards */}
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {(!isLoading || !isFetching) &&
                    cards?.length > 0 &&
                    cards?.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <Card
                                key={index}
                                className='transition-shadow duration-200 hover:shadow-lg'
                            >
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium text-muted-foreground'>
                                        {card?.title}
                                    </CardTitle>
                                    <div
                                        className={`rounded-lg p-2 ${card.bgColor}`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 ${card.color}`}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold text-foreground'>
                                        {card?.value}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                {(isLoading || isFetching) &&
                    Array.from({ length: 7 }).map((_, index) => (
                        <div
                            key={index}
                            className='animate-skeleton h-36 rounded-lg bg-background p-6'
                        />
                    ))}
            </div>
        </section>
    );
};

export default PosSalesReportPage;
