'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner'; // or your preferred toast library

interface CopyableTextProps {
    text: string;
    label?: string;
    className?: string;
}

export const CopyableText = ({ text, label, className }: CopyableTextProps) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast.success('Copied to clipboard!');

            // Reset icon after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    return (
        <button
            type='button'
            onClick={handleCopy}
            className={`group flex items-center gap-2 transition-opacity hover:opacity-80 ${className}`}
        >
            <div className='sm-normal flex items-center gap-1 !text-amber-900'>
                {text}
                <span className='flex h-4 w-4 items-center justify-center'>
                    {isCopied ? (
                        <Check className='text-primary-ink h-3.5 w-3.5' />
                    ) : (
                        <Copy className='group-hover:text-primary-ink h-3.5 w-3.5 text-muted-foreground transition-colors' />
                    )}
                </span>
                {label && (
                    <span className='sm-normal font-medium'>({label})</span>
                )}
            </div>
        </button>
    );
};
