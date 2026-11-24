'use client';

import { DateRangeCalendar } from '@/components/ui/date-range-calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useGetAllBusinessLocationsQuery } from '@/redux/admin/api/business-location-api';
import { useGetAdminReportMetricsQuery } from '@/redux/admin/api/metadata-api';

import { IBusiness_location } from '@/types/admin/business-location';
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';

const AdminReportMetric = () => {
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

    const { data } = useGetAdminReportMetricsQuery({
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
    console.log(data, 'data');

    return (
        <div className='rounded-md bg-background p-6 shadow-md hover:shadow-xl'>
            <div className='grid gap-6 md:grid-cols-5'>
                {/* filter by business location */}
                <div className='w-full space-y-2'>
                    <p className='text-sm font-medium'>Business Location</p>
                    <Select
                        onValueChange={(value) => {
                            setBusinessLocation(value === 'all' ? '' : value);
                        }}
                        defaultValue='all'
                    >
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select business location' />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value='all'>All</SelectItem>
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
                                        value={businessLocation?.value}
                                    >
                                        {businessLocation?.label}
                                    </SelectItem>
                                )
                            )}
                        </SelectContent>
                    </Select>
                </div>
                {/* filter by date range */}
                <div className='space-y-2 md:col-span-4'>
                    <p className='text-sm font-medium'>Date Range</p>
                    <DateRangeCalendar
                        onDateChange={setDateRange}
                        onOptionChange={setSelectedOption}
                        defaultOption='Today'
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminReportMetric;
