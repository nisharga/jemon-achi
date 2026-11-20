'use client';

import { Button } from '@/admin/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/admin/components/ui/dropdown-menu';
import { TUser } from '@/admin/types/user';
import { Ellipsis } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import DeleteStaffDialog from './delete-staff-dialog';
import ManagePermissionsDialog from './manage-permissons-dialog';
import { PermissionEnum } from '@/admin/types/permistion';

const StaffActions = ({
    staff,
    currentUserId
}: {
    staff: TUser;
    currentUserId: string;
}) => {
    const [openPermissionsModal, setOpenPermissionModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
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
                        <Link href={`/admin/update-staff/${staff?._id}`}>
                            Update Staff
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setOpenPermissionModal(true)}
                        // onClick={() => toast.info("Feature coming soon!")}
                    >
                        Manage Permissions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant='destructive'
                        onClick={() => setOpenDeleteModal(true)}
                        className='cursor-pointer'
                        disabled={staff?._id === currentUserId}
                    >
                        Delete Staff
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

            {openDeleteModal && (
                <DeleteStaffDialog
                    open={openDeleteModal}
                    setOpen={setOpenDeleteModal}
                    staffId={staff?._id as string}
                    staffName={staff?.full_name as string}
                />
            )}
        </>
    );
};

export default StaffActions;
