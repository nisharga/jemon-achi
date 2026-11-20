'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v3';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { CreateBusinessLocationSchema } from '@/admin/schema/business-location';
import { useCreateBusinessLocationMutation } from '@/admin/redux/api-queries/business-location-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

type FormValues = z.infer<typeof CreateBusinessLocationSchema>;

export function CreateBusinessLocationForm() {
    // === router ===
    const router = useRouter();

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

    // === create business location api mutation ===
    const [createBusinessLocation, { isLoading }] =
        useCreateBusinessLocationMutation();

    // === handle create business location ===
    const handleCreateBusinessLocation = async (values: FormValues) => {
        try {
            const payload = values;

            const res: any = await createBusinessLocation({ payload });
            if (res?.data?.success) {
                toast.success('Business location added!');
                router.replace('/admin/business-location/all');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message ||
                        'Failed to add business location!'
                );
            }
        } catch (error: any) {
            console.log('CREATE BUSINESS LOCATION ERROR: ', error);

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

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleCreateBusinessLocation)}
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
                                    defaultValue={field.value}
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
      name='location.latitude'
      render={({ field }) => (
       <FormItem>
        <FormLabel>Latitude</FormLabel>
        <FormControl>
         <Input
          type='number'
          step='any'
          placeholder='23.7912'
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
      name='location.longitude'
      render={({ field }) => (
       <FormItem>
        <FormLabel>Longitude</FormLabel>
        <FormControl>
         <Input
          type='number'
          step='any'
          placeholder='90.4074'
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
                                        <div key={index} className='flex gap-2'>
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
                                <Loader className='animate-spin' /> Adding..
                            </>
                        ) : (
                            'Add Business Location'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
