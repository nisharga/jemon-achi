'use client';

import { setAccessToken, setRefreshToken } from '@/auth/cookies';
import {
    DEFAULT_LOGIN_REDIRECT,
    NEXT_PARAM,
    PROTECTED_PREFIX
} from '@/auth/routes';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/lib/api-error';
import { useLoginMutation } from '@/redux/api-queries/auth-api';
import { LoginSchema, type TLoginSchema } from '@/schema/login';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

/** Only allow returning to pages inside the admin area (no open redirects). */
const getSafeRedirect = (next: string | null) =>
    next && next.startsWith(PROTECTED_PREFIX) ? next : DEFAULT_LOGIN_REDIRECT;

const AdminLoginForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<TLoginSchema>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            phone_number: '',
            password: ''
        }
    });

    const [login, { isLoading }] = useLoginMutation();

    const handleLogin = async (values: TLoginSchema) => {
        try {
            const res = await login(values).unwrap();

            if (!res.success) {
                toast.error(res.message || 'Failed to login!');
                return;
            }

            setAccessToken(res.data.access_token);
            setRefreshToken(res.data.refresh_token);

            toast.success('Login successful!');
            router.replace(getSafeRedirect(searchParams.get(NEXT_PARAM)));
            router.refresh();
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to login!'));
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => void form.handleSubmit(handleLogin)(e)}
                className='grid w-full gap-6'
                noValidate
            >
                <div>
                    <h3 className='text-2xl font-medium text-gray-900 dark:text-gray-100'>
                        Admin Login
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Sign in to manage the dashboard.
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name='phone_number'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input
                                    type='tel'
                                    inputMode='numeric'
                                    autoComplete='username'
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
                                    autoComplete='current-password'
                                    placeholder='Enter your password'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type='submit' disabled={isLoading}>
                    {isLoading && <Loader className='animate-spin' />}
                    Login
                </Button>
            </form>
        </Form>
    );
};

export default AdminLoginForm;
