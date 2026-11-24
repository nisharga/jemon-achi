'use client';

import { Button } from '@/components/ui/admin-button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/admin-utils';
import { Loader, SquarePen, Trash2 } from 'lucide-react';
import React from 'react';
import { TReturnPolicy } from '@/types/admin/return-policy';
import Link from 'next/link';
import {
    useDeleteReturnPolicyMutation,
    useToggleReturnPolicyStatusMutation
} from '@/redux/admin/api/return-policy-api';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

type ReturnPoliciesTableProps = {
    returnPolicies: [];
    isLoading: boolean;
    isFetching: boolean;
};

const RETURN_POLICIES_TABLE_HEADERS = [
    'Title',
    'Description',
    'Return Period',
    //  "Conditions",
    'Status',
    'Actions'
];

export function ReturnPoliciesTable({
    returnPolicies,
    isLoading,
    isFetching
}: ReturnPoliciesTableProps) {
    // === delete return policy mutation hook ===
    const [deleteReturnPolicy, { isLoading: isDeleteLoading }] =
        useDeleteReturnPolicyMutation();

    // === toggle status mutation hook ===
    const [toggleStatus, { isLoading: isToggleLoading }] =
        useToggleReturnPolicyStatusMutation();

    const handleDelete = async (id: string) => {
        if (
            window.confirm(
                'Are you sure you want to delete this return policy?'
            )
        ) {
            try {
                const res = await deleteReturnPolicy({ id }).unwrap();
                if (res?.success) {
                    toast.success(
                        res?.message || 'Return policy deleted successfully'
                    );
                }
            } catch (error: any) {
                toast.error(
                    error?.data?.message || 'Failed to delete return policy'
                );
            }
        }
    };

    return (
        <div>
            <Table>
                {/* table header */}
                <TableHeader className='relative h-9 bg-sidebar'>
                    <TableRow>
                        {RETURN_POLICIES_TABLE_HEADERS.map((header) => (
                            <TableHead
                                key={header}
                                className={cn('bg-background')}
                            >
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                {/* table body */}
                {returnPolicies?.length > 0 && (
                    <TableBody>
                        {returnPolicies?.map((policy: TReturnPolicy) => {
                            return (
                                <TableRow key={policy?._id}>
                                    <TableCell className='font-semibold'>
                                        {policy?.title}
                                    </TableCell>
                                    <TableCell className='max-w-md whitespace-normal'>
                                        <div
                                            className=''
                                            dangerouslySetInnerHTML={{
                                                __html: policy?.description
                                            }}
                                        ></div>
                                    </TableCell>
                                    <TableCell>
                                        {policy?.return_period_days} days
                                    </TableCell>
                                    {/* <TableCell className='max-w-xs whitespace-normal'>
          {policy?.conditions?.join(", ") || "None"}
         </TableCell> */}
                                    <TableCell>
                                        <div className='flex items-center space-x-2'>
                                            <Switch
                                                id={`toggle-${policy?._id}`}
                                                disabled={isToggleLoading}
                                                checked={policy?.is_active}
                                                onCheckedChange={async () => {
                                                    try {
                                                        const res =
                                                            await toggleStatus({
                                                                id: policy?._id
                                                            }).unwrap();
                                                        if (res?.success) {
                                                            toast.success(
                                                                res?.message ||
                                                                    'Status updated successfully'
                                                            );
                                                        }
                                                    } catch (error: any) {
                                                        toast.error(
                                                            error?.data
                                                                ?.message ||
                                                                'Failed to update status'
                                                        );
                                                    }
                                                }}
                                            />
                                            <span className='text-xs text-muted-foreground uppercase'>
                                                {policy?.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className=''>
                                        <div className='flex items-center gap-2'>
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/update-return-policy/${policy?._id}`}
                                                >
                                                    <SquarePen className='h-4 w-4' />
                                                </Link>
                                            </Button>
                                            <Button
                                                size='sm'
                                                variant='destructive'
                                                onClick={() =>
                                                    handleDelete(policy?._id)
                                                }
                                                disabled={isDeleteLoading}
                                            >
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                )}
            </Table>

            {/* loading data state */}
            {(isLoading || isFetching) && (
                <div className='mx-auto w-fit py-4'>
                    <Loader className='size-5 animate-spin' />
                </div>
            )}

            {/* empty data state */}
            {!isLoading && returnPolicies?.length <= 0 && (
                <div className='py-4 text-center'>
                    No return policies found!
                </div>
            )}
        </div>
    );
}
