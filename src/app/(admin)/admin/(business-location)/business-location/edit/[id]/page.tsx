import React from 'react';
import { EditBusinessLocationForm } from './_components/edit-business-location-form';

const BusinessLocationEditPage = async ({
    params
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;
    return <EditBusinessLocationForm businessLocationId={id} />;
};

export default BusinessLocationEditPage;
