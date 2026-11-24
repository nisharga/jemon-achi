'use client';

import { useGetInventoriesByWarehouseIdQuery } from '@/redux/admin/api/inventory-api';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/admin-card';
import { Badge } from '@/components/ui/admin-badge';
import { Package, Warehouse, MapPin, AlertCircle } from 'lucide-react';
import InventoryTable from '../../_components/inventory-table';
import Pagination from '@/components/shared/pagination';
import { useEffect, useState } from 'react';

const WarehouseInventoryView = () => {
    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);

    const searchParams = useSearchParams();
    const warehouseId = searchParams.get('warehouse_id');

    const {
        data: resData,
        isLoading,
        error
    } = useGetInventoriesByWarehouseIdQuery({
        warehouseId,
        limit,
        page
    });
    const data = resData?.data;
    const inventories = data?.inventory;
    const inventoriesMeta = data?.meta;
    // console.log("inventories", inventoriesMeta);

    // === paginations ===
    // === handling page change ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };
    // === reset to first page whenover limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit]);

    if (isLoading) {
        return (
            <div className='grid gap-6'>
                {Array.from({ length: 5 }).map((_, index) => (
                    <span
                        key={index}
                        className='animate-skeleton h-20 rounded-md bg-secondary'
                    />
                ))}
            </div>
        );
    }

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
                                Failed to load warehouse inventory data.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <section className='grid gap-6'>
            {/* Header Section */}
            <div className='space-y-6'>
                <div className='flex items-center gap-3'>
                    <Warehouse className='h-8 w-8 text-primary' />
                    <div>
                        <h1 className='text-3xl font-bold text-primary'>
                            {data?.warehouse?.name || 'Warehouse'} - Inventory
                        </h1>
                        <div className='mt-1 flex items-center gap-2 text-muted-foreground'>
                            <MapPin className='h-4 w-4' />
                            <span className='text-sm'>
                                {data?.warehouse?.address?.local_address},{' '}
                                {data?.warehouse?.address?.thana},{' '}
                                {data?.warehouse?.address?.district}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <Badge
                        variant='secondary'
                        className='bg-accent-foreground text-primary hover:bg-accent-foreground/80'
                    >
                        <Package className='mr-1 h-4 w-4' />
                        Total Products: {inventoriesMeta?.total || 0}
                    </Badge>
                </div>
            </div>

            <InventoryTable inventories={inventories} />

            {/* pagination */}
            {inventoriesMeta?.total > 0 && (
                <div className='rounded-lg bg-background p-2 shadow-md'>
                    <Pagination
                        limit={limit}
                        setLimit={setLimit}
                        currentPage={page}
                        onPageChange={handlePageChange}
                        totalItems={inventoriesMeta?.total}
                    />
                </div>
            )}

            {/* empty state */}
            {inventoriesMeta?.total === 0 && (
                <div className='flex h-10 items-center justify-center rounded-lg bg-background p-2 text-center text-sm text-muted-foreground shadow-md'>
                    No inventory found for this warehouse.
                </div>
            )}
        </section>
    );
};

export default WarehouseInventoryView;
