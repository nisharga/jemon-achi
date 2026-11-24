'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';

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
import { LoginSchema } from '@/schema/login';
import { useLoginMutation } from '@/redux/admin/api/auth-api';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { setAccessToken, setRefreshToken } from '@/auth/admin-cookies';
import { useRouter } from 'next/navigation';
// import { ALLOWED_USER_ROLES } from "@/auth/admin-routes";

const LoginForm = () => {
    // === router ===
    const router = useRouter();

    // === form inital data ===
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            phone_number: '',
            password: ''
        }
    });

    // === login api mutation hook ===
    const [login, { isLoading }] = useLoginMutation();

    const handleLogin = async (values: z.infer<typeof LoginSchema>) => {
        // console.log("values", values);

        try {
            const response: any = await login({
                payload: values
            });
            // console.log("LOGIN RESPONSE", response);
            // const userRole = response?.data?.data?.data?.role;
            if (response?.data?.success) {
                // if userRole is not admin or super admin then show error message
                /*  if (!ALLOWED_USER_ROLES.includes(userRole)) {
          toast.error("You are not authorized to access this application!");
          return;
        } */

                setAccessToken(response?.data?.data?.access_token);
                setRefreshToken(response?.data?.data?.refresh_token);

                // remove registerPayload from localStorage
                localStorage.removeItem('registerPayload');

                toast.success('Login successful!');
                // redirect to login page
                router.replace('/admin/overview');
                router.refresh();
            } else if (!response?.error?.data?.success) {
                toast.error(
                    response?.error?.data?.message || 'Failed to login!'
                );
            }
        } catch (error: any) {
            console.log('LOGIN ERROR: ', error);
            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            }
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleLogin)}
                className='grid w-full gap-6'
            >
                <h3 className='text-2xl font-medium'>Login</h3>

                <FormField
                    control={form.control}
                    name='phone_number'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder='Enter your phone number'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    type='password'
                                    placeholder='Enter your password'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type='submit' disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader className='animate-spin' /> Login
                        </>
                    ) : (
                        'Login'
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default LoginForm;
