import React from 'react';
import { motion } from 'framer-motion';
import {
    INSIDE_DHAKA_DELIVERY_PRICE,
    OUTSIDE_DHAKA_DELIVERY_PRICE
} from '@/configs/storefront';

export interface ShippingOption {
    id: string;
    label: string;
    price: number;
}

interface ShippingSelectorProps {
    options: ShippingOption[];
    selectedValue: string;
    onSelect: (option: ShippingOption) => void;
    title?: string;
}

const ShippingSelector = ({
    options,
    selectedValue,
    onSelect,
    title = 'Shipping Method'
}: ShippingSelectorProps) => {
    return (
        <div className='w-full space-y-3'>
            <h3 className='mb-2 block text-sm text-[#1A1A1A]'>{title} *</h3>

            {options.map((option) => {
                const isSelected = selectedValue === option.id;
                const delivery_price =
                    option.id === 'inside'
                        ? INSIDE_DHAKA_DELIVERY_PRICE
                        : OUTSIDE_DHAKA_DELIVERY_PRICE;

                return (
                    <button
                        key={option.id}
                        type='button'
                        onClick={() => onSelect(option)}
                        className={`flex w-full items-center justify-between rounded-lg border px-4 py-2 transition-all duration-200 ${
                            isSelected
                                ? 'border-gray-900 bg-[#f9f9f9]'
                                : 'border-gray-200'
                        }`}
                    >
                        <div className='flex w-full items-center gap-3'>
                            {/* Radio Circle */}
                            <div
                                className={`flex h-3 w-3 items-center justify-center rounded-full border-2 ${
                                    isSelected
                                        ? 'border-gray-900'
                                        : 'border-gray-300'
                                }`}
                            >
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className='h-2.5 w-2.5 rounded-full'
                                    />
                                )}
                            </div>

                            <div className='flex !w-full items-center justify-between'>
                                <span
                                    className={`block text-sm font-medium ${
                                        isSelected
                                            ? 'text-gray-900'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    {option.label}
                                </span>
                                <span
                                    className={`block text-sm font-medium ${
                                        isSelected
                                            ? 'text-gray-900'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    ৳{delivery_price}
                                </span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default ShippingSelector;
