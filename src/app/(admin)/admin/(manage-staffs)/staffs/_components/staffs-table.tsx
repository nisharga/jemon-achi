'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/admin/components/ui/table';
import { cn } from '@/admin/lib/utils';
import React from 'react';
import { TUser } from '@/admin/types/user';
import { Badge } from '@/admin/components/ui/badge';
import { getRoleBadgeVariant } from '@/admin/utils/getRoleBadgeVariant';
import StaffActions from './starff-actions';
import { useLoggedInUser } from '@/admin/hooks/use-loggedin-user';

type StaffsTableProps = {
    staffs: [];
    isLoading: boolean;
    isFetching: boolean;
};

const STAFFS_TABLE_HEADERS = [
    'Name',
    'Phone Number',
    'Role',
    'Status',
    'Actions'
];

export function StaffsTable({
    staffs,
    isLoading,
    isFetching
}: StaffsTableProps) {
    const { profile } = useLoggedInUser();
    const currentUserId = profile?._id;

    return (
        <div className='rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && !isFetching && (
                <Table>
                    {/* table header */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {STAFFS_TABLE_HEADERS.map((header, index) => (
                                <TableHead
                                    key={header}
                                    className={cn('bg-primary/10 px-4', {
                                        'rounded-tr-md text-center':
                                            index ===
                                            STAFFS_TABLE_HEADERS?.length - 1,
                                        'rounded-tl-md': index === 0
                                    })}
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* table body */}
                    {staffs?.length > 0 && (
                        <TableBody>
                            {staffs?.map((staff: TUser) => {
                                return (
                                    <TableRow key={staff?._id}>
                                        <TableCell className='max-w-52 truncate px-4'>
                                            {staff?.full_name}{' '}
                                            {staff?._id === currentUserId && (
                                                <Badge variant='emerald'>
                                                    (You)
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            {staff?.phone_number}
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            {
                                                <Badge
                                                    variant={getRoleBadgeVariant(
                                                        staff?.role
                                                    )}
                                                >
                                                    {staff?.role.replace(
                                                        /_/g,
                                                        ' '
                                                    )}
                                                </Badge>
                                            }
                                            {staff?.outlet && (
                                                <span className='text-sm'>
                                                    <br /> at{' '}
                                                    {staff?.outlet?.name}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            {staff?.status}
                                        </TableCell>
                                        <TableCell className='px-4 text-center'>
                                            <StaffActions
                                                staff={staff}
                                                currentUserId={currentUserId}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    )}
                </Table>
            )}

            {/* loading data state */}
            {(isLoading || isFetching) && (
                <div className='grid w-full gap-4'>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <span
                            key={index}
                            className='animate-skeleton h-14 rounded-md bg-secondary'
                        />
                    ))}
                </div>
            )}

            {/* empty data state */}
            {!isLoading && staffs?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}

{
    /* <div className="w-fit mx-auto py-4">
  <Loader className="size-5 animate-spin" />
</div>; */
}
