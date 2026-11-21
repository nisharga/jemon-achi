'use client';

import { buttonVariants } from '@/components/ui/admin-button';
import { cn } from '@/lib/admin-utils';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import CreateStockTransferForm from './_components/create-stock-transfer-form';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

const AddStockTransferPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.STOCK_TRANSFER]
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
                    href='/admin/stock-transger/all'
                    className={cn(
                        buttonVariants({
                            variant: 'outline',
                            size: 'icon'
                        })
                    )}
                >
                    <ChevronLeft />
                </Link>
                <h1 className='text-2xl font-medium'>Add Stock Transfer</h1>
            </div>
            <CreateStockTransferForm />
        </section>
    );
};

export default AddStockTransferPage;
