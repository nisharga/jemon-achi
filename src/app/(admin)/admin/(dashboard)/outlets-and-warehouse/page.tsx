'use client';

import { useGetAllBusinessLocationsQuery } from '@/redux/api-queries/business-location-api';
import { Badge } from '@/components/ui/admin-badge';
import { Building2 } from 'lucide-react';
import OutletsSkeleton from '@/components/skeletons/outlets-skeleton';
import { TOutlet } from '@/types/product';
import OutletCard from '@/components/shared/OutletCard';
import { toast } from 'sonner';
// import { useRouter } from "next/navigation";

const OutletsAndWarehousePage = () => {
    const { data, isLoading } = useGetAllBusinessLocationsQuery(undefined);

    //  const router = useRouter();

    const handleViewWarehouseInventory = () => {
        toast.success('Feature coming soon!');
        // router.push(
        //  `/admin/inventory/view/warehouse?warehouse_id=${warehouse?._id}`,
        // );
    };

    const handleUpdateWarehouseInventory = () => {
        toast.success('Feature coming soon!');
        // router.push(
        //  `/admin/inventory/warehouse-update?warehouse_id=${warehouse?._id}`,
        // );
    };

    const handleViewOutletInventory = () => {
        toast.success('Feature coming soon!');
        // router.push(`/admin/inventory/view/outlet?outlet_id=${outlet?._id}`);
    };

    const handleUpdateOutletInventory = () => {
        toast.success('Feature coming soon!');
        // router.push(`/admin/inventory/outlet-update?outlet_id=${outlet?._id}`);
    };

    if (isLoading) {
        return (
            <div className=''>
                <h1 className='mb-2 text-3xl font-bold text-[#023344]'>
                    Warehouse & Outlet Management
                </h1>
                <p className='text-gray-600'>
                    Manage and monitor all outlet and warehouse locations and
                    their inventory
                </p>
                <OutletsSkeleton />
            </div>
        );
    }

    // Split data by type
    const businessLocations = data?.data?.businessLocations || [];
    const warehouses = businessLocations.filter(
        (location: TOutlet) => location?.type === 'WAREHOUSE'
    );
    const outlets = businessLocations.filter(
        (location: TOutlet) => location?.type === 'OUTLET'
    );

    const totalWarehouse = warehouses.length;
    const totalOutlet = outlets.length;

    return (
        <div className=''>
            {/* Header Section */}
            <div className='mb-8'>
                <h1 className='mb-2 text-3xl font-bold text-[#023344]'>
                    Warehouse & Outlet Management
                </h1>
                <p className='text-gray-600'>
                    Manage and monitor all outlet and warehouse locations and
                    their inventory
                </p>
            </div>

            {/* Warehouse Grid */}
            <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Available Warehouses</h3>
                <div className='-mt-2 flex items-center gap-4'>
                    <Badge
                        variant='secondary'
                        className='bg-[#EFBB29] text-[#023344] hover:bg-[#EFBB29]/80'
                    >
                        <Building2 className='mr-1 h-4 w-4' />
                        Total Warehouse: {totalWarehouse || 0}
                    </Badge>
                </div>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3'>
                    {warehouses?.map((warehouse: TOutlet) => (
                        <OutletCard
                            data={warehouse}
                            key={warehouse?._id}
                            handleViewInventory={handleViewWarehouseInventory}
                            handleUpdateInventory={
                                handleUpdateWarehouseInventory
                            }
                        />
                    ))}
                </div>
                {/* Empty State */}
                {warehouses?.length === 0 && (
                    <div className='py-12 text-center'>
                        <Building2 className='mx-auto mb-4 h-16 w-16 text-gray-300' />
                        <h3 className='mb-2 text-lg font-medium text-gray-900'>
                            No warehouse found
                        </h3>
                        <p className='text-gray-500'>
                            Get started by adding your first warehouse location.
                        </p>
                    </div>
                )}
            </div>

            {/* Outlets Grid */}
            <div className='mt-8 space-y-4'>
                <h3 className='text-lg font-semibold'>Available Outlets</h3>
                <div className='-mt-2 flex items-center gap-4'>
                    <Badge
                        variant='secondary'
                        className='bg-[#EFBB29] text-[#023344] hover:bg-[#EFBB29]/80'
                    >
                        <Building2 className='mr-1 h-4 w-4' />
                        Total Outlets: {totalOutlet || 0}
                    </Badge>
                </div>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3'>
                    {outlets?.map((outlet: TOutlet) => (
                        <OutletCard
                            data={outlet}
                            key={outlet?._id}
                            handleViewInventory={handleViewOutletInventory}
                            handleUpdateInventory={handleUpdateOutletInventory}
                        />
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {outlets.length === 0 && (
                <div className='py-12 text-center'>
                    <Building2 className='mx-auto mb-4 h-16 w-16 text-gray-300' />
                    <h3 className='mb-2 text-lg font-medium text-gray-900'>
                        No outlets found
                    </h3>
                    <p className='text-gray-500'>
                        Get started by adding your first outlet location.
                    </p>
                </div>
            )}
        </div>
    );
};

export default OutletsAndWarehousePage;
