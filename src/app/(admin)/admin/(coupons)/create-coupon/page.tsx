'use client';

import React from 'react';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import CreateForm from './_components/create-form';
import SectionTitle from '@/components/shared/section-title';

const CreateProduct = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_CREATE]
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
            <SectionTitle title={`Create Coupon`} url='/admin/coupons' />
            <CreateForm />
        </section>
    );
};

export default CreateProduct;
