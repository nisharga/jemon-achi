'use client';

import { Button } from '@/admin/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { StaffsTable } from './_components/staffs-table';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';

import { useStaffByRoles } from '@/admin/hooks/useStaffByRoles';

const StaffsPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.USER_VIEW]
    });

    // === get all staffs ===

    const { staffs, isLoading, isFetching } = useStaffByRoles();

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>All Staffs</h1>
                <Button asChild>
                    <Link href='/admin/add-new-staff'>Add New Staff </Link>
                </Button>
            </div>

            {/* table */}
            <StaffsTable
                staffs={staffs}
                isLoading={isLoading}
                isFetching={isFetching}
            />
        </section>
    );
};

export default StaffsPage;
