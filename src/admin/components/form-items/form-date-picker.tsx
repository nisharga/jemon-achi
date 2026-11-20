'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/admin/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/admin/components/ui/popover';
import { Button } from '@/admin/components/ui/button';
import { Calendar } from '@/admin/components/ui/calendar';
import { cn } from '@/admin/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface FormDatePickerProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    placeholder?: string;
}

export const FormDatePicker = <T extends FieldValues>({
    control,
    name,
    label,
    placeholder
}: FormDatePickerProps<T>) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className='flex flex-col'>
                    <FormLabel>{label}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                    )}
                                >
                                    {field.value ? (
                                        format(field.value, 'PPP')
                                    ) : (
                                        <span>
                                            {placeholder || 'Pick a date'}
                                        </span>
                                    )}
                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                                mode='single'
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date < new Date('1900-01-01')
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
