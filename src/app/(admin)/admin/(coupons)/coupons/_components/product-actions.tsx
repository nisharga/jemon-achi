'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, buttonVariants } from '@/admin/components/ui/button';
import { Ellipsis, Eye } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import DeleteProductDialog from './delete-product-dialog';
import { TProduct } from '@/admin/types/product';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/admin/components/ui/dropdown-menu';
import { cn } from '@/admin/lib/utils';
import { ICoupon } from '@/admin/types/coupon';

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
