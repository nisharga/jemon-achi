'use client';

import React from 'react';
import AddNewReturnPolicyForm from './_components/add-new-return-policy-form';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import SectionTitle from '@/components/shared/section-title';

const AddNewReturnPolicyPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_CREATE]
    });

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }
    return (
        <section className='flex flex-col gap-6'>
            <SectionTitle
                title='Add New Return Policy'
                url='/admin/return-policies'
            />
            <AddNewReturnPolicyForm />
        </section>
    );
};

export default AddNewReturnPolicyPage;
