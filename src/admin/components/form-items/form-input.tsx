'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/admin/components/ui/form';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Input } from '../ui/input';

interface FormInputProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    placeholder?: string;
    description?: string;
    type?: string;
    className?: string;
    disabled?: boolean;
}

export const FormInput = <T extends FieldValues>({
    control,
    name,
    label,
    placeholder,
    description,
    type = 'text',
    className,
    disabled = false
}: FormInputProps<T>) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Input
                            type={type}
                            placeholder={placeholder}
                            disabled={disabled}
                            {...field}
                            // Ensure value is never undefined to prevent uncontrolled-to-controlled warnings
                            value={field.value ?? ''}
                        />
                    </FormControl>
                    {description && (
                        <FormDescription>{description}</FormDescription>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
