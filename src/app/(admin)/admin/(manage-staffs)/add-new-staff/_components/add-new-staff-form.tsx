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
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { staffSchema } from '@/admin/schema/staff';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { useCreateStaffMutation } from '@/admin/redux/api-queries/staff-api';
import { toast } from 'sonner';
import { TOutlet } from '@/admin/types/product';
import { useState } from 'react';
import { useGetAllBusinessLocationsQuery } from '@/admin/redux/api-queries/business-location-api';
import { IRole } from '@/admin/types/user';
import { useGetAllRolesQuery } from '@/admin/redux/api-queries/roles-api';

const genderOptions = ['MALE', 'FEMALE'];

const AddNewStaffForm = () => {
    // === show hide password state ===
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // === router ===
    const router = useRouter();

    // === form default values ===
    const form = useForm<z.infer<typeof staffSchema>>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            full_name: '',
            email: '',
            phone_number: '',
            role: undefined,
            outlet: undefined,
            password: '',
            confirm_Password: '',
            gender: 'MALE'
        }
    });

    // === get all business locations ===
    const { data: businessLocationData, isLoading: isLoadingOutlets } =
        useGetAllBusinessLocationsQuery({});
    const businessLocations =
        businessLocationData?.data?.businessLocations || [];
    const formatedLocations = businessLocations?.map((location: TOutlet) => ({
        value: location?._id,
        label: location?.name
    }));

    const {
        data,
        isLoading: isLoadingRoles,
        isFetching
    } = useGetAllRolesQuery({});
    const roles = data?.data.roles || [];

    // === add new staff mutation ===
    const [createStaff, { isLoading }] = useCreateStaffMutation();

    // === handle add new sub category ===
    const handleAddNewStaff = async (data: z.infer<typeof staffSchema>) => {
        // Use data.role_ref (because that's what the FormField is controlling)
        const selectedRole = roles.find((r: IRole) => r._id === data.role_ref);

        const finalPayload = {
            ...data,
            role: selectedRole?.role_name, // Set the name string
            role_ref: selectedRole?._id // Set the ID
        };

        try {
            const res: any = await createStaff({ payload: finalPayload });
            if (res?.data?.success) {
                toast.success('Staff created successfully!');
                router.replace('/admin/staffs');
                form.reset({
                    full_name: '',
                    email: '',
                    phone_number: '',
                    role: undefined,
                    outlet: '',
                    password: '',
                    confirm_Password: '',
                    gender: 'MALE'
                });
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to creating staff. Try again!'
                );
            }
        } catch (error) {
            console.error('Error creating staff: ', error);
            toast.error('Something went wrong! Please try again.');
        }
    };
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleAddNewStaff)}
                className='w-full space-y-6'
            >
                <div className='grid gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl md:grid-cols-2 lg:p-6'>
                    {/* ===== Full Name field ===== */}
                    <FormField
                        control={form.control}
                        name='full_name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter full name'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ===== Email field ===== */}
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter email'
                                        {...field}
                                        type='email'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ===== Phone Number field ===== */}
                    <FormField
                        control={form.control}
                        name='phone_number'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter phone number'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ===== Role field (Select) ===== */}
                    <FormField
                        control={form.control}
                        name='role_ref' // The "main" value is the ID
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    disabled={isLoadingRoles || isFetching}
                                    onValueChange={(value) => {
                                        // 1. Update the ID field
                                        field.onChange(value);
                                        // 2. Find the name and update the 'role' field manually
                                        const selectedRoleName = roles.find(
                                            (r: IRole) => r._id === value
                                        )?.role_name;
                                        form.setValue(
                                            'role',
                                            selectedRoleName || ''
                                        );
                                    }}
                                    value={field.value}
                                >
                                    <FormControl className='!w-full'>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a role' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {roles.map((role: IRole) => (
                                            <SelectItem
                                                key={role._id}
                                                value={role._id}
                                            >
                                                {role.role_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    {/* ===== Password field ===== */}
                    <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className='relative'>
                                        <Input
                                            placeholder='Enter password'
                                            {...field}
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                        />

                                        <button
                                            type='button'
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            className='absolute top-2 right-2 cursor-pointer'
                                        >
                                            {showPassword ? (
                                                <Eye className='size-4' />
                                            ) : (
                                                <EyeOff className='size-4' />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* ===== Confirm Password field ===== */}
                    <FormField
                        control={form.control}
                        name='confirm_Password'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <div className='relative'>
                                        <Input
                                            placeholder='Enter confirm password'
                                            {...field}
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                        />

                                        <button
                                            type='button'
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                            className='absolute top-2 right-2 cursor-pointer'
                                        >
                                            {showConfirmPassword ? (
                                                <Eye className='size-4' />
                                            ) : (
                                                <EyeOff className='size-4' />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ===== Gender field (Select) ===== */}
                    <FormField
                        control={form.control}
                        name='gender'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select gender' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {genderOptions.map((gender) => (
                                            <SelectItem
                                                key={gender}
                                                value={gender}
                                            >
                                                {gender}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* ===== Outlet field ===== */}
                    <FormField
                        control={form.control}
                        name='outlet'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Access Outlet</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select outlet' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {formatedLocations.map(
                                            (outlet: {
                                                value: string;
                                                label: string;
                                            }) => (
                                                <SelectItem
                                                    key={outlet.value}
                                                    value={outlet.value}
                                                >
                                                    {outlet.label}
                                                </SelectItem>
                                            )
                                        )}
                                        {isLoadingOutlets && (
                                            <div className='py-2'>
                                                <Loader className='mx-auto size-4 animate-spin' />
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* submit button */}
                <div className='ms-auto w-fit'>
                    <Button type='submit' disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader className='size-5 animate-spin' /> Add
                                New Staff
                            </>
                        ) : (
                            'Add New Staff'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default AddNewStaffForm;
