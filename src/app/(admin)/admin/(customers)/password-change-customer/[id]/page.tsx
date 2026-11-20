'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/admin/lib/utils';
import { Button, buttonVariants } from '@/admin/components/ui/button';
import { ChevronLeft, Eye, EyeOff, Lock, Loader } from 'lucide-react';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v3';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/admin/components/ui/form';
import { Input } from '@/admin/components/ui/input';
import { toast } from 'sonner';
import { useUpdateCustomersMutation } from '@/admin/redux/api-queries/customer-api'; // Adjust import path

// === Validation Schema ===
const ChangePasswordSchema = z
    .object({
        new_password: z
            .string()
            .min(6, 'New password must be at least 6 characters'),
        confirm_password: z.string().min(1, 'Please confirm your password')
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: 'Passwords do not match',
        path: ['confirm_password']
    });

type FormValues = z.infer<typeof ChangePasswordSchema>;

const ChangePasswordPage = () => {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string; // Extracting ID from URL

    // === Visibility States ===
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // === API Mutation ===
    const [updateCustomers, { isLoading }] = useUpdateCustomersMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(ChangePasswordSchema),
        defaultValues: {
            new_password: '',
            confirm_password: ''
        }
    });

    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.BUSINESSES_LOCATIONS_CREATE]
    });

    const onSubmit = async (values: FormValues) => {
        try {
            const payload = {
                new_password: values.new_password
            };

            const res: any = await updateCustomers({
                ussr_id: userId,
                payload: payload
            });

            console.log('res', res);

            if (res?.data?.success || res?.data) {
                toast.success('Password updated successfully!');
                router.push('/admin/customers');
            } else {
                const errorMsg =
                    res?.error?.data?.message || 'Failed to update password';
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('UPDATE PASSWORD ERROR:', error);
            toast.error('An unexpected error occurred.');
        }
    };

    // === Permission Handling ===
    if (!isPermissionLoading && !hasPermission) return <PermissionErrorCard />;
    if (isPermissionLoading) return <PermissionLoaderCard />;

    return (
        <section className='flex max-w-2xl flex-col gap-6'>
            <div className='flex items-center gap-2'>
                <Link
                    href='/admin/customers'
                    className={cn(
                        buttonVariants({ variant: 'outline', size: 'icon' })
                    )}
                >
                    <ChevronLeft />
                </Link>
                <h1 className='text-2xl font-medium'>Change Password</h1>
            </div>

            <div className='rounded-xl border bg-background p-6 shadow-sm'>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-5'
                    >
                        {/* New Password */}
                        <FormField
                            control={form.control}
                            name='new_password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <div className='relative'>
                                        <FormControl>
                                            <Input
                                                type={
                                                    showNewPass
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder='Enter new password'
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type='button'
                                            onClick={() =>
                                                setShowNewPass(!showNewPass)
                                            }
                                            className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary'
                                        >
                                            {showNewPass ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password */}
                        <FormField
                            control={form.control}
                            name='confirm_password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <div className='relative'>
                                        <FormControl>
                                            <Input
                                                type={
                                                    showConfirmPass
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder='Repeat new password'
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type='button'
                                            onClick={() =>
                                                setShowConfirmPass(
                                                    !showConfirmPass
                                                )
                                            }
                                            className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary'
                                        >
                                            {showConfirmPass ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type='submit'
                            className='w-full px-8 md:w-fit'
                            variant='green'
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className='mr-2 h-4 w-4 animate-spin' />{' '}
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Lock className='mr-2 h-4 w-4' /> Update
                                    Password
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </section>
    );
};

export default ChangePasswordPage;
