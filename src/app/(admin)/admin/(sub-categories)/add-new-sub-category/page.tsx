'use client';

import React from 'react';
import AddNewSubCategoryForm from './_components/add-new-sub-category-form';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import SectionTitle from '@/admin/components/shared/section-title';

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
