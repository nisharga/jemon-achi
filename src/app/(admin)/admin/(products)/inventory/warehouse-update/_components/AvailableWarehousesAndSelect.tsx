'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useGetAllWarehouseQuery } from '@/redux/admin/api/outlet-api';
import { TOutlet } from '@/types/admin/product';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Dispatch, SetStateAction, useEffect } from 'react';

const AvailableWarehousesAndSelect = ({
    selectedWarehouse,
    setSelectedWarehouse
}: {
    selectedWarehouse: TOutlet;
    setSelectedWarehouse: Dispatch<SetStateAction<TOutlet | null>>;
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const warehouse_id = searchParams.get('warehouse_id');

    console.log('warehouse_id: ', warehouse_id);

    const { data: warehouseResdata, isLoading } = useGetAllWarehouseQuery({});
    const warehouses = warehouseResdata?.data?.warehouse;

    // Update state and router on selection
    const handleSelectWarehouse = (_id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('warehouse_id', _id);
        router.push(`?${params.toString()}`);

        const foundWarehouse = warehouses?.find(
            (warehouse: TOutlet) => warehouse?._id === _id
        );
        if (foundWarehouse) {
            setSelectedWarehouse(foundWarehouse);
        }
    };

    // Pre-select from query param on mount or data load
    useEffect(() => {
        if (warehouse_id && warehouses?.length > 0) {
            const found = warehouses?.find(
                (warehouse: TOutlet) => warehouse?._id === warehouse_id
            );
            if (found) {
                setSelectedWarehouse(found);
            }
        }
    }, [warehouse_id, warehouses, setSelectedWarehouse]);

    return (
        <div className='mt-6 space-y-2 rounded-md bg-background p-4 shadow hover:shadow-lg'>
            <h3 className='text-sm font-semibold'>Select Warehouse</h3>

            {isLoading ? (
                <div className='h-9 animate-pulse rounded-md bg-secondary' />
            ) : (
                <Select
                    value={selectedWarehouse?._id}
                    onValueChange={handleSelectWarehouse}
                >
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select Warehouse' />
                    </SelectTrigger>
                    <SelectContent>
                        {warehouses?.map((warehouse: TOutlet) => (
                            <SelectItem
                                key={warehouse?._id}
                                value={warehouse?._id}
                            >
                                {warehouse?.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};

export default AvailableWarehousesAndSelect;
