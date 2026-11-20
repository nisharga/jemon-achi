import React, { Suspense } from 'react';
import OutletInventoryUpdate from './_components/OutletInventoryUpdate';

const OutletInventoryUpdatePage = () => {
    return (
        <Suspense fallback={<></>}>
            <OutletInventoryUpdate />
        </Suspense>
    );
};

export default OutletInventoryUpdatePage;
