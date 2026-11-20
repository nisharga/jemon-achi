'use client';
import React from 'react';
import { Input } from '@/admin/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/admin/components/ui/select';
import { PaymentMethod } from '@/admin/types/pos';

interface Props {
    method: PaymentMethod;
    onMethodChange: (m: PaymentMethod) => void;
    account: string;
    onAccountChange: (a: string) => void;
    paidAmount: number | null;
    onPaidChange: (v: number | null) => void;
}

export const PaymentDetails: React.FC<Props> = ({
    method,
    onMethodChange,
    account,
    onAccountChange,
    paidAmount,
    onPaidChange
}) => (
    <div className='space-y-4'>
        <div className='flex flex-col gap-2'>
            <label
                htmlFor='payment-method-select'
                className='text-sm font-medium'
            >
                Select Payment Method{' '}
                <span className='text-sm text-red-500'>*</span>
            </label>
            <Select
                value={method}
                onValueChange={(value) =>
                    onMethodChange(value as PaymentMethod)
                }
            >
                <SelectTrigger id='payment-method-select' className='w-full'>
                    <SelectValue placeholder='Select Method' />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(PaymentMethod).map((pm) => (
                        <SelectItem key={pm} value={pm}>
                            {pm.replace('_', ' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {method !== PaymentMethod.Cash && (
            <div className='bg space-y-1'>
                <label className='block text-sm font-medium'>
                    Payment Account
                </label>
                <Input
                    value={account}
                    placeholder='Payment Account Number'
                    onChange={(e) => onAccountChange(e.target.value)}
                />
            </div>
        )}
        <div className='space-y-1'>
            <label className='block text-sm font-medium'>
                Paid Amount <span className='text-sm text-red-500'>*</span>
            </label>
            <Input
                type='number'
                placeholder='Paid Amount'
                value={paidAmount ?? ''}
                onChange={(e) => {
                    const v = e.target.value;
                    onPaidChange(v === '' ? null : Number(v));
                }}
            />
        </div>
    </div>
);
