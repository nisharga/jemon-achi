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
import { IBusiness_location } from '@/types/admin/business-location';
import { Badge } from '@/components/ui/admin-badge';
import BusinessLocationActions from './business-location-actions';

type TableProps = {
    locations: [];
    isLoading: boolean;
    isFetching: boolean;
};

const TABLE_HEADERS = [
    'Sl No.',
    'Name',
    'Type',
    'District',
    'Address',
    'Manager Info',
    'Actions'
];

export function BusinessLocationTable({
    locations,
    isLoading,
    isFetching
}: TableProps) {
    return (
        <div className='rounded-lg bg-background p-2 shadow-md'>
            {!isLoading && !isFetching && (
                <Table>
                    {/* table header */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {TABLE_HEADERS.map((header, index) => (
                                <TableHead
                                    key={header}
                                    className={cn(
                                        'h-auto border-r border-r-primary/20 bg-primary/10 py-2 text-wrap whitespace-normal',
                                        {
                                            'rounded-tr-md border-r-0 text-center':
                                                index ===
                                                TABLE_HEADERS?.length - 1,
                                            'rounded-tl-md': index === 0
                                        }
                                    )}
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* table body */}
                    {locations?.length > 0 && (
                        <TableBody>
                            {locations?.map(
                                (
                                    location: IBusiness_location,
                                    index: number
                                ) => {
                                    return (
                                        <TableRow key={location?._id}>
                                            <TableCell className='w-8 border-r text-center whitespace-normal'>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                {location?.name}
                                            </TableCell>
                                            <TableCell className='w-24 border-r text-center whitespace-normal'>
                                                <Badge
                                                    variant={
                                                        location?.type ===
                                                        'OUTLET'
                                                            ? 'green-outline'
                                                            : 'blue-outline'
                                                    }
                                                >
                                                    {location?.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='w-24 border-r whitespace-normal'>
                                                {location?.address?.district}
                                            </TableCell>
                                            <TableCell className='w-40 border-r whitespace-normal'>
                                                {
                                                    location?.address
                                                        ?.local_address
                                                }
                                            </TableCell>
                                            <TableCell className='w-40 border-r whitespace-normal'>
                                                Name:{' '}
                                                {location?.manager_name ||
                                                    'N/A'}
                                                <br />
                                                Phone:{' '}
                                                {location?.contact_numbers &&
                                                location?.contact_numbers
                                                    ?.length > 0
                                                    ? location?.contact_numbers?.join(
                                                          ', '
                                                      )
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className='w-10 border-r text-center whitespace-normal'>
                                                <BusinessLocationActions
                                                    businessLocation={location}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            )}
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
            {!isLoading && locations?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}
