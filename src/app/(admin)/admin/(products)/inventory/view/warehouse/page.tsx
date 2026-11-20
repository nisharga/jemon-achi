import React, { Suspense } from 'react';
import WarehouseInventoryView from './_components/WarehouseInventoryView';

const WarehouseInventoryViewPage = () => {
    return (
        <Suspense fallback={<></>}>
            <WarehouseInventoryView />
        </Suspense>
    );
};

export default WarehouseInventoryViewPage;
