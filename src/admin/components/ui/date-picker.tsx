'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/admin/components/ui/button';
import { Calendar } from '@/admin/components/ui/calendar';
import { Input } from '@/admin/components/ui/input';
import { Label } from '@/admin/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/admin/components/ui/popover';

interface DatePickerProps {
    value: string; // ISO string or formatted date string
    onChange: (value: string) => void;
    label?: string; // defaults to "Select Date"
}

function parseDate(value: string): Date | undefined {
    const d = new Date(value);

    return d;
}

function formatDate(date: Date | undefined): string {
    return (
        date?.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }) ?? ''
    );
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    label = 'Select Date'
}) => {
    const parsedDate = parseDate(value);
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(parsedDate);
    const [month, setMonth] = React.useState<Date | undefined>(parsedDate);

    React.useEffect(() => {
        const parsed = parseDate(value);
        setDate(parsed);
        setMonth(parsed);
    }, [value]);

    const handleSelect = (selected: Date | undefined) => {
        if (selected) {
            setDate(selected);
            setMonth(selected);
            setOpen(false);
            onChange(selected.toISOString()); // Returns "YYYY-MM-DDTHH:mm"
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <Label htmlFor='date'>{label}</Label>
            <div className='relative flex gap-2'>
                <Input
                    id='date'
                    value={formatDate(date)}
                    readOnly
                    placeholder='Select date'
                    className='bg-background pr-10'
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant='ghost'
                            className='absolute top-1/2 right-2 size-6 -translate-y-1/2'
                        >
                            <CalendarIcon className='size-3.5' />
                            <span className='sr-only'>Select date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className='w-auto overflow-hidden p-0'
                        align='end'
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                            mode='single'
                            selected={date}
                            captionLayout='dropdown'
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={handleSelect}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};
