'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { Button } from '@/admin/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/admin/components/ui/form';
import { Input } from '@/admin/components/ui/input';
import { Switch } from '@/admin/components/ui/switch';
import { FormEditor } from '@/admin/components/form-items';
import { updateReturnPolicySchema } from '@/admin/schema/return-policy';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader, X } from 'lucide-react';
import {
    useGetSingleReturnPolicyQuery,
    useUpdateReturnPolicyMutation
} from '@/admin/redux/api-queries/return-policy-api';
import { useRouter } from 'next/navigation';

const UpdateReturnPolicyForm = ({ id }: { id: string }) => {
    // === get single return policy query hook ===
    const { data: returnPolicyData, isLoading: isGetLoading } =
        useGetSingleReturnPolicyQuery(
            { id },
            {
                refetchOnMountOrArgChange: true
            }
        );

    // === update return policy api mutation hook ===
    const [updateReturnPolicy, { isLoading: isUpdateLoading }] =
        useUpdateReturnPolicyMutation();

    const [conditions, setConditions] = useState<string[]>([]);
    const [currentCondition, setCurrentCondition] = useState('');

    const form = useForm<z.infer<typeof updateReturnPolicySchema>>({
        resolver: zodResolver(updateReturnPolicySchema),
        defaultValues: {
            title: '',
            description: '',
            return_period_days: 7,
            conditions: [],
            is_active: true
        }
    });

    const router = useRouter();

    // Populate form with existing data
    useEffect(() => {
        if (returnPolicyData?.data) {
            const policy = returnPolicyData.data;
            form.reset({
                title: policy.title || '',
                description: policy.description || '',
                return_period_days: policy.return_period_days || 7,
                conditions: policy.conditions || [],
                is_active: policy.is_active ?? true
            });
            setConditions(policy.conditions || []);
        }
    }, [returnPolicyData, form]);

    // Handle Submit
    const handleSubmitReturnPolicy = async (
        values: z.infer<typeof updateReturnPolicySchema>
    ) => {
        try {
            const payload = {
                ...values,
                conditions
            };

            // update return policy api mutation
            const res: any = await updateReturnPolicy({
                payload,
                id
            });
            if (res?.data?.success) {
                toast.success('Return policy updated successfully!');
                router.replace('/admin/return-policies');
            }
        } catch (error) {
            console.error('Update return policy failed:', error);
            toast.error('Failed to update return policy. Please try again.');
        }
    };

    const addCondition = () => {
        if (
            currentCondition.trim() &&
            !conditions.includes(currentCondition.trim())
        ) {
            setConditions([...conditions, currentCondition.trim()]);
            setCurrentCondition('');
        }
    };

    const removeCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    if (isGetLoading) {
        return (
            <div className='mx-auto w-fit py-4'>
                <Loader className='size-5 animate-spin' />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmitReturnPolicy)}
                className='space-y-8'
            >
                <div className='space-y-4 rounded-xl border bg-card p-4 shadow-sm'>
                    <FormField
                        control={form.control}
                        name='title'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter return policy title'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormEditor
                        control={form.control}
                        name='description'
                        label='Description'
                        form={form}
                    />

                    <FormField
                        control={form.control}
                        name='return_period_days'
                        render={({ field }) => (
                            <FormItem className='w-64'>
                                <FormLabel>Return Period (Days)</FormLabel>
                                <FormControl>
                                    <Input
                                        type='number'
                                        min='0'
                                        placeholder='7'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='invisible space-y-2'>
                        <FormLabel>Conditions</FormLabel>
                        <div className='flex gap-2'>
                            <Input
                                placeholder='e.g., Original packaging required'
                                value={currentCondition}
                                onChange={(e) =>
                                    setCurrentCondition(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCondition();
                                    }
                                }}
                            />
                            <Button
                                type='button'
                                onClick={addCondition}
                                variant='outline'
                            >
                                Add
                            </Button>
                        </div>
                        {conditions.length > 0 && (
                            <div className='mt-2 flex flex-wrap gap-2'>
                                {conditions.map((condition, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm'
                                    >
                                        {condition}
                                        <button
                                            type='button'
                                            onClick={() =>
                                                removeCondition(index)
                                            }
                                            className='hover:text-destructive'
                                        >
                                            <X className='h-3 w-3' />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <FormField
                        control={form.control}
                        name='is_active'
                        render={({ field }) => (
                            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                <div className='space-y-0.5'>
                                    <FormLabel className='text-base'>
                                        Active Status
                                    </FormLabel>
                                    <p className='text-sm text-muted-foreground'>
                                        Enable this return policy for use
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-end gap-2'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type='submit' size='lg' disabled={isUpdateLoading}>
                        {isUpdateLoading ? (
                            <Loader className='mr-2 animate-spin' />
                        ) : null}
                        Update Return Policy
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default UpdateReturnPolicyForm;
