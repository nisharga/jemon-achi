'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/admin/lib/utils';
import { buttonVariants } from '@/admin/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
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
