'use client';
import { TProduct, TOutlet } from '@/types/admin/product';
import React, { useState } from 'react';
import ProductSearchAndSelect from '../../_components/ProductSearchAndSelect';
import AvailableOutletsAndSelect from './AvailableOutletsAndSelect';
import AvailableWarehousesAndSelect from '../../warehouse-update/_components/AvailableWarehousesAndSelect';
import UpdateVariantsForOutlet from './UpdateVariantsForOutlet';

const OutletInventoryUpdate = () => {
    // The product want to update
    const [selectedProduct, setSelectedProduct] = useState<TProduct | null>(
        null
    );
    // The inventory transfer from the selected warehouse to select outlet
    const [selectedWarehouse, setSelectedWarehouse] = useState<TOutlet | null>(
        null
    );

    const [selectedOutlet, setSelectedOutlet] = useState<TOutlet | null>(null);

    return (
        <div className='w-full'>
            <h1 className='mb-4 text-2xl font-bold text-primary'>
                Update Inventory (Warehouse to Outlet)
            </h1>
            {/* === warehouse selection === */}
            {!selectedWarehouse && (
                <div className='mt-6 rounded-lg border border-l-5 border-red-500 bg-red-50 p-6 text-base font-medium shadow'>
                    Please select a Warehouse!
                </div>
            )}
            <AvailableWarehousesAndSelect
                selectedWarehouse={selectedWarehouse as TOutlet}
                setSelectedWarehouse={setSelectedWarehouse}
            />

            {/* === outlet selection === */}
            {!selectedOutlet && (
                <div className='mt-6 rounded-lg border border-l-5 border-red-500 bg-red-50 p-6 text-base font-medium shadow'>
                    Please select a Warehouse!
                </div>
            )}
            <AvailableOutletsAndSelect
                selectedOutlet={selectedOutlet as TOutlet}
                setSelectedOutlet={setSelectedOutlet}
            />

            {/* === product selection === */}
            <ProductSearchAndSelect setSelectedProduct={setSelectedProduct} />

            {/* === update variant for outlet === */}
            <UpdateVariantsForOutlet
                selectedProduct={selectedProduct}
                selectedOutlet={selectedOutlet}
                selectedWarehouse={selectedWarehouse}
            />
        </div>
    );
};

export default OutletInventoryUpdate;
