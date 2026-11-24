import React, { Suspense } from 'react';
import SearchPage from './_components/SearchPage';

const page = () => {
    return (
        <Suspense fallback={<div>Loading Search...</div>}>
            <SearchPage />
        </Suspense>
    );
};

export default page;
