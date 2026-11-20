import React from 'react';
import EditPosSaleForm from './_components/edit-pos-sale-form';

const PosSaleEditPage = async ({
    params
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;
    return <EditPosSaleForm id={id} />;
};

export default PosSaleEditPage;
