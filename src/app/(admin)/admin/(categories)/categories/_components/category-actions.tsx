'use client';

import { Button } from '@/components/ui/admin-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/admin-dropdown-menu';
import { TCategory } from '@/types/category';
import { Edit, Ellipsis, Trash } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import DeleteCategoryDialog from './delete-category-dialog';

type CategoryActionsProps = {
    category: TCategory;
};

const CategoryActions = ({ category }: CategoryActionsProps) => {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='outline'>
                        <Ellipsis className='size-4' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/update-category/${category?._id}`}>
                            <Edit className='mr-2 size-4' /> Edit Category
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant='destructive'
                        onClick={() => setOpenDeleteDialog(true)}
                        className='cursor-pointer'
                    >
                        <Trash className='mr-2 size-4' /> Delete Category
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* delete category dialog */}
            <DeleteCategoryDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                categoryId={category?._id}
                categoryName={category?.name_en}
            />
        </>
    );
};

export default CategoryActions;
