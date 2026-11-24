'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, buttonVariants } from '@/components/ui/admin-button';
import { Ellipsis, Eye } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { TProduct } from '@/types/admin/product';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/admin-dropdown-menu';
import { cn } from '@/lib/admin-utils';
import DeleteProductDialog from '@/app/(admin)/admin/(coupons)/coupons/_components/delete-product-dialog';
import DeleteSupplierDialog from './delete-supplier-dialog';

const SupplierActions = ({ product }: { product: any }) => {
    // delete product dialog state
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const router = useRouter();

    return (
        <>
            <div className='flex items-center justify-center gap-2'>
                {/*  <Link
          href={`/admin/product-details/${product?._id}`}
          className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
        >
          <Eye />
        </Link> */}
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button size='icon' variant='outline'>
                            <Ellipsis />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild className='cursor-pointer'>
                            <Link
                                href={`/admin/update-supplier/${product?._id}`}
                            >
                                Update Supplier
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant='destructive'
                            onClick={() => setOpenDeleteDialog(true)}
                            className='cursor-pointer'
                        >
                            Delete Supplier
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* delete product dialog */}
            <DeleteSupplierDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                productId={product?._id}
                productName={product?.name}
            />
        </>
    );
};

export default SupplierActions;
