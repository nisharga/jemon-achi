'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/admin-utils';
import React from 'react';
import { IRole } from '@/types/admin-user';
import { Badge } from '@/components/ui/admin-badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/admin-tooltip';

import { useLoggedInUser } from '@/hooks/use-loggedin-user';
import StaffActions from './starff-actions';

type StaffsTableProps = {
    staffs: {
        meta: any;
        roles: IRole[];
    };
    isLoading: boolean;
    isFetching: boolean;
};

const STAFFS_TABLE_HEADERS = [
    'Role',
    'Total Permission',
    'Permissions List',
    'Actions'
];

export function StaffsTable({
    staffs,
    isLoading,
    isFetching
}: StaffsTableProps) {
    const { profile } = useLoggedInUser();
    const currentUserId = profile?._id;

    const roles = staffs?.roles || [];

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
                    {roles.length > 0 && (
                        <TableBody>
                            {roles?.map((staff: IRole) => {
                                const id = staff?._id || '';
                                const permissions = staff?.permissions || [];
                                const role_name = staff?.role_name || '';
                                const totalPermissions =
                                    staff?.permissions?.length || 0;

                                return (
                                    <TableRow key={staff?._id}>
                                        <TableCell className='max-w-52 truncate px-4'>
                                            {role_name}{' '}
                                            {staff?._id === currentUserId && (
                                                <Badge variant='emerald'>
                                                    (You)
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className='px-4'>
                                            {totalPermissions}
                                        </TableCell>
                                        <TableCell className='px-4 py-2'>
                                            <PermissionCell
                                                permissions={permissions}
                                            />
                                        </TableCell>
                                        <TableCell className='flex items-center justify-center px-4 py-2'>
                                            <StaffActions
                                                staff={staff}
                                                currentUserId={id}
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
            {!isLoading && roles.length <= 0 && (
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

const PermissionCell = ({ permissions }: { permissions: string[] }) => {
    if (!permissions || permissions.length === 0)
        return (
            <span className='text-xs text-gray-400 italic'>No permissions</span>
        );

    const visibleCount = 3;
    const displayPermissions = permissions.slice(0, visibleCount);
    const remainingCount = permissions.length - visibleCount;

    return (
        <div className='flex max-w-[350px] flex-wrap gap-1'>
            {displayPermissions.map((perm) => (
                <Badge
                    key={perm}
                    variant='outline'
                    className='border-gray-200 bg-gray-50/50 px-1.5 py-0 text-[12px] font-medium text-gray-600'
                >
                    {perm.split('.')[1] || perm}
                </Badge>
            ))}

            {remainingCount > 0 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant='outline'
                                className='cursor-help border-primary/20 bg-primary/5 px-1.5 py-0 text-[10px] text-primary'
                            >
                                +{remainingCount} more
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent className='max-w-[350px] border bg-white p-3 shadow-xl'>
                            <div className='flex flex-wrap gap-1'>
                                {permissions.map((perm) => (
                                    <span
                                        key={perm}
                                        className='rounded border bg-muted px-1 text-[12px] text-muted-foreground'
                                    >
                                        {perm}
                                    </span>
                                ))}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
};
