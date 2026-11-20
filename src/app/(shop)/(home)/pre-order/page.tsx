'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PreOrderForm from './_components/PreOrderForm';

const PreOrderPageInner = () => {
    const searchParams = useSearchParams();
    const prefill = {
        productId: searchParams.get('product') || undefined,
        productName: searchParams.get('name') || undefined,
        productImage: searchParams.get('image') || undefined,
        unitPrice: searchParams.get('price') || undefined
    };

    return <PreOrderForm prefill={prefill} />;
};

const PreOrderPage = () => (
    <Suspense fallback={<div className='py-16 text-center'>Loading...</div>}>
        <PreOrderPageInner />
    </Suspense>
);

export default PreOrderPage;
