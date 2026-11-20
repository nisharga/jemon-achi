import React from 'react';
import UpdateStaffForm from './_components/update-staff-from';

const UpdateStaffPage = async ({
    params
}: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await params;

    return <UpdateStaffForm slug={slug} />;
};

export default UpdateStaffPage;
