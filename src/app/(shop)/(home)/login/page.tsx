'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Phone, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/shop/components/ui/button';
import { Input } from '@/shop/components/ui/input';
import { Label } from '@/shop/components/ui/label';
import { Checkbox } from '@/shop/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/shop/components/ui/card';
import { Alert, AlertDescription } from '@/shop/components/ui/alert';
import { API_BASE_URL } from '@/shop/config';
import { setCookie } from '@/shop/auth/cookies';
import { toast } from 'sonner';
import { setAccessToken } from '@/shop/lib/cookies';
import { useLoginMutation } from '@/shop/redux/api/auth-api';
import { cn } from '@/shop/lib/utils';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const router = useRouter();

    const [login, { isLoading }] = useLoginMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear login error when user makes changes
        if (loginError) {
            setLoginError('');
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            // 1. Trigger the mutation
            // .unwrap() is crucial here to catch errors in the 'catch' block
            const result = await login({
                phone_number: formData.phoneNumber,
                password: formData.password
            }).unwrap();

            // 2. Perform your role check
            // Note: check your nesting (data.data.data vs result.data)
            if (result?.data?.data?.role !== 'USER') {
                return toast.error('Only users are allowed to login here.');
            }

            // 3. Handle Token (Save to cookies/storage)
            const token = result?.data?.access_token;
            setAccessToken(token);

            if (token) {
                toast.success('Login successful!');
                router.replace('/profile');
                window.location.reload();
            }
        } catch (err: any) {
            // 4. Handle Errors
            // RTK Query errors usually live in err.data
            const errorMessage =
                err?.data?.message || 'Invalid phone number or password.';
            setLoginError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className='flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10 sm:px-6 lg:min-h-screen lg:px-8'>
            <div className='w-full max-w-md space-y-8'>
                <Card className='border-0 bg-white/80 shadow-none backdrop-blur-sm'>
                    <CardHeader className='space-y-1 pb-4'>
                        <CardTitle className='two-xl-medium text-center'>
                            Sign In
                        </CardTitle>
                        <CardDescription className='sm-normal-primary text-center'>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className='space-y-5'>
                            {loginError && (
                                <Alert
                                    variant='destructive'
                                    className='border-red-200 bg-red-50'
                                >
                                    <AlertDescription className='text-xs'>
                                        {loginError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className='space-y-2'>
                                <Label
                                    htmlFor='phoneNumber'
                                    className='sm-medium'
                                >
                                    Phone Number
                                </Label>
                                <div className='relative'>
                                    <Phone className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400' />
                                    <Input
                                        id='phoneNumber'
                                        name='phoneNumber'
                                        type='tel'
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={`h-11 border-slate-200 pl-10 focus:border-primary focus:ring-primary ${
                                            errors.phoneNumber
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : ''
                                        }`}
                                        placeholder='Enter your phone number'
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className='mt-1 text-xs text-red-600'>
                                        {errors.phoneNumber}
                                    </p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label
                                    htmlFor='password'
                                    className={cn('sm-medium')}
                                >
                                    Password
                                </Label>
                                <div className='relative'>
                                    <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400' />
                                    <Input
                                        id='password'
                                        name='password'
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`h-11 border-slate-200 pr-10 pl-10 focus:border-primary focus:ring-primary ${
                                            errors.password
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : ''
                                        }`}
                                        placeholder='Enter your password'
                                    />
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className='absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 transition-colors hover:text-slate-600'
                                    >
                                        {showPassword ? (
                                            <EyeOff className='h-4 w-4' />
                                        ) : (
                                            <Eye className='h-4 w-4' />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className='mt-1 text-xs text-red-600'>
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='rememberMe'
                                        name='rememberMe'
                                        checked={formData.rememberMe}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                rememberMe: checked as boolean
                                            }))
                                        }
                                        className='border-slate-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary'
                                    />
                                    <Label
                                        htmlFor='rememberMe'
                                        className='cursor-pointer text-xs text-slate-700'
                                    >
                                        Remember me
                                    </Label>
                                </div>
                                <Link
                                    href='/forgot-password'
                                    className='text-xs font-normal text-primary transition-colors hover:text-secondary'
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type='submit'
                                disabled={isLoading}
                                className='sm-medium h-9 w-full bg-primary text-white shadow-none transition-all duration-300 hover:from-secondary hover:to-primary hover:shadow-xl md:h-11'
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Sign Up Link */}
                        <div className='mt-6 text-center'>
                            <p className='sm-normal text-slate-600'>
                                Don&apos;t have an account?{' '}
                                <Link
                                    href='/register'
                                    className='sm-semibold transition-colors hover:text-primary/80'
                                >
                                    Create one now
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
