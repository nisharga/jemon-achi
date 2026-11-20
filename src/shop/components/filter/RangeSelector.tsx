'use client';
import React from 'react';
import * as Slider from '@radix-ui/react-slider';

interface RangeSelectorProps {
    minPrice: number;
    maxPrice: number;
    setMinPrice: (val: number) => void;
    setMaxPrice: (val: number) => void;
    onFilterGo?: () => void; // Function to trigger API if you don't want it real-time
    maxLimit?: number;
}

const RangeSelector = ({
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    onFilterGo,
    maxLimit = 3000
}: RangeSelectorProps) => {
    const handleSliderChange = (values: number[]) => {
        setMinPrice(values[0]);
        setMaxPrice(values[1]);
    };

    return (
        <div className='space-y-3'>
            <h4 className='font-medium text-gray-900'>Price</h4>

            {/* Inputs */}
            <div className='flex items-center gap-2'>
                <input
                    type='number'
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    className='w-full rounded border border-gray-300 px-2 py-1 text-sm'
                />
                <span className='text-gray-500'>-</span>
                <input
                    type='number'
                    value={maxPrice}
                    onChange={(e) =>
                        setMaxPrice(Number(e.target.value) || maxLimit)
                    }
                    className='w-full rounded border border-gray-300 px-2 py-1 text-sm'
                />
            </div>

            {/* Slider */}
            <Slider.Root
                value={[minPrice, maxPrice]}
                onValueChange={handleSliderChange}
                max={maxLimit}
                step={10}
                className='relative flex h-5 w-full touch-none items-center select-none'
            >
                <Slider.Track className='relative h-1 grow rounded-full bg-gray-200'>
                    <Slider.Range className='absolute h-full rounded-full bg-primary' />
                </Slider.Track>
                <Slider.Thumb className='block h-4 w-4 rounded-full border-2 border-primary bg-white focus:ring-2 focus:ring-primary' />
                <Slider.Thumb className='block h-4 w-4 rounded-full border-2 border-primary bg-white focus:ring-2 focus:ring-primary' />
            </Slider.Root>

            {/* Trigger Button */}
            <button
                onClick={onFilterGo}
                className='w-full rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50'
            >
                Apply Filter
            </button>
        </div>
    );
};

export default RangeSelector;
