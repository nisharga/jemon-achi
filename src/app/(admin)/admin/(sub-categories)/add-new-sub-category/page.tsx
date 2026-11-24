'use client';

import React from 'react';
import AddNewSubCategoryForm from './_components/add-new-sub-category-form';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import SectionTitle from '@/components/shared/section-title';

const AddNewSubCategoryPage = () => {
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
            <SectionTitle
                title='Add New Sub Category'
                url='/admin/sub-categories'
            />
            <AddNewSubCategoryForm />
        </section>
    );
};

export default AddNewSubCategoryPage;
