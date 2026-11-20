'use client';

import React, { useState, useRef } from 'react';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface ColorPickerProps {
    value?: string;
    onChange: (color: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
    value = '',
    onChange,
    placeholder = '#000000',
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const colorInputRef = useRef<HTMLInputElement>(null);

    // Format hex value to ensure it starts with #
    const formatHex = (hex: string): string => {
        let formatted = hex.trim();
        if (!formatted.startsWith('#')) {
            formatted = '#' + formatted;
        }
        // Validate hex format
        const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
        if (hexRegex.test(formatted)) {
            return formatted.toUpperCase();
        }
        return value || placeholder;
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        if (!hex) {
            onChange('');
            return;
        }
        onChange(formatHex(hex));
    };

    const handleColorPickerChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const color = e.target.value;
        onChange(color.toUpperCase());
    };

    // const handleSwatchClick = () => {
    //   setIsOpen(true);
    //   setTimeout(() => {
    //     colorInputRef.current?.focus();
    //   }, 0);
    // };

    const displayColor = value || placeholder;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    className={`flex w-full items-center gap-2 ${
                        disabled
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                    }`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    {/* Color Swatch */}
                    <div
                        className='h-6 w-6 flex-shrink-0 rounded border border-input shadow-sm'
                        style={{ backgroundColor: displayColor }}
                        title={displayColor}
                    />
                    {/* Hidden native color input */}
                    <input
                        ref={colorInputRef}
                        type='color'
                        value={displayColor}
                        onChange={handleColorPickerChange}
                        className='absolute h-0 w-0 opacity-0'
                        tabIndex={-1}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-3' align='start'>
                <div className='flex items-center gap-2'>
                    {/* Native Color Picker */}
                    <input
                        type='color'
                        value={displayColor}
                        onChange={handleColorPickerChange}
                        className='h-12 w-12 cursor-pointer rounded border-0 p-0'
                        disabled={disabled}
                    />
                    {/* Hex Input */}
                    <div className='flex-1'>
                        <label className='mb-1 block text-xs text-muted-foreground'>
                            Hex Code
                        </label>
                        <Input
                            value={displayColor}
                            onChange={handleHexChange}
                            placeholder={placeholder}
                            disabled={disabled}
                            maxLength={7}
                            className='w-full font-mono'
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ColorPicker;

// Smaller inline version for use in attribute value inputs
interface InlineColorPickerProps {
    value?: string;
    onChange: (color: string) => void;
    placeholder?: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
}

export const InlineColorPicker: React.FC<InlineColorPickerProps> = ({
    value = '',
    onChange,
    placeholder = '#000000',
    disabled = false,
    size = 'sm'
}) => {
    const displayColor = value || placeholder;
    const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

    return (
        <div
            className={`relative flex items-center gap-1 ${disabled ? 'opacity-50' : ''}`}
        >
            {/* Color Swatch with Native Picker */}
            <div className='relative'>
                <input
                    type='color'
                    value={displayColor}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    disabled={disabled}
                    className={`absolute inset-0 h-full w-full cursor-pointer opacity-0`}
                />
                <div
                    className={`${sizeClass} flex-shrink-0 rounded border border-input shadow-sm`}
                    style={{ backgroundColor: displayColor }}
                    title={displayColor}
                />
            </div>
            {/* Hex Input */}
            <Input
                type='text'
                value={displayColor}
                onChange={(e) => {
                    let hex = e.target.value.trim();
                    if (hex && !hex.startsWith('#')) {
                        hex = '#' + hex;
                    }
                    // Validate hex format
                    const hexRegex = /^#?([0-9A-Fa-f]{0,6})$/;
                    if (hexRegex.test(hex)) {
                        onChange(hex.toUpperCase());
                    }
                }}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={7}
                className={`font-mono ${
                    size === 'sm' ? 'h-8 w-20 px-2 text-xs' : 'h-9 w-24 text-sm'
                }`}
            />
        </div>
    );
};
