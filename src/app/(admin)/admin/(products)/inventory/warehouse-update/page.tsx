import React, { Suspense } from 'react';
import WarehouseInventoryUpdate from './_components/InventoryUpdate';

const WarehouseInventoryUpdatePage = () => {
    return (
        <Suspense fallback={<></>}>
            <WarehouseInventoryUpdate />
        </Suspense>
    );
};

export default WarehouseInventoryUpdatePage;
