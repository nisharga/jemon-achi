'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/admin-label';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    labelOn: string;
    labelOff: string;
    id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    enabled,
    onChange,
    labelOn,
    labelOff,
    id = 'toggle-switch'
}) => {
    return (
        <div className='flex items-center space-x-2'>
            <Switch
                id={id}
                checked={enabled}
                onCheckedChange={onChange}
                className='hover:cursor-pointer'
            />
            <Label htmlFor={id} className='text-sm font-medium'>
                {enabled ? labelOn : labelOff}
            </Label>
        </div>
    );
};
