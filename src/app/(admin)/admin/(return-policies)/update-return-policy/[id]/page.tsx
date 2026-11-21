'use client';

import React, { useEffect, useState } from 'react';
import UpdateReturnPolicyForm from './_components/update-return-policy-form';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import SectionTitle from '@/components/shared/section-title';

const UpdateReturnPolicyPage = ({
    params
}: {
    params: Promise<{ id: string }>;
}) => {
    const [id, setId] = useState<string>('');

    useEffect(() => {
        params.then((p) => setId(p.id));
    }, [params]);

    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_CREATE]
    });

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading || !id) {
        return <PermissionLoaderCard />;
    }
    return (
        <section className='flex flex-col gap-6'>
            <SectionTitle
                title='Update Return Policy'
                url='/admin/return-policies'
            />
            <UpdateReturnPolicyForm id={id} />
        </section>
    );
};

export default UpdateReturnPolicyPage;
