'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { Button, buttonVariants } from '@/components/ui/admin-button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/admin-form';
import { Input } from '@/components/ui/admin-input';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader } from 'lucide-react';
import { updateStaffSchema } from '@/schema/staff';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    useGetStaffByIdQuery,
    useUpdateStaffMutation
} from '@/redux/admin/api/staff-api';
import { toast } from 'sonner';
import { TOutlet } from '@/types/admin/product';
import { useEffect } from 'react';
import { TUser } from '@/types/admin/user';
import { useGetAllBusinessLocationsQuery } from '@/redux/admin/api/business-location-api';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import Link from 'next/link';
import { cn } from '@/lib/admin-utils';

import { useGetAllRolesQuery } from '@/redux/admin/api/roles-api';

const genderOptions = ['MALE', 'FEMALE'];

type UpdateStaffFormProps = {
    slug: string;
};

const UpdateStaffForm = ({ slug }: UpdateStaffFormProps) => {
    const router = useRouter();

    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.USER_UPDATE]
    });

    const { data: roleData, isLoading: isLoadingRoles } = useGetAllRolesQuery(
        {}
    ); // getting 29 role.

    const roles = roleData?.data?.roles;

    const { data, isLoading: isStaffLoading } = useGetStaffByIdQuery({
        user_id: slug
    });
    const staff: TUser = data?.data;
    console.log('staff: ', staff);

    const form = useForm<z.infer<typeof updateStaffSchema>>({
        resolver: zodResolver(updateStaffSchema),
        values:
            staff && roles?.length > 0
                ? {
                      full_name: staff.full_name || '',
                      email: staff.email || '',
                      phone_number: staff.phone_number || '',
                      role: staff.role || '',
                      // Match the ID string exactly
                      role_ref: staff.role_ref || '',
                      outlet: staff.outlet?._id || '',
                      gender: (staff.gender as 'MALE' | 'FEMALE') || 'MALE',
                      password: ''
                  }
                : undefined
    });

    // 2. Destructure dirtyFields here to use it in your component
    const {
        formState: { dirtyFields } // This is where dirtyFields comes from
    } = form;

    const { data: businessLocationData, isLoading: isLoadingOutlets } =
        useGetAllBusinessLocationsQuery({});
    const businessLocations =
        businessLocationData?.data?.businessLocations || [];
    const formatedLocations = businessLocations?.map((location: TOutlet) => ({
        value: location?._id,
        label: location?.name
    }));

    const [updateStaff, { isLoading: isUpdateStaffLoading }] =
        useUpdateStaffMutation();

    // 2. Updated useEffect to handle dynamic roles
    useEffect(() => {
        if (staff && roles?.length > 0) {
            // Find the role_ref ID if your backend only returns the role name string
            // Or use staff.role_ref if it's already in the object
            const currentRoleRef =
                staff?.role_ref ||
                roles.find((r: any) => r?._id === staff.role)?._id;

            form.reset({
                full_name: staff.full_name || '',
                email: staff.email || '',
                phone_number: staff.phone_number || '',
                role: staff.role || '',
                role_ref: currentRoleRef || '',
                outlet: staff?.outlet?._id || '',
                gender: (staff.gender as 'MALE' | 'FEMALE') || 'MALE',
                password: '' // Keep password empty on update unless changing
            });
        }
    }, [staff, roles, form]);

    const handleUpdateStaff = async (
        values: z.infer<typeof updateStaffSchema>
    ) => {
        const finalPayload: any = {};

        Object.keys(dirtyFields).forEach((key) => {
            const fieldKey = key as keyof typeof values;
            if (fieldKey === 'role_ref') {
                const selected = roles.find(
                    (r: any) => r._id === values.role_ref
                );
                finalPayload.role = selected?.role_name; // Set the name
                finalPayload.role_ref = values.role_ref; // Set the ID
            } else {
                finalPayload[fieldKey] = values[fieldKey];
            }
        });

        if (Object.keys(finalPayload).length === 0) {
            toast.info('No changes detected.');
            return;
        }

        console.log('finalPayload', finalPayload);

        try {
            const res: any = await updateStaff({
                staff_id: slug,
                payload: finalPayload
            });
            if (res?.data?.success) {
                toast.success('Staff updated successfully!');
                router.replace('/admin/staffs');
            } else {
                toast.error(
                    res?.error?.data?.message || 'Failed to update staff.'
                );
            }
        } catch (error: any) {
            console.log('error: ', error);
            toast.error('Something went wrong!');
        }
    };

    if (!isPermissionLoading && !hasPermission) return <PermissionErrorCard />;
    if (isPermissionLoading || isStaffLoading || isLoadingRoles)
        return <PermissionLoaderCard />;
    return (
        <section className='space-y-6'>
            <Link
                href='/admin/staffs'
                className={cn(
                    buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'w-fit'
                    })
                )}
            >
                <ChevronLeft /> Back to Staffs
            </Link>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>Update Staff</h1>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleUpdateStaff)}
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

                        {/* 4. Dynamic Role Select Field */}
                        <FormField
                            control={form.control}
                            name='role_ref'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Staff Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value} // Crucial: This must match the Item value
                                        defaultValue={field.value}
                                    >
                                        <FormControl className='!w-full'>
                                            <SelectTrigger>
                                                {/* The SelectValue will automatically show the label of the matching item */}
                                                <SelectValue placeholder='Select a role' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles?.map((role: any) => (
                                                <SelectItem
                                                    key={role._id}
                                                    value={role._id}
                                                >
                                                    {role.role_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                        defaultValue={staff?.gender}
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
                                        defaultValue={staff?.outlet?._id}
                                    >
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select outlet' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {formatedLocations?.map(
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

                        {/* ===== Password field ===== */}
                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Set Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='password'
                                            placeholder='Enter new password'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* submit button */}
                    <div className='ms-auto w-fit'>
                        <Button type='submit' disabled={isUpdateStaffLoading}>
                            {isUpdateStaffLoading ? (
                                <>
                                    <Loader className='size-5 animate-spin' />{' '}
                                    Add New Staff
                                </>
                            ) : (
                                'Update Staff'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    );
};

export default UpdateStaffForm;
