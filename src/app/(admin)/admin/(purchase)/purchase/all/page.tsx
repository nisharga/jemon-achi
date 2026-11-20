'use client';

import Pagination from '@/admin/components/shared/pagination';
import React, { useEffect, useState } from 'react';
import { useGetAllPurchasesQuery } from '@/admin/redux/api-queries/purchase-slice';
import { PurchaseTable } from './_components/purchase-table';
import { useGetAllSuppliersQuery } from '@/admin/redux/api-queries/supplier-slice';
import { TSupplier } from '@/admin/types/supplier';
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
import { Filter } from 'lucide-react';
import { useGetAllBusinessLocationsQuery } from '@/admin/redux/api-queries/business-location-api';
import { IBusiness_location } from '@/admin/types/business-location';
import { PURCHASE_STATUSES } from '@/admin/types/purchase';
import { Label } from '@/admin/components/ui/label';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';

const AllPurchasePage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PURCHASE_VIEW]
    });

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);
    const [businessLocation, setBusinessLocation] = useState('');
    const [supplier, setSupplier] = useState('');
    const [status, setStatus] = useState('');

    // === get all purchases ===
    const { data, isLoading, isFetching } = useGetAllPurchasesQuery({
        page,
        limit,
        supplier,
        business_location: businessLocation,
        status,
        purchase_number: ''
    });
    const purchases = data?.data?.data;
    const purchasesMeta = data?.data?.meta;

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions =
        businessLocationData?.data?.businessLocations?.map(
            (businessLocation: IBusiness_location) => ({
                label: businessLocation?.name,
                value: businessLocation?._id
            })
        ) || [];

    // === get all suppliers ===
    const { data: suppliersData } = useGetAllSuppliersQuery({});
    const supplierOptions =
        suppliersData?.data?.map((supplier: TSupplier) => ({
            label: supplier?.name,
            value: supplier?._id
        })) || [];

    // === paginations ===
    // === handling page change ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };
    // === reset to first page whenover limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit, supplier]);

    // === handle clear filter ===
    // const handleClearFilter = () => {
    //   setBusinessLocation("");
    //   setSupplier("");
    //   setStatus("");
    // };

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    console.log(purchases, 'purchases...........');

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>
                    All Purchases ({purchasesMeta?.total})
                </h1>
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
                            <div className='grid gap-6 px-4 pt-4 md:grid-cols-2 lg:grid-cols-4'>
                                {/* filter by business location */}
                                <div className='space-y-2'>
                                    <Label>Business Location</Label>
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

                                {/* filter by supplier */}
                                <div className='space-y-2'>
                                    <Label>Supplier</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setSupplier(
                                                value === 'all' ? '' : value
                                            );
                                        }}
                                        defaultValue='all'
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a supplier' />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {supplierOptions?.map(
                                                (
                                                    supplier: {
                                                        label: string;
                                                        value: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={supplier?.value}
                                                    >
                                                        {supplier?.label}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* filter by status */}
                                <div className='space-y-2'>
                                    <Label>Purchase Status</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setStatus(
                                                value === 'all' ? '' : value
                                            );
                                        }}
                                        defaultValue='all'
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select status' />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {PURCHASE_STATUSES?.map(
                                                (
                                                    status: string,
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={status}
                                                    >
                                                        {status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            status.slice(1)}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* table */}
            <PurchaseTable
                purchases={purchases}
                isLoading={isLoading}
                isFetching={isFetching}
            />
            {/* pagination */}
            {purchasesMeta?.total > 0 && (
                <div className='rounded-lg bg-background p-2 shadow-md'>
                    <Pagination
                        limit={limit}
                        setLimit={setLimit}
                        currentPage={page}
                        onPageChange={handlePageChange}
                        totalItems={purchasesMeta?.total}
                    />
                </div>
            )}
        </section>
    );
};

export default AllPurchasePage;
