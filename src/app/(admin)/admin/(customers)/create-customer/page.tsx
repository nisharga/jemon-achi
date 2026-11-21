'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/admin-utils';
import { buttonVariants } from '@/components/ui/admin-button';
import { ChevronLeft } from 'lucide-react';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { CreateUserForm } from './_components/CreateCustomerForm';

const CreateBusinessLocationPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.BUSINESSES_LOCATIONS_CREATE]
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
                    href='/admin/customers'
                    className={cn(
                        buttonVariants({
                            variant: 'outline',
                            size: 'icon'
                        })
                    )}
                >
                    <ChevronLeft />
                </Link>
                <h1 className='text-2xl font-medium'>Create Customer</h1>
            </div>
            <CreateUserForm />
        </section>
    );
};

export default CreateBusinessLocationPage;
