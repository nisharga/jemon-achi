'use client';

import React, { useEffect, useState } from 'react';
import { useGetSingleBrandQuery } from '@/redux/admin/api/brand-api';
import { useUpdateBrandMutation } from '@/redux/admin/api/brand-api';
import { BrandForm } from '../../_components/brand-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

const UpdateBrandPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const router = useRouter();
    const [id, setId] = useState<string>('');

    useEffect(() => {
        params.then((p) => setId(p.id));
    }, [params]);

    const { data: brandData, isLoading } = useGetSingleBrandQuery(id, {
        skip: !id
    });
    const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_UPDATE]
    });

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading || isLoading) {
        return <PermissionLoaderCard />;
    }

    const handleUpdateBrand = async (data: {
        name: string;
        tags?: string[];
    }) => {
        try {
            await updateBrand({ id, payload: data }).unwrap();
            toast.success('Brand updated successfully');
            router.push('/admin/all-brands');
        } catch {
            toast.error('Failed to update brand');
        }
    };

    const brand = brandData?.data;

    if (!brand && !isLoading) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <p className='text-muted-foreground'>Brand not found</p>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-6'>
            <h1 className='text-2xl font-medium'>Update Brand</h1>
            {brand && (
                <BrandForm
                    onSubmit={handleUpdateBrand}
                    isLoading={isUpdating}
                    submitButtonText='Update Brand'
                    defaultValues={{
                        name: brand.name,
                        tags: brand.tags || []
                    }}
                />
            )}
        </div>
    );
};

export default UpdateBrandPage;
