import React from 'react';
import EditOrderForm from './_components/edit-order-form';

const EditOrderPage = async ({
    params
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;

    return <EditOrderForm id={id} />;
};

export default EditOrderPage;
