'use client';

import { Button } from '@/components/ui/admin-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/admin-dropdown-menu';
import { Ellipsis } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';
import ManagePermissionsDialog from './manage-permissons-dialog';
import { PermissionEnum } from '@/types/permistion';
import { useDeleteRoleMutation } from '@/redux/api-queries/roles-api';

const StaffActions = ({
    staff,
    currentUserId
}: {
    staff: any;
    currentUserId: string;
}) => {
    const [openPermissionsModal, setOpenPermissionModal] = useState(false);
    const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation({});
    const handleDeleteRole = async (roleId: string) => {
        try {
            await deleteRole(roleId).unwrap();
            toast.success('Role deleted successfully.');
        } catch (error: any) {
            toast.error(
                error?.data?.message ||
                    'Failed to delete role. Please try again.'
            );
        }
    };
    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='outline'>
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild className='cursor-pointer'>
                        <Link href={`/admin/update-role/${staff?._id}`}>
                            Update Role
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant='destructive'
                        onClick={() =>
                            handleDeleteRole(currentUserId as string)
                        }
                        className='cursor-pointer'
                        disabled={isDeleting}
                    >
                        Delete Role
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {openPermissionsModal && (
                <ManagePermissionsDialog
                    open={openPermissionsModal}
                    setOpen={setOpenPermissionModal}
                    permissions={staff?.permissions as PermissionEnum[]}
                    staffId={staff?._id as string}
                />
            )}
        </>
    );
};

export default StaffActions;
