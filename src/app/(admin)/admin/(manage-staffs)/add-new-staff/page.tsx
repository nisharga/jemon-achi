'use client';

import React from 'react';
import AddNewStaffForm from './_components/add-new-staff-form';
import Link from 'next/link';
import { cn } from '@/lib/admin-utils';
import { buttonVariants } from '@/components/ui/admin-button';
import { ChevronLeft } from 'lucide-react';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';

const AddNewStaffPage = () => {
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
                href='/admin/staffs'
                className={cn(
                    buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'w-fit'
                    })
                )}
            >
                <ChevronLeft /> Back to Staffs
            </Link>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>Add New Staff</h1>
            </div>

            {/* form */}
            <AddNewStaffForm />
        </section>
    );
};

export default AddNewStaffPage;
