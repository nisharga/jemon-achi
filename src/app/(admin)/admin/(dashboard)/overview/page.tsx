'use client';

import { useHasPermission } from '@/hooks/use-has-permission';
import ReportCards from './_components/report-cards';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

export default function OverviewOutlet() {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.OVERVIEW_VIEW]
    });

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }
    return (
        <div className='space-y-6'>
            <ReportCards />
        </div>
    );
}
