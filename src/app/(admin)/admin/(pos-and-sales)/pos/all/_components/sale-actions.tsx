'use client';

import { Button } from '@/components/ui/admin-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
    // DropdownMenuSeparator,
} from '@/components/ui/admin-dropdown-menu';
import { IPOSSale } from '@/types/admin/pos-sale';
import { Edit, Ellipsis, Trash, Undo2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import DeleteSaleDialog from './delete-sale-dialog';
import SaleReturnDialog from './sale-return-dialog';

const SaleActions = ({ sale }: { sale: IPOSSale }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    // === open sale return dialog ===
    const [openSaleReturnDialog, setOpenSaleReturnDialog] = useState(false);

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='outline'>
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                    {/* <DropdownMenuItem>
            <Eye /> View
          </DropdownMenuItem> */}
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/pos/edit/${sale?._id}`}>
                            <Edit /> Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setOpenSaleReturnDialog(true)}
                    >
                        <Undo2 /> Sale Return
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant='destructive'
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* delete sale dialog */}
            <DeleteSaleDialog
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                pos_sale_id={sale?._id as string}
            />

            {/* sale return dialog */}
            {openSaleReturnDialog && (
                <SaleReturnDialog
                    open={openSaleReturnDialog}
                    setOpen={setOpenSaleReturnDialog}
                    sale={sale}
                />
            )}
        </>
    );
};

export default SaleActions;
