'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/admin-form';
import { Input } from '@/components/ui/admin-input';
import { Button } from '@/components/ui/admin-button';
import { Loader } from 'lucide-react';
import { TagsInput } from '@/components/ui/tags-input';

const BrandSchema = z.object({
    name: z.string().min(1, 'Brand name is required'),
    tags: z.array(z.string()).optional()
});

type BrandFormValues = z.infer<typeof BrandSchema>;

interface BrandFormProps {
    onSubmit: (data: BrandFormValues) => void | Promise<void>;
    isLoading?: boolean;
    submitButtonText?: string;
    defaultValues?: Partial<BrandFormValues>;
}

export const BrandForm = ({
    onSubmit,
    isLoading = false,
    submitButtonText = 'Submit',
    defaultValues
}: BrandFormProps) => {
    const form = useForm<BrandFormValues>({
        resolver: zodResolver(BrandSchema),
        defaultValues: {
            name: '',
            tags: [],
            ...defaultValues
        }
    });

    // Update form when defaultValues change (for edit mode)
    useEffect(() => {
        if (defaultValues) {
            form.reset(defaultValues);
        }
    }, [defaultValues, form]);

    const handleSubmit = async (data: BrandFormValues) => {
        await onSubmit(data);
    };

    return (
        <div className='rounded-lg bg-background p-6 shadow'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className='space-y-6'
                >
                    {/* Brand Name */}
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Brand Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter brand name'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Tags */}
                    <FormField
                        control={form.control}
                        name='tags'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags (for searching)</FormLabel>
                                <FormControl>
                                    <TagsInput
                                        placeholder='Enter tags (press Enter to add)'
                                        value={field.value || []}
                                        onValueChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit Button */}
                    <div className='flex justify-end gap-4'>
                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='min-w-[120px]'
                        >
                            {isLoading ? (
                                <>
                                    <Loader className='mr-2 h-4 w-4 animate-spin' />
                                    Processing...
                                </>
                            ) : (
                                submitButtonText
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
