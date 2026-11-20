'use client';

import { useRouter } from 'next/navigation';
import { useLoggedInUser } from './use-loggedin-user';
import { PermissionEnum } from '@/admin/types/permistion';

type PermissionHookProps = {
    permissions: PermissionEnum[];
};

export const useHasPermission = ({ permissions }: PermissionHookProps) => {
    const { profile, isLoading } = useLoggedInUser();

    const router = useRouter();

    let hasPermission;

    const userPermissions = profile?.permissions ?? [];

    const perms = Array.isArray(permissions) ? permissions : [permissions];
    const hasAll = perms.every((p) => userPermissions.includes(p));

    if (!hasAll) {
        hasPermission = false;
    } else {
        hasPermission = true;
    }

    const redirectTo = (redirectUrl: string) => {
        router.replace(redirectUrl);
    };

    return { hasPermission, isPermissionLoading: isLoading, redirectTo };
};
