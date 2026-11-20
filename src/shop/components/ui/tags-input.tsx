'use client';
import * as React from 'react';
import { CircleX } from 'lucide-react';
import { Input } from '@/shop/components/ui/input';
import { Badge } from '@/shop/components/ui/badge';

interface TagSelectorProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
> {
    value?: string[];
    onValueChange: (value: string[]) => void;
}

export function TagsInput({
    value = [],
    onValueChange,
    placeholder = 'Add tags...',
    ...props
}: TagSelectorProps) {
    const [inputValue, setInputValue] = React.useState('');
    const tags = value || [];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (
            e.key === 'Backspace' &&
            inputValue === '' &&
            tags.length > 0
        ) {
            // Remove the last tag when backspace is pressed and input is empty
            const newTags = [...tags];
            newTags.pop();
            onValueChange(newTags);
        }
    };

    const addTag = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !tags.includes(trimmedValue)) {
            onValueChange([...tags, trimmedValue]);
            setInputValue('');
        }
    };

    const removeTag = (index: number) => {
        const newTags = [...tags];
        newTags.splice(index, 1);
        onValueChange(newTags);
    };

    return (
        <div className='flex min-h-10 flex-wrap gap-2 rounded-md border px-2.5 py-1.5'>
            {tags.map((tag, index) => (
                <Badge key={index}>
                    <span>{tag}</span>
                    <div
                        onClick={() => removeTag(index)}
                        className='focus:outline-none'
                    >
                        <CircleX className='size-4 text-muted-foreground' />
                        <span className='sr-only'>Remove {tag}</span>
                    </div>
                </Badge>
            ))}
            <Input
                type='text'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                className='h-7 min-w-[120px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
                placeholder={tags.length === 0 ? placeholder : ''}
                {...props}
            />
        </div>
    );
}
