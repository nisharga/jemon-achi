'use client';
import React from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, CheckIcon } from 'lucide-react';

interface ISubCategory {
    _id: string;
    name: string;
}

interface SubCategoryFilterProps {
    data: ISubCategory[] | undefined;
    selectedId: any; // Changed from Array to String
    onSelectionChange: (id: string | null) => void; // Simplified handler
    isLoading?: boolean;
}

export const SubCategoryFilter = ({
    data = [],
    selectedId,
    onSelectionChange,
    isLoading
}: SubCategoryFilterProps) => {
    if (isLoading)
        return <div className='animate-pulse p-4 text-sm'>Loading...</div>;
    if (!data.length) return null;

    const handleToggle = (id: string, checked: boolean) => {
        // If user unchecks the current one, set to null.
        // If they check a new one, it replaces the old one.
        if (checked) {
            onSelectionChange(id);
        } else {
            onSelectionChange(null);
        }
    };

    return (
        <Collapsible.Root defaultOpen className='mt-4 border-t pt-4'>
            <Collapsible.Trigger className='flex w-full items-center justify-between font-medium'>
                Sub Categories
                <ChevronDown className='h-4 w-4' />
            </Collapsible.Trigger>

            <Collapsible.Content className='mt-2 space-y-2'>
                {data?.map((item) => {
                    return (
                        <div
                            key={item._id}
                            className='flex items-center space-x-2'
                        >
                            <Checkbox.Root
                                id={item._id}
                                // It is checked ONLY if its ID matches the single selectedId
                                checked={selectedId === item._id}
                                onCheckedChange={(checked) =>
                                    handleToggle(item._id, checked as boolean)
                                }
                                className='flex h-4 w-4 items-center justify-center rounded border border-gray-300 data-[state=checked]:bg-blue-600'
                            >
                                <Checkbox.Indicator className='text-white'>
                                    <CheckIcon className='h-3 w-3' />
                                </Checkbox.Indicator>
                            </Checkbox.Root>

                            <Label.Root
                                htmlFor={item._id}
                                className='flex-1 cursor-pointer text-sm select-none'
                            >
                                {item.name}
                            </Label.Root>
                        </div>
                    );
                })}
            </Collapsible.Content>
        </Collapsible.Root>
    );
};
