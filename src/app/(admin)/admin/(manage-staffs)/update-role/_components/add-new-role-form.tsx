'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader, Save } from 'lucide-react';
import { Button } from '@/components/ui/admin-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/admin-label';
import { Input } from '@/components/ui/admin-input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/admin-card';
import { USER_PERMISSIONS } from '@/constants/user-permissions';
import { PermissionEnum } from '@/types/permistion';
import {
    useGetRoleByIdQuery,
    useUpdateRoleMutation
} from '@/redux/api-queries/roles-api';
import { useRouter } from 'next/navigation';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

const formatKey = (key: string) => {
    return key
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

export default function AddNewRoleForm({ slug }: { slug: string }) {
    const { data: roleData, isLoading } = useGetRoleByIdQuery(slug);
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<
        PermissionEnum[]
    >([]);
    const router = useRouter();

    // 1. Flatten all available permissions for the "Global Select All" logic
    const allAvailablePermissions = useMemo(() => {
        return Object.values(USER_PERMISSIONS).flat();
    }, []);

    const isAllGlobalSelected =
        selectedPermissions.length === allAvailablePermissions.length;

    // 2. Handlers
    const handleGlobalSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedPermissions([...allAvailablePermissions]);
        } else {
            setSelectedPermissions([]);
        }
    };

    const handleCheckboxChange = (
        permission: PermissionEnum,
        isChecked: boolean
    ) => {
        setSelectedPermissions((prev) =>
            isChecked
                ? [...prev, permission]
                : prev.filter((p) => p !== permission)
        );
    };

    const handleSelectAllGroup = (
        groupPermissions: PermissionEnum[],
        isChecked: boolean
    ) => {
        setSelectedPermissions((prev) => {
            if (isChecked) {
                const otherPermissions = prev.filter(
                    (p) => !groupPermissions.includes(p)
                );
                return [...otherPermissions, ...groupPermissions];
            } else {
                return prev.filter((p) => !groupPermissions.includes(p));
            }
        });
    };

    const handleSaveRole = async () => {
        // Client-side validation
        if (!roleName.trim()) return toast.error('Please enter a role name');
        if (selectedPermissions.length === 0) {
            return toast.error('Please select at least one permission');
        }

        const payload = {
            role_name: roleName,
            permissions: selectedPermissions
        };

        try {
            const res: any = await updateRole({
                id: slug,
                payload
            }).unwrap();

            if (res?.success) {
                toast.success(res?.message || 'Role created successfully!');
                router.push('/admin/role'); // Navigate to list view
            }
        } catch (error: any) {
            console.error('CREATE ROLE ERROR:', error);

            // Extract error messages from your standard API response structure
            const errorMessage =
                error?.data?.message ||
                error?.data?.errorMessages?.[0]?.message ||
                'Failed to create role. Please try again.';

            toast.error(errorMessage);
        }
    };

    // Sync API data to local state when it loads
    useEffect(() => {
        if (roleData?.data) {
            setRoleName(roleData.data.role_name);
            setSelectedPermissions(roleData.data.permissions);
        }
    }, [roleData]);

    if (isLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <div className='space-y-4'>
            {/* Action Bar */}
            <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                <h1 className='text-2xl font-medium'>Update Role</h1>

                <div className='flex items-center gap-3'>
                    <Button
                        onClick={handleSaveRole}
                        disabled={isUpdating}
                        className='shadow-lg'
                    >
                        {isUpdating ? (
                            <Loader className='mr-2 size-4 animate-spin' />
                        ) : (
                            <Save className='mr-2 size-4' />
                        )}
                        Update Role
                    </Button>
                </div>
            </div>

            {/* Role Identity Card */}
            <Card className='flex max-w-md flex-col gap-4 rounded-xl border border-primary/10 bg-card text-card-foreground shadow-sm'>
                <CardContent className=''>
                    <div className='space-y-2'>
                        <Label
                            htmlFor='role_name'
                            className='text-sm font-semibold'
                        >
                            Role Name
                        </Label>
                        <Input
                            id='role_name'
                            placeholder='e.g. Senior Editor'
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className='h-11'
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Global Select All Toggle */}
            <div className='flex max-w-[210px] items-center space-x-2 rounded-lg border bg-muted/50 px-3 py-2'>
                <Checkbox
                    id='global-all'
                    checked={isAllGlobalSelected}
                    onCheckedChange={(checked) =>
                        handleGlobalSelectAll(!!checked)
                    }
                />
                <Label
                    htmlFor='global-all'
                    className='cursor-pointer text-xs font-bold uppercase'
                >
                    {isAllGlobalSelected
                        ? 'Deselect All'
                        : 'Select All Permissions'}
                </Label>
            </div>

            {/* Permissions Grid */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {Object.entries(USER_PERMISSIONS).map(
                    ([groupKey, permissions]) => {
                        const groupSelectedCount = permissions.filter((p) =>
                            selectedPermissions.includes(p)
                        ).length;
                        const isAllGroupSelected =
                            groupSelectedCount === permissions.length;
                        const isSomeGroupSelected =
                            groupSelectedCount > 0 && !isAllGroupSelected;

                        return (
                            <Card
                                key={groupKey}
                                className={`flex flex-col !gap-0 rounded-xl border border-muted bg-card !py-0 text-card-foreground shadow-sm transition-all duration-200 ${
                                    isAllGroupSelected
                                        ? 'border-primary ring-1 ring-primary/20'
                                        : 'border-muted'
                                }`}
                            >
                                <CardHeader
                                    className={`flex flex-row items-center justify-between space-y-0 rounded-lg py-3 ${
                                        isAllGroupSelected
                                            ? 'bg-primary/5'
                                            : 'bg-muted/20'
                                    }`}
                                >
                                    <div className='space-y-0.5'>
                                        <CardTitle className='text-[12px] font-black tracking-widest text-muted-foreground uppercase'>
                                            {formatKey(groupKey)}
                                        </CardTitle>
                                        <span className='text-[10px] font-medium text-primary'>
                                            {groupSelectedCount} /{' '}
                                            {permissions.length} selected
                                        </span>
                                    </div>
                                    <Checkbox
                                        checked={
                                            isAllGroupSelected ||
                                            (isSomeGroupSelected
                                                ? 'indeterminate'
                                                : false)
                                        }
                                        onCheckedChange={(checked) =>
                                            handleSelectAllGroup(
                                                permissions,
                                                !!checked
                                            )
                                        }
                                    />
                                </CardHeader>
                                <CardContent className='flex-grow px-4 py-4 md:px-6 md:py-6'>
                                    <div className='space-y-3'>
                                        {permissions.map((permission) => (
                                            <div
                                                key={permission}
                                                className='group flex items-center space-x-3'
                                            >
                                                <Checkbox
                                                    id={permission}
                                                    checked={selectedPermissions.includes(
                                                        permission
                                                    )}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleCheckboxChange(
                                                            permission,
                                                            !!checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={permission}
                                                    className='cursor-pointer text-[13px] font-medium text-gray-600 transition-colors group-hover:text-primary'
                                                >
                                                    {permission.split('.')[1] ||
                                                        permission}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }
                )}
            </div>
        </div>
    );
}
