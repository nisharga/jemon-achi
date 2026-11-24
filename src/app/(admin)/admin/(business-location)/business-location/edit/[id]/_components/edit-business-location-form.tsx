'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v3';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { CreateBusinessLocationSchema } from '@/schema/business-location';
import {
    useGetBusinessLocationByIdQuery,
    useUpdateBusinessLocationMutation
} from '@/redux/admin/api/business-location-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader } from 'lucide-react';
import { useEffect } from 'react';
import { IBusiness_location } from '@/types/admin/business-location';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import Link from 'next/link';
import { cn } from '@/lib/admin-utils';

type FormValues = z.infer<typeof CreateBusinessLocationSchema>;

export function EditBusinessLocationForm({
    businessLocationId
}: {
    businessLocationId: string;
}) {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.BUSINESSES_LOCATIONS_UPDATE]
    });

    // === router ===
    const router = useRouter();

    // === get single business location ===
    const { data, isLoading: isSingleLoadingBusinessLocation } =
        useGetBusinessLocationByIdQuery(
            { id: businessLocationId },
            { skip: !businessLocationId }
        );
    const businessLocation: IBusiness_location = data?.data;

    // === form default values ===
    const form = useForm<FormValues>({
        resolver: zodResolver(CreateBusinessLocationSchema),
        defaultValues: {
            name: '',
            address: {
                division: '',
                district: '',
                thana: '',
                zip_code: '',
                local_address: ''
            },
            location: {
                latitude: 0,
                longitude: 0
            },
            type: 'OUTLET',
            manager_name: '',
            contact_numbers: ['']
        }
    });

    // === edit business location api mutation ===
    const [editBusinessLocation, { isLoading }] =
        useUpdateBusinessLocationMutation();

    // === handle edit business location ===
    const handleEditBusinessLocation = async (values: FormValues) => {
        try {
            const payload = values;

            const res: any = await editBusinessLocation({
                payload,
                business_location_id: businessLocationId
            });
            if (res?.data?.success) {
                toast.success('Business location edited!');
                router.replace('/admin/business-location/all');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to edit business location!'
                );
            }
        } catch (error: any) {
            console.log('UPDATE BUSINESS LOCATION ERROR: ', error);

            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );

            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            } else {
                toast.error('Something went wrong! Try again.');
            }
        }
    };

    // === reset form with default values ===
    const { reset } = form;
    useEffect(() => {
        if (businessLocation) {
            reset({
                name: businessLocation?.name || '',

                address: {
                    division: businessLocation?.address?.division || '',
                    district: businessLocation?.address?.district || '',
                    thana: businessLocation?.address?.thana || '',
                    zip_code: businessLocation?.address?.zip_code || '',
                    local_address:
                        businessLocation?.address?.local_address || ''
                },
                location: {
                    latitude: businessLocation?.location?.latitude || 0,
                    longitude: businessLocation?.location?.longitude || 0
                },
                type: businessLocation?.type || 'OUTLET',
                manager_name: businessLocation?.manager_name || '',
                contact_numbers: businessLocation?.contact_numbers || ['']
            });
        }
    }, [businessLocation, reset]);

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading || isSingleLoadingBusinessLocation) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='space-y-6'>
            <div className='flex items-center gap-2'>
                <Link
                    href='/admin/business-location/all'
                    className={cn(
                        buttonVariants({
                            variant: 'outline',
                            size: 'icon'
                        })
                    )}
                >
                    <ChevronLeft />
                </Link>
                <h1 className='text-2xl font-medium'>Edit Business Location</h1>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleEditBusinessLocation)}
                    className='space-y-6'
                >
                    <div className='grid gap-6 rounded-lg bg-background p-4 shadow transition-transform duration-300 hover:shadow-xl md:grid-cols-2 lg:p-6 xl:grid-cols-4'>
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter location name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='type'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={businessLocation?.type}
                                    >
                                        <FormControl>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select location type' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='OUTLET'>
                                                Outlet
                                            </SelectItem>
                                            <SelectItem value='WAREHOUSE'>
                                                Warehouse
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='address.division'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Division</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter division'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='address.district'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>District</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter district'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='address.thana'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thana</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter thana'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* <FormField
       control={form.control}
       name='address.zip_code'
       render={({ field }) => (
        <FormItem>
         <FormLabel>ZIP Code</FormLabel>
         <FormControl>
          <Input placeholder='Enter ZIP code' {...field} />
         </FormControl>
         <FormMessage />
        </FormItem>
       )}
      /> */}

                        <FormField
                            control={form.control}
                            name='address.local_address'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Local Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter local address'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* <FormField
              control={form.control}
              name="location.latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="23.7912"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="90.4074"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
                        <FormField
                            control={form.control}
                            name='manager_name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manager Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Enter manager name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='contact_numbers'
                            render={({ field }) => (
                                <FormItem className='md:col-span-2 xl:col-span-2'>
                                    <FormLabel>Contact Numbers</FormLabel>

                                    <div className='space-y-2'>
                                        {field?.value?.map((value, index) => (
                                            <div
                                                key={index}
                                                className='flex gap-2'
                                            >
                                                <Input
                                                    placeholder='01XXXXXXXXX'
                                                    value={value}
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...(field.value as any)
                                                        ];
                                                        updated[index] =
                                                            e.target.value;
                                                        field.onChange(updated);
                                                    }}
                                                />

                                                {field.value &&
                                                    field.value.length > 1 && (
                                                        <Button
                                                            type='button'
                                                            variant='destructive'
                                                            onClick={() =>
                                                                field.onChange(
                                                                    field.value &&
                                                                        field.value.filter(
                                                                            (
                                                                                _,
                                                                                i
                                                                            ) =>
                                                                                i !==
                                                                                index
                                                                        )
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                            </div>
                                        ))}

                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={() =>
                                                field.onChange([
                                                    ...(field.value as any),
                                                    ''
                                                ])
                                            }
                                        >
                                            + Add Contact
                                        </Button>
                                    </div>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className='ms-auto w-fit'>
                        <Button
                            type='submit'
                            variant='green'
                            size='xl'
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className='animate-spin' />{' '}
                                    Editing..
                                </>
                            ) : (
                                'Edit Business Location'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    );
}
