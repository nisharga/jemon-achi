'use client';

import React from 'react';
import CreateOrderForm from './_components/create-order-form';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import Link from 'next/link';
import { cn } from '@/lib/admin-utils';
import { buttonVariants } from '@/components/ui/admin-button';
import { ChevronLeft } from 'lucide-react';

const CreateOrder = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.ORDER_CREATE]
    });

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='flex flex-col gap-4'>
            <div className='flex items-center gap-2'>
                <Link
                    href='/admin/orders'
                    className={cn(
                        buttonVariants({
                            variant: 'outline',
                            size: 'icon',
                            className: 'size-7'
                        })
                    )}
                >
                    <ChevronLeft />
                </Link>
                <h1 className='text-lg font-medium'>Create Order</h1>
            </div>

            <CreateOrderForm />
        </section>
    );
};

export default CreateOrder;
