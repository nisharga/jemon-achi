import React, { Suspense } from 'react';
import OutletInventoryView from './_components/OutletInventoryView';

const OutletInventoryViewPage = () => {
    return (
        <Suspense fallback={<></>}>
            <OutletInventoryView />
        </Suspense>
    );
};

export default OutletInventoryViewPage;
