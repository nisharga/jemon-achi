'use client';
import React from 'react';
import { DiscountCalculationType } from '@/types/admin/pos';
import { Input } from '@/components/ui/admin-input';
import { ToggleSwitch } from './ToggleSwitch';

interface Props {
    discountType: DiscountCalculationType;
    discountValue: number | null;
    onTypeChange: (t: DiscountCalculationType) => void;
    onValueChange: (v: number | null) => void;
}

export const DiscountControl: React.FC<Props> = ({
    discountType,
    discountValue,
    onTypeChange,
    onValueChange
}) => (
    <div className='space-y-1'>
        <label className='block text-sm font-medium'>Overall Discount</label>
        <div className='flex flex-wrap items-center gap-3'>
            <ToggleSwitch
                enabled={discountType === DiscountCalculationType.PERCENTAGE}
                onChange={(e) =>
                    onTypeChange(
                        e
                            ? DiscountCalculationType.PERCENTAGE
                            : DiscountCalculationType.FLAT
                    )
                }
                labelOn='Percentage'
                labelOff='TK'
            />
            <Input
                type='number'
                className='w-full'
                value={discountValue ?? ''}
                onChange={(e) => {
                    const v = e.target.value;
                    onValueChange(v === '' ? null : Number(v));
                }}
            />
        </div>
    </div>
);
