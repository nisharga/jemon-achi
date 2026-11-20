'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent } from '@/admin/components/ui/card';
import { Badge } from '@/admin/components/ui/badge';
import { Package, MapPin, AlertCircle, Warehouse } from 'lucide-react';

import ProductInventoryTable from '../../_components/ProductInventoryTable';
import { useGetInventoriesByOutletIdQuery } from '@/admin/redux/api-queries/inventory-api';

const OutletInventoryView = () => {
    const searchParams = useSearchParams();
    const outletId = searchParams.get('outlet_id');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 20;

    const {
        data: resData,
        isLoading,
        error
    } = useGetInventoriesByOutletIdQuery({
        outletId,
        limit,
        page: currentPage
    });
    const data = resData?.data;

    if (error) {
        return (
            <div className='p-6'>
                <Card className='border-red-200'>
                    <CardContent className='flex items-center justify-center py-12'>
                        <div className='text-center'>
                            <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-500' />
                            <h3 className='mb-2 text-lg font-medium text-red-900'>
                                Error Loading Inventory
                            </h3>
                            <p className='text-red-600'>
                                Failed to load outlet inventory data.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen'>
            {/* Header Section */}
            <div className='mb-8'>
                <div className='mb-4 flex items-center gap-3'>
                    <Warehouse className='h-8 w-8 text-[#023344]' />
                    <div>
                        <h1 className='text-3xl font-bold text-[#023344]'>
                            {data?.outlet?.name || 'Outlet'} - Inventory
                        </h1>
                        <div className='mt-1 flex items-center gap-2 text-gray-600'>
                            <MapPin className='h-4 w-4' />
                            <span className='text-sm'>
                                {data?.outlet?.address?.local_address},{' '}
                                {data?.outlet?.address?.thana},{' '}
                                {data?.outlet?.address?.district}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <Badge
                        variant='secondary'
                        className='bg-[#EFBB29] text-[#023344] hover:bg-[#EFBB29]/80'
                    >
                        <Package className='mr-1 h-4 w-4' />
                        Total Products: {data?.total || 0}
                    </Badge>
                </div>
            </div>

            {/* Inventory Table */}
            <ProductInventoryTable
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                data={data}
                isLoading={isLoading}
            />
        </div>
    );
};

export default OutletInventoryView;
