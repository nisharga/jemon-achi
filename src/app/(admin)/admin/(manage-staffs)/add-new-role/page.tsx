'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/admin-utils';
import { buttonVariants } from '@/components/ui/admin-button';
import { ChevronLeft } from 'lucide-react';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import AddNewRoleForm from './_components/add-new-role-form';

const AddNewRolePage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.USER_CREATE]
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
            <Link
                href='/admin/role'
                className={cn(
                    buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'w-fit'
                    })
                )}
            >
                <ChevronLeft /> Back to Roles
            </Link>

            {/* form */}
            <AddNewRoleForm />
        </section>
    );
};

export default AddNewRolePage;
