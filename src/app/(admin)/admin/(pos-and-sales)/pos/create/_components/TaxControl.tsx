'use client';
import React from 'react';
import { Input } from '@/components/ui/admin-input';
import { ToggleSwitch } from './ToggleSwitch';

interface Props {
    vatType: 'percent' | 'flat';
    vatPercent: number;
    vatFlat: number;
    onTypeChange: (type: 'percent' | 'flat') => void;
    onPercentChange: (val: number) => void;
    onFlatChange: (val: number) => void;
}

export const TaxControl: React.FC<Props> = ({
    vatType,
    vatPercent,
    vatFlat,
    onTypeChange,
    onPercentChange,
    onFlatChange
}) => (
    <div className='space-y-1'>
        <label className='block text-sm font-medium'>VAT</label>
        <div className='flex items-center gap-3'>
            <ToggleSwitch
                enabled={vatType === 'percent'}
                onChange={(e) => onTypeChange(e ? 'percent' : 'flat')}
                labelOn='%'
                labelOff='TK'
            />
            <Input
                type='number'
                className='w-20'
                value={vatType === 'percent' ? vatPercent : vatFlat}
                onChange={(e) =>
                    vatType === 'percent'
                        ? onPercentChange(parseFloat(e.target.value) || 0)
                        : onFlatChange(parseFloat(e.target.value) || 0)
                }
            />
        </div>
    </div>
);
