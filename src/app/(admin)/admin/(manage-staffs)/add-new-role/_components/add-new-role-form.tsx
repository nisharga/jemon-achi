'use client';

import React, { useState, useMemo } from 'react';
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
import { PermissionEnum } from '@/types/admin/permistion';
import { useCreateRoleMutation } from '@/redux/admin/api/roles-api';
import { useRouter } from 'next/navigation';

const formatKey = (key: string) => {
    return key
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

export default function AddNewRoleForm() {
    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<
        PermissionEnum[]
    >([]);
    const [createRole, { isLoading }] = useCreateRoleMutation();
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
            const res: any = await createRole(payload).unwrap();

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

    return (
        <div className='space-y-4'>
            {/* Action Bar */}
            <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                <h1 className='text-2xl font-medium'>Add New Role</h1>

                <div className='flex items-center gap-3'>
                    <Button
                        onClick={handleSaveRole}
                        disabled={isLoading}
                        className='shadow-lg'
                    >
                        {isLoading ? (
                            <Loader className='mr-2 size-4 animate-spin' />
                        ) : (
                            <Save className='mr-2 size-4' />
                        )}
                        Save Role
                    </Button>
                </div>
            </div>

            {/* Role Identity Card */}
            <div className='flex max-w-sm flex-col gap-4'>
                <div className='space-y-2'>
                    <Label
                        htmlFor='role_name'
                        className='text-sm font-semibold'
                    >
                        Role Name
                    </Label>
                    <Input
                        id='role_name'
                        placeholder='e.g. Sales Executive'
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className='h-10 bg-card'
                    />
                </div>
            </div>

            {/* Global Select All Toggle */}
            <div className='flex max-w-[210px] items-center space-x-2 rounded-lg border-1 border-primary/40 bg-muted/50 px-3 py-2'>
                <Checkbox
                    id='global-all'
                    checked={isAllGlobalSelected}
                    onCheckedChange={(checked) =>
                        handleGlobalSelectAll(!!checked)
                    }
                    className='peer size-4 shrink-0 rounded-[4px] border border-black shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary'
                />
                <Label
                    htmlFor='global-all'
                    className='cursor-pointer text-xs font-semibold uppercase'
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
                                    className={`flex flex-row items-center justify-between space-y-0 rounded-lg bg-muted py-3 ${
                                        isAllGroupSelected
                                            ? 'bg-primary/5'
                                            : 'bg-muted/50'
                                    }`}
                                >
                                    <div>
                                        <CardTitle className='text-base font-semibold text-primary'>
                                            {formatKey(groupKey)}
                                        </CardTitle>
                                        <span className='text-[12px] font-medium text-primary'>
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
                                                    className='peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary'
                                                />
                                                <label
                                                    htmlFor={permission}
                                                    className='cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
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
