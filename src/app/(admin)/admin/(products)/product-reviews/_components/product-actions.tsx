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
import DeleteProductDialog from './delete-product-dialog';

const ProductActions = ({ product }: { product: any }) => {
    // delete product dialog state
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const router = useRouter();

    return (
        <>
            <div className='flex items-center gap-2'>
                <Link
                    href={`/admin/product-reviews/${product?._id}`}
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
                        <DropdownMenuItem asChild className='cursor-pointer'>
                            <Link
                                href={`/admin/product-reviews/${product?._id}`}
                            >
                                Reply
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant='destructive'
                            onClick={() => setOpenDeleteDialog(true)}
                            className='cursor-pointer'
                        >
                            Delete Review
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* delete product dialog */}
            <DeleteProductDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                productId={product?._id}
                productName={product?.name}
            />
        </>
    );
};

export default ProductActions;

{
    /* <div className="space-y-2 w-fit">
        <Button
          size="sm"
          className="w-full bg-emerald-500"
          onClick={() => {
            router.push(
              `/admin/inventory/warehouse-update?product_id=${product?._id}`
            );
          }}
        >
          Update Inventory
        </Button>
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/admin/product-details/${product?._id}`}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            <Eye />
          </Link>
          <Link
            href={`/admin/update-product/${product?._id}`}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            <SquarePen />
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="hover:text-destructive"
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Trash />
          </Button>
        </div>
      </div> */
}

{
    /* <DropdownMenuItem asChild className="cursor-pointer">
              <Link
                href={`/admin/inventory/warehouse-update?product_id=${product?._id}`}
              >
                Update Inventory
              </Link>
            </DropdownMenuItem> */
}
