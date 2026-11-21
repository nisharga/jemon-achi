'use client';

import React from 'react';
import CreatePurchaseForm from './_components/create-purchase-form';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

const CreatePurchasePage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PURCHASE_CREATE]
    });

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='flex flex-col gap-6'>
            <h1 className='text-2xl font-medium'>Add Purchase</h1>
            <CreatePurchaseForm />
        </section>
    );
};

export default CreatePurchasePage;
