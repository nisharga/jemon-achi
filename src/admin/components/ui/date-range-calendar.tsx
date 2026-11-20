'use client';

import * as React from 'react';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react';
import {
    addDays,
    format,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    subMonths,
    subYears,
    startOfDay,
    endOfDay
} from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/admin/lib/utils';
import { Button } from '@/admin/components/ui/button';
import { Calendar } from '@/admin/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/admin/components/ui/popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/admin/components/ui/dropdown-menu';

interface DateRangeOption {
    label: string;
    getValue: () => DateRange;
}

interface DateRangeCalendarProps {
    onDateChange?: (date: DateRange | undefined) => void;
    onOptionChange?: (option: string) => void;
    value?: DateRange | undefined;
    selectedOption?: string;
    className?: string;
    defaultOption?: string;
}

const dateRangeOptions: DateRangeOption[] = [
    {
        label: 'All Time',
        getValue: () => {
            return { from: new Date(0), to: new Date() };
        }
    },
    {
        label: 'Today',
        getValue: () => {
            const today = new Date();
            return { from: startOfDay(today), to: endOfDay(today) };
        }
    },
    {
        label: 'Yesterday',
        getValue: () => {
            const yesterday = addDays(new Date(), -1);
            return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
        }
    },
    {
        label: 'Last 7 Days',
        getValue: () => ({
            from: addDays(new Date(), -6),
            to: new Date()
        })
    },
    {
        label: 'Last 30 Days',
        getValue: () => ({
            from: addDays(new Date(), -29),
            to: new Date()
        })
    },
    {
        label: 'This Month',
        getValue: () => {
            const now = new Date();
            return {
                from: startOfMonth(now),
                to: endOfMonth(now)
            };
        }
    },
    {
        label: 'Last Month',
        getValue: () => {
            const lastMonth = subMonths(new Date(), 1);
            return {
                from: startOfMonth(lastMonth),
                to: endOfMonth(lastMonth)
            };
        }
    },
    {
        label: 'This month last year',
        getValue: () => {
            const thisMonthLastYear = subYears(new Date(), 1);
            return {
                from: startOfMonth(thisMonthLastYear),
                to: endOfMonth(thisMonthLastYear)
            };
        }
    },
    {
        label: 'This Year',
        getValue: () => {
            const now = new Date();
            return {
                from: startOfYear(now),
                to: endOfYear(now)
            };
        }
    },
    {
        label: 'Last Year',
        getValue: () => {
            const lastYear = subYears(new Date(), 1);
            return {
                from: startOfYear(lastYear),
                to: endOfYear(lastYear)
            };
        }
    },
    {
        label: 'Current financial year',
        getValue: () => {
            const now = new Date();
            const currentYear = now.getFullYear();
            const financialYearStart =
                now.getMonth() >= 3
                    ? new Date(currentYear, 3, 1)
                    : // April 1st of current year
                      new Date(currentYear - 1, 3, 1); // April 1st of previous year
            const financialYearEnd =
                now.getMonth() >= 3
                    ? new Date(currentYear + 1, 2, 31)
                    : // March 31st of next year
                      new Date(currentYear, 2, 31); // March 31st of current year
            return {
                from: financialYearStart,
                to: financialYearEnd
            };
        }
    },
    {
        label: 'Last financial year',
        getValue: () => {
            const now = new Date();
            const currentYear = now.getFullYear();
            const lastFinancialYearStart =
                now.getMonth() >= 3
                    ? new Date(currentYear - 1, 3, 1)
                    : // April 1st of previous year
                      new Date(currentYear - 2, 3, 1); // April 1st of year before previous
            const lastFinancialYearEnd =
                now.getMonth() >= 3
                    ? new Date(currentYear, 2, 31)
                    : // March 31st of current year
                      new Date(currentYear - 1, 2, 31); // March 31st of previous year
            return {
                from: lastFinancialYearStart,
                to: lastFinancialYearEnd
            };
        }
    }
];

export function DateRangeCalendar({
    onDateChange,
    onOptionChange,
    value,
    selectedOption: controlledSelectedOption,
    className,
    defaultOption
}: DateRangeCalendarProps = {}) {
    const [selectedOption, setSelectedOption] = React.useState<string>(
        controlledSelectedOption || defaultOption || 'This Year'
    );

    const getInitialDate = () => {
        if (value) return value;

        const optionToUse = defaultOption || 'This Year';
        const option = dateRangeOptions.find(
            (opt) => opt.label === optionToUse
        );
        return option ? option.getValue() : undefined;
    };

    const [date, setDate] = React.useState<DateRange | undefined>(
        getInitialDate()
    );

    React.useEffect(() => {
        if (value !== undefined) {
            setDate(value);
        }
    }, [value]);

    React.useEffect(() => {
        if (controlledSelectedOption !== undefined) {
            setSelectedOption(controlledSelectedOption);
        }
    }, [controlledSelectedOption]);

    const handleOptionSelect = (option: DateRangeOption) => {
        const newRange = option.getValue();
        setDate(newRange);
        setSelectedOption(option.label);
        setIsCalendarOpen(false);

        onDateChange?.(newRange);
        onOptionChange?.(option.label);
    };

    const handleCustomRangeSelect = () => {
        setSelectedOption('Custom Range');
        setIsCalendarOpen(true);
        onOptionChange?.('Custom Range');
    };

    const formatDateRange = (dateRange: DateRange | undefined) => {
        if (!dateRange?.from) return 'Pick a date range';

        if (!dateRange.to) {
            return format(dateRange.from, 'LLL dd, y');
        }

        if (dateRange.from.getTime() === dateRange.to.getTime()) {
            return format(dateRange.from, 'LLL dd, y');
        }

        return `${format(dateRange.from, 'LLL dd, y')} - ${format(
            dateRange.to,
            'LLL dd, y'
        )}`;
    };

    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

    return (
        <div className={cn('space-y-4', className)}>
            <div className='flex flex-wrap gap-2'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant='outline'
                            className='min-w-40 justify-between bg-transparent'
                        >
                            {selectedOption || 'Select date range'}
                            <ChevronDownIcon className='h-4 w-4 opacity-50' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-full' align='start'>
                        {dateRangeOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.label}
                                onClick={() => handleOptionSelect(option)}
                                className='cursor-pointer'
                            >
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                            onClick={handleCustomRangeSelect}
                            className='cursor-pointer'
                        >
                            Custom Range
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id='date'
                            variant='outline'
                            className={cn(
                                'min-w-60 justify-start text-left font-normal',
                                !date && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {formatDateRange(date)}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                            initialFocus
                            mode='range'
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={(newDate) => {
                                setDate(newDate);
                                if (newDate?.from && newDate?.to) {
                                    onOptionChange?.('Custom Range');
                                }
                                onDateChange?.(newDate);
                            }}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
