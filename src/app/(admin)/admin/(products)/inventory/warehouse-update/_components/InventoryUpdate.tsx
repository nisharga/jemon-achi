'use client';
import React, { useState } from 'react';
import ProductSearchAndSelect from '../../_components/ProductSearchAndSelect';
import { TProduct } from '@/admin/types/product';
import AvailableWarehousesAndSelect from './AvailableWarehousesAndSelect';
import { TOutlet } from '@/admin/types/product';
import UpdateVariants from './UpdateVariants';

const WarehouseInventoryUpdate = () => {
    const [selectedProduct, setSelectedProduct] = useState<TProduct | null>(
        null
    );
    const [selectedWarehouse, setSelectedWarehouse] = useState<TOutlet | null>(
        null
    );

    return (
        <div className='w-full'>
            <h1 className='mb-4 text-2xl font-bold text-primary'>
                Warehouse Inventory Update
            </h1>
            {/* === product selection === */}
            {!selectedProduct && (
                <div className='rounded-lg border border-l-5 border-red-500 bg-red-50 p-6 text-base font-medium shadow'>
                    Please select a Product!
                </div>
            )}
            <ProductSearchAndSelect setSelectedProduct={setSelectedProduct} />

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

            {/* === update variants === */}
            {selectedProduct && selectedWarehouse && (
                <UpdateVariants
                    selectedProduct={selectedProduct}
                    selectedWarehouse={selectedWarehouse}
                />
            )}
        </div>
    );
};

export default WarehouseInventoryUpdate;
