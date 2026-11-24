'use client';

import { Button } from '@/components/ui/admin-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/admin-dropdown-menu';
import { IBusiness_location } from '@/types/admin/business-location';
import { Edit, Ellipsis, Trash } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import DeleteBusinessDialog from './delete-dialog';

const BusinessLocationActions = ({
    businessLocation
}: {
    businessLocation: IBusiness_location;
}) => {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='outline'>
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/admin/business-location/edit/${businessLocation?._id}`}
                        >
                            <Edit /> Edit Location
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant='destructive'
                        onClick={() => setOpenDeleteDialog(true)}
                        className='cursor-pointer'
                    >
                        <Trash /> Delete Location
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* delete product dialog */}
            <DeleteBusinessDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                productId={businessLocation?._id}
                productName={'Business Location'}
            />
        </>
    );
};

export default BusinessLocationActions;
