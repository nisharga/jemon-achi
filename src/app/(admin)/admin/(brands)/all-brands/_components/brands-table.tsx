'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/admin/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/admin/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/admin/components/ui/table';
import { useDeleteBrandMutation } from '@/admin/redux/api-queries/brand-api';
import { toast } from 'sonner';
import Link from 'next/link';
import { Badge } from '@/admin/components/ui/badge';

export interface IBrand {
    _id: string;
    name: string;
    tags: string[];
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
}

interface BrandsTableProps {
    brands: IBrand[];
    isLoading: boolean;
    isFetching: boolean;
}

const BrandsTable = ({ brands, isLoading, isFetching }: BrandsTableProps) => {
    const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

    const handleDeleteBrand = async (id: string) => {
        if (confirm('Are you sure you want to delete this brand?')) {
            try {
                await deleteBrand(id).unwrap();
                toast.success('Brand deleted successfully');
            } catch {
                toast.error('Failed to delete brand');
            }
        }
    };

    return (
        <div>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className='text-right'>
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isFetching ? (
                            <TableRow>
                                <TableCell colSpan={4} className='text-center'>
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : brands?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className='text-center'>
                                    No brands found
                                </TableCell>
                            </TableRow>
                        ) : (
                            brands?.map((brand) => (
                                <TableRow key={brand._id}>
                                    <TableCell className='font-medium'>
                                        {brand.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex flex-wrap gap-1'>
                                            {brand.tags?.length > 0 ? (
                                                brand.tags.map((tag, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant='secondary'
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className='text-sm text-muted-foreground'>
                                                    No tags
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                brand.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {brand.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    className='h-8 w-8 p-0'
                                                >
                                                    <span className='sr-only'>
                                                        Open menu
                                                    </span>
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end'>
                                                <DropdownMenuLabel>
                                                    Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/admin/update-brand/${brand._id}`}
                                                    >
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDeleteBrand(
                                                            brand._id
                                                        )
                                                    }
                                                    disabled={isDeleting}
                                                    className='text-destructive focus:text-destructive'
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export { BrandsTable };
