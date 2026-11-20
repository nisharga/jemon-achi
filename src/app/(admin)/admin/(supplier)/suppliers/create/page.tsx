'use client';

import React from 'react';

import Link from 'next/link';
import { cn } from '@/admin/lib/utils';
import { buttonVariants } from '@/admin/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { CreateSupplierForm } from './_components/create-supplier-form';

const CreateSupplierPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.SUPPLIER_CREATE]
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
            <div className='flex items-center gap-2'>
                <Link
                    href='/admin/suppliers/all'
                    className={cn(
                        buttonVariants({
                            variant: 'outline',
                            size: 'icon'
                        })
                    )}
                >
                    <ChevronLeft />
                </Link>
                <h1 className='text-2xl font-medium'>Create supplier</h1>
            </div>
            <CreateSupplierForm />
        </section>
    );
};

export default CreateSupplierPage;
