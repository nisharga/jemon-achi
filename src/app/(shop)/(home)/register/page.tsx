'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { encryptPhone } from '@/shop/lib/crypto';
import { API_BASE_URL } from '@/shop/config';
import { Eye, EyeClosed, EyeOff } from 'lucide-react';
import {
    CardDescription,
    CardHeader,
    CardTitle
} from '@/shop/components/ui/card';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d{11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber =
                'Please enter a valid 11-digit phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        console.log(formData, 'form data');

        setIsLoading(true);
        try {
            const response = await fetch(API_BASE_URL + '/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    full_name: formData.fullName,
                    phone_number: formData.phoneNumber,
                    password: formData.password
                })
            });

            const data = await response.json();

            console.log(data, 'OTP data');
            if (response.ok && data.success) {
                const encryptedPhone = encryptPhone(formData.phoneNumber);
                router.push(`/verify-otp?token=${encryptedPhone}`);
            } else {
                setErrors({ submit: data.message || 'Registration failed' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
            <div className='w-full max-w-md space-y-8'>
                <div className='rounded-lg bg-white p-8 shadow-none'>
                    <CardHeader className='space-y-1 pb-4'>
                        <CardTitle className='two-xl-medium text-center'>
                            Create Account
                        </CardTitle>
                        <CardDescription className='sm-normal-primary text-center'>
                            Sign up to get started
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label
                                htmlFor='fullName'
                                className='sm-medium mb-2 block'
                            >
                                Full Name
                            </label>
                            <input
                                id='fullName'
                                name='fullName'
                                type='text'
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-3 text-xs transition-colors focus:ring-2 focus:outline-none ${
                                    errors.fullName
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                                }`}
                                placeholder='Enter your full name'
                            />
                            {errors.fullName && (
                                <p className='mt-1 text-xs text-red-600'>
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor='phoneNumber'
                                className='sm-medium mb-2 block'
                            >
                                Phone Number
                            </label>
                            <input
                                id='phoneNumber'
                                name='phoneNumber'
                                type='tel'
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-3 text-xs transition-colors focus:ring-2 focus:outline-none ${
                                    errors.phoneNumber
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                                }`}
                                placeholder='01XXXXXXXXX'
                            />
                            {errors.phoneNumber && (
                                <p className='mt-1 text-xs text-red-600'>
                                    {errors.phoneNumber}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor='password'
                                className='sm-medium mb-2 block'
                            >
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border px-4 py-3 text-xs transition-colors focus:ring-2 focus:outline-none ${
                                        errors.password
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-primary focus:ring-primary'
                                    }`}
                                    placeholder='Create a password'
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    className='absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500'
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className='size-4' />
                                    ) : (
                                        <Eye className='size-4' />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className='mt-1 text-xs text-red-600'>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor='confirmPassword'
                                className='sm-medium mb-2 block'
                            >
                                Confirm Password
                            </label>
                            <div className='relative'>
                                <input
                                    id='confirmPassword'
                                    name='confirmPassword'
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border px-4 py-3 text-xs transition-colors focus:ring-2 focus:outline-none ${
                                        errors.confirmPassword
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-primary focus:ring-primary'
                                    }`}
                                    placeholder='Confirm your password'
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                    }
                                    className='absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500'
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className='size-4' />
                                    ) : (
                                        <Eye className='size-4' />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className='mt-1 text-xs text-red-600'>
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <div className='flex items-center'>
                            <input
                                id='terms'
                                name='terms'
                                type='checkbox'
                                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                required
                            />
                            <label
                                htmlFor='terms'
                                className='ml-2 block text-xs text-gray-700'
                            >
                                I agree to the{' '}
                                <Link
                                    href='/terms-and-conditions'
                                    className='text-primary/80 underline transition-colors hover:text-primary'
                                >
                                    Terms and Conditions
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href='/privacy-and-policy'
                                    className='text-primary/80 underline transition-colors hover:text-primary'
                                >
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        {errors.submit && (
                            <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                                <p className='text-xs text-red-600'>
                                    {errors.submit}
                                </p>
                            </div>
                        )}

                        <button
                            type='submit'
                            disabled={isLoading}
                            className='sm-medium h-11 w-full cursor-pointer rounded-lg bg-primary px-4 text-white transition-colors hover:bg-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            {isLoading
                                ? 'Creating Account...'
                                : 'Create Account'}
                        </button>
                    </form>

                    <div className='mt-6 text-center'>
                        <p className='sm-normal text-gray-600'>
                            Already have an account?{' '}
                            <Link
                                href='/login'
                                className='sm-semibold text-primary transition-colors hover:text-primary/80'
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
