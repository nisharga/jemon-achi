'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { useGetAllOutletQuery } from '@/admin/redux/api-queries/outlet-api';
import { TOutlet } from '@/admin/types/product';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Dispatch, SetStateAction, useEffect } from 'react';

const AvailableOutletsAndSelect = ({
    selectedOutlet,
    setSelectedOutlet
}: {
    selectedOutlet: TOutlet;
    setSelectedOutlet: Dispatch<SetStateAction<TOutlet | null>>;
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const outlet_id = searchParams.get('outlet_id') ?? '';

    const { data: OutletResdata, isLoading } = useGetAllOutletQuery({});
    const outlets = OutletResdata?.data?.outlets;

    // Update state and router on selection
    const handleSelectOutlet = (_id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('outlet_id', _id);
        router.push(`?${params.toString()}`);

        const foundOutlet = outlets?.find(
            (outlet: TOutlet) => outlet?._id === _id
        );
        if (foundOutlet) {
            setSelectedOutlet(foundOutlet);
        }
    };

    // Pre-select from query param on mount or data load
    useEffect(() => {
        if (outlet_id && outlets?.length > 0) {
            const found = outlets?.find(
                (outlet: TOutlet) => outlet?._id === outlet_id
            );
            if (found) {
                setSelectedOutlet(found);
            }
        }
    }, [outlet_id, outlets, setSelectedOutlet]);

    return (
        <div className='mt-6 space-y-2 rounded-md bg-background p-4 shadow hover:shadow-lg'>
            <h3 className='text-sm font-semibold'>Select Outlet</h3>

            {isLoading ? (
                <div className='h-9 animate-pulse rounded-md bg-secondary' />
            ) : (
                <Select
                    value={selectedOutlet?._id}
                    onValueChange={handleSelectOutlet}
                >
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select Outlet' />
                    </SelectTrigger>
                    <SelectContent>
                        {outlets?.map((outlet: TOutlet) => (
                            <SelectItem key={outlet?._id} value={outlet?._id}>
                                {outlet?.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};

export default AvailableOutletsAndSelect;
