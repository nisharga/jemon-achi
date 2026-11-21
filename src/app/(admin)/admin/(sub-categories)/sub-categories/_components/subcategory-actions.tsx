'use client';

import { Button } from '@/components/ui/admin-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/admin-dropdown-menu';
import { TSubCategory } from '@/types/sub-category';
import { Edit, Ellipsis, Trash } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import DeleteSubCategoryDialog from './delete-subcategory-dialog';

type SubCategoryActionsProps = {
    subCategory: TSubCategory;
    isSubSubcategory?: boolean;
};

const SubCategoryActions = ({
    subCategory,
    isSubSubcategory = false
}: SubCategoryActionsProps) => {
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
                        <Link
                            href={`/admin/update-sub-category/${subCategory?._id}`}
                        >
                            <Edit className='mr-2 size-4' /> Edit{' '}
                            {isSubSubcategory
                                ? 'Sub-subcategory'
                                : 'Subcategory'}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant='destructive'
                        onClick={() => setOpenDeleteDialog(true)}
                        className='cursor-pointer'
                    >
                        <Trash className='mr-2 size-4' /> Delete{' '}
                        {isSubSubcategory ? 'Sub-subcategory' : 'Subcategory'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* delete subcategory dialog */}
            <DeleteSubCategoryDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                subCategoryId={subCategory?._id}
                subCategoryName={subCategory?.name_en}
                isSubSubcategory={isSubSubcategory}
            />
        </>
    );
};

export default SubCategoryActions;
