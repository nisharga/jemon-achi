'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v3';
import { Button } from '@/components/ui/admin-button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/admin-form';
import { Input } from '@/components/ui/admin-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader, Camera } from 'lucide-react';
import { useUploadFileMutation } from '@/redux/admin/api/file-upload-api'; // Adjust path
import { ENV } from '@/constants/env';
import Image from 'next/image';
import { useCreateCustomerMutation } from '@/redux/admin/api/customer-api';

// Define User Schema based on your API response
const CreateUserSchema = z.object({
    full_name: z.string().min(2, 'Full name is required'),
    phone_number: z.string().min(11, 'Valid phone number is required'),
    email: z.string().email().optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['USER', 'ADMIN', 'MANAGER']),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DELETED', 'BANNED']),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    profile_url: z.string().optional()
});

type FormValues = z.infer<typeof CreateUserSchema>;

export function CreateUserForm() {
    const router = useRouter();
    const [profileImage, setProfileImage] = useState<File | null>(null);

    // === Hooks ===
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    // Assume you have a useCreateUserMutation or similar
    const [createUser, { isLoading: isCreating }] = useCreateCustomerMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: {
            full_name: '',
            phone_number: '',
            email: '',
            password: '',
            role: 'USER',
            status: 'ACTIVE',
            gender: 'MALE',
            profile_url: ''
        }
    });

    const handleCreateUser = async (values: FormValues) => {
        try {
            const payload = { ...values };

            // 1. Handle Image Upload if exists
            if (profileImage) {
                const formData = new FormData();
                formData.append('image', profileImage);

                const uploadRes: any = await uploadFile({
                    file: formData,
                    apikey: ENV.NEXT_PUBLIC_FILE_UPLOAD_API_KEY
                });

                if (uploadRes?.data?.success) {
                    payload.profile_url = uploadRes?.data?.data?.display_url;
                } else {
                    toast.error('Image upload failed, proceeding without it.');
                }
            }

            // 3. API Call (Commented out for your implementation)

            const res: any = await createUser(payload);

            if (res?.data?.success) {
                toast.success('Customer created successfully!');
                router.push('/admin/customers');
            } else {
                toast.error(res?.error?.data?.message);
            }
        } catch (error) {
            console.error('CREATE USER ERROR: ', error);
            toast.error('Something went wrong!');
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleCreateUser)}
                className='space-y-6'
            >
                <div className='rounded-lg bg-background p-4 shadow transition-all duration-300 hover:shadow-md lg:p-6'>
                    {/* Profile Image Upload Section */}
                    <div className='mb-8 flex flex-col items-center space-y-4'>
                        <div className='relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/50 bg-muted'>
                            {profileImage ? (
                                <Image
                                    src={URL.createObjectURL(profileImage)}
                                    alt='Preview'
                                    className='h-full w-full object-cover'
                                    width={96}
                                    height={96}
                                />
                            ) : (
                                <Camera className='h-8 w-8 text-muted-foreground' />
                            )}
                        </div>
                        <label className='cursor-pointer rounded-md bg-secondary px-4 py-1.5 text-sm font-medium hover:bg-secondary/80'>
                            {isUploading ? 'Uploading...' : 'Upload Photo'}
                            <input
                                type='file'
                                className='hidden'
                                accept='image/*'
                                onChange={(e) =>
                                    setProfileImage(e.target.files?.[0] || null)
                                }
                            />
                        </label>
                    </div>

                    <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
                        {/* Full Name */}
                        <FormField
                            control={form.control}
                            name='full_name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Nahid Ahmed'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Phone Number */}
                        <FormField
                            control={form.control}
                            name='phone_number'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='017XXXXXXXX'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email */}
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='email'
                                            placeholder='john@example.com'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='password'
                                            placeholder='••••••••'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Role */}
                        <FormField
                            control={form.control}
                            name='role'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl className='!w-full'>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Role' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='USER'>
                                                User
                                            </SelectItem>
                                            <SelectItem value='ADMIN'>
                                                Admin
                                            </SelectItem>
                                            <SelectItem value='MANAGER'>
                                                Manager
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Gender */}
                        <FormField
                            control={form.control}
                            name='gender'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl className='!w-full'>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Gender' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='MALE'>
                                                Male
                                            </SelectItem>
                                            <SelectItem value='FEMALE'>
                                                Female
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Status */}
                        <FormField
                            control={form.control}
                            name='status'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl className='!w-full'>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Set Status' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='ACTIVE'>
                                                Active
                                            </SelectItem>
                                            <SelectItem value='INACTIVE'>
                                                Inactive
                                            </SelectItem>
                                            <SelectItem value='BANNED'>
                                                Banned
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className='ms-auto w-fit'>
                    <Button
                        type='submit'
                        variant='green'
                        size='xl'
                        disabled={isUploading}
                    >
                        {isUploading || isCreating ? (
                            <>
                                <Loader className='mr-2 h-4 w-4 animate-spin' />{' '}
                                Saving...
                            </>
                        ) : (
                            'Create User'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
