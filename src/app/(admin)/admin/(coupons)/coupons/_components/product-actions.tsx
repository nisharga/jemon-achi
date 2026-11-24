'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, buttonVariants } from '@/components/ui/admin-button';
import { Ellipsis, Eye } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import DeleteProductDialog from './delete-product-dialog';
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
import { ICoupon } from '@/types/admin/coupon';

const ProductActions = ({ product }: { product: ICoupon }) => {
    // delete product dialog state
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const router = useRouter();

    return (
        <>
            <div className='flex items-center gap-2'>
                <Link
                    href={`/admin/coupons/${product?._id}`}
                    className={cn(
                        buttonVariants({ variant: 'outline', size: 'icon' })
                    )}
                >
                    <Eye />
                </Link>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button size='icon' variant='outline'>
                            <Ellipsis />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            variant='destructive'
                            onClick={() => setOpenDeleteDialog(true)}
                            className='cursor-pointer'
                        >
                            Delete Coupon
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* delete product dialog */}
            <DeleteProductDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                productId={product?._id}
                productName={product?.code}
            />
        </>
    );
};

export default ProductActions;
