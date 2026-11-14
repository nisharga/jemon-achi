'use client';

import { clearSession, setAccessToken, setRefreshToken } from '@/auth/cookies';
import { getDecodedUser } from '@/auth/decoded';
import { loginRequest, type TLoginVariant } from '@/auth/login-request';
import { isAdminRole } from '@/auth/roles';
import { getSafeRedirect, NEXT_PARAM } from '@/auth/routes';
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
import { LoginSchema, type TLoginSchema } from '@/schema/login';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const COPY: Record<TLoginVariant, { title: string; description: string }> = {
    admin: {
        title: 'Admin Login',
        description: 'Sign in to manage the dashboard.'
    },
    user: {
        title: 'Login',
        description: 'Sign in to your account.'
    }
};

interface IProps {
    variant: TLoginVariant;
}

/**
 * Phone + password login shared by `/login` (customers) and `/admin-login`
 * (staff). Each variant calls its own backend endpoint; the admin variant
 * also refuses accounts without a staff role.
 */
const LoginForm = ({ variant }: IProps) => {
    const router = useRouter();

    const form = useForm<TLoginSchema>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            phone_number: '',
            password: ''
        }
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (values: TLoginSchema) => {
        setIsLoading(true);
        try {
            const res = await loginRequest(variant, values);

            if (!res.success) {
                toast.error(res.message || 'Failed to login!');
                return;
            }

            const { access_token, refresh_token } = res.data;
            const role = getDecodedUser(access_token)?.role;

            if (variant === 'admin' && !isAdminRole(role)) {
                clearSession();
                toast.error('This account does not have dashboard access.');
                return;
            }

            setAccessToken(access_token);
            setRefreshToken(refresh_token);

            toast.success('Login successful!');
            // Read `?next=` only when submitting: calling useSearchParams()
            // during render would drop the form out of the static HTML.
            const next = new URLSearchParams(window.location.search).get(
                NEXT_PARAM
            );
            router.replace(getSafeRedirect(next, role));
            router.refresh();
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to login!'));
        } finally {
            setIsLoading(false);
        }
    };

    const { title, description } = COPY[variant];

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => void form.handleSubmit(handleLogin)(e)}
                className='grid w-full gap-6'
                noValidate
            >
                <div>
                    <h3 className='text-2xl font-medium text-gray-900 dark:text-gray-100'>
                        {title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {description}
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

export default LoginForm;
