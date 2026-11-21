'use client';

import React from 'react';
import { useCreateBrandMutation } from '@/redux/api-queries/brand-api';
import { BrandForm } from '../_components/brand-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

const CreateBrandPage = () => {
    const router = useRouter();
    const [createBrand, { isLoading }] = useCreateBrandMutation();

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

    const handleCreateBrand = async (data: {
        name: string;
        tags?: string[];
    }) => {
        try {
            await createBrand(data).unwrap();
            toast.success('Brand created successfully');
            router.push('/admin/all-brands');
        } catch {
            toast.error('Failed to create brand');
        }
    };

    return (
        <div className='flex flex-col gap-6'>
            <h1 className='text-2xl font-medium'>Create New Brand</h1>
            <BrandForm
                onSubmit={handleCreateBrand}
                isLoading={isLoading}
                submitButtonText='Create Brand'
            />
        </div>
    );
};

export default CreateBrandPage;
