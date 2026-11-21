'use client';

import { Button } from '@/components/ui/admin-button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/admin-label';
import { USER_PERMISSIONS } from '@/constants/user-permissions';
import { useManagePermissionsMutation } from '@/redux/api-queries/staff-api';
import { PermissionEnum } from '@/types/permistion';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

type AddNewStaffDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    permissions: PermissionEnum[];
    staffId: string;
};

// Helper function to format permission keys into a display name
const formatKey = (key: string) => {
    const parts = key.split('_');
    return parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const ManagePermissionsDialog = ({
    open,
    setOpen,
    permissions,
    staffId
}: AddNewStaffDialogProps) => {
    // === router ===
    const router = useRouter();

    // === permissions and note state ===
    const [selectedPermissions, setSelectedPermissions] = useState<
        PermissionEnum[]
    >(permissions ?? []);
    // const [note, setNote] = useState("");

    // === handle checkbox change ===
    const handleCheckboxChange = (
        permission: PermissionEnum,
        isChecked: boolean
    ) => {
        setSelectedPermissions((prev) => {
            if (isChecked) {
                return [...prev, permission];
            } else {
                return prev?.filter((p) => p !== permission);
            }
        });
    };

    // === manage permissions api hook ===
    const [managePermissions, { isLoading }] = useManagePermissionsMutation();

    // === handle manage permissions ===
    const handleManagePermissions = async () => {
        const payload = {
            permissions: selectedPermissions,
            id: staffId,
            note: ''
        };

        try {
            const res: any = await managePermissions({ payload });
            if (res?.data?.success) {
                toast.success('Staff permissions updated!');
                router.replace('/admin/staffs');
                setOpen(false);
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to update staff permissions!'
                );
            }
        } catch (error: any) {
            console.error('UPDATE STAFF PERMISSIONS ERROR: ', error);
            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            } else {
                toast.error('Somthing went wrong!');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-5xl'>
                <DialogHeader>
                    <DialogTitle>Manage Permissions</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Manage Permissions dialog description
                    </DialogDescription>
                </DialogHeader>

                <div className='grid grid-cols-2 gap-6 lg:grid-cols-4'>
                    {Object.entries(USER_PERMISSIONS).map(
                        ([groupKey, permissions]) => (
                            <div key={groupKey} className='space-y-4'>
                                <Label className='h-9 bg-muted px-4 py-2'>
                                    {formatKey(groupKey)}
                                </Label>

                                <div className='grid gap-4'>
                                    {permissions?.map((permission) => {
                                        // The permission value will be like 'ORDER_CREATE'
                                        // const permissionName = permission?.split("_");
                                        const isChecked =
                                            selectedPermissions?.includes(
                                                permission
                                            );

                                        console.log(permission, 'permission');

                                        return (
                                            <div
                                                key={permission}
                                                className='flex items-center space-x-2'
                                            >
                                                <Checkbox
                                                    id={permission}
                                                    checked={isChecked}
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
                                                    className='cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                                >
                                                    {permission}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* <div className="space-y-2">
          <Label>Note</Label>
          <Textarea
            placeholder="Enter your note"
            onChange={(e) => setNote(e?.target?.value)}
          />
        </div> */}

                <Button disabled={isLoading} onClick={handleManagePermissions}>
                    {isLoading ? (
                        <>
                            <Loader className='size-4 animate-spin' />
                            Saving..
                        </>
                    ) : (
                        `Save`
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default ManagePermissionsDialog;
