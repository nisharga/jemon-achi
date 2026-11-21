'use client';

import React, { useEffect, useState } from 'react';
import Pagination from '@/components/shared/pagination';
import { BusinessLocationTable } from './_components/business-location-table';
import { useGetAllBusinessLocationsQuery } from '@/redux/api-queries/business-location-api';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

const AllBusinessLocationsPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.BUSINESSES_LOCATIONS_VIEW]
    });

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);

    // === get all products ===
    const { data, isLoading, isFetching } = useGetAllBusinessLocationsQuery({
        page: page,
        limit: limit
    });
    const locations = data?.data?.businessLocations;
    const locationsMeta = data?.data?.meta;

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
                <h1 className='text-2xl font-medium'>
                    Business Locations ({locationsMeta?.total})
                </h1>
            </div>

            {/* table */}
            <BusinessLocationTable
                locations={locations}
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
                    totalItems={locationsMeta?.total}
                />
            </div>
        </section>
    );
};

export default AllBusinessLocationsPage;
