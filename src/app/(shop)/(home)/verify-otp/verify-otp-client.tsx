'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { decryptPhone } from '@/shop/lib/crypto';
import Link from 'next/link';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot
} from '@/shop/components/ui/input-otp';
import { API_BASE_URL } from '@/shop/config';
import { setCookie } from '@/shop/auth/cookies';
import { toast } from 'sonner';

export default function VerifyOTPPage() {
    const [otp, setOtp] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            try {
                const decryptedPhone = decryptPhone(token);
                setPhoneNumber(decryptedPhone);
            } catch (error) {
                console.error('Failed to decrypt phone number:', error);
                router.push('/register');
            }
        } else {
            router.push('/register');
        }
    }, [searchParams, router]);

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
        setOtp(value);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 5) {
            setError('Please enter a valid 5-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(API_BASE_URL + '/user/verify-otp', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    otp: Number.parseInt(otp)
                })
            });

            const data = await response.json();

            console.log(data, 'OTP data');

            if (response.ok && data.success) {
                if (data?.data?.data?.role !== 'USER') {
                    toast.error('Your access is denied.');
                    return;
                } else {
                    setCookie('token', data.data.access_token, 30);
                    toast.success(data?.message || 'OTP verified successfully');
                    router.replace('/profile');
                }
            } else {
                setError(data.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        try {
            throw 'Error resending OTP';
        } catch (error) {
            console.error('Resend OTP error:', error);
        } finally {
            setIsResending(false);
        }
    };

    if (!phoneNumber) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <p className='text-gray-600'>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
            <div className='w-full max-w-md space-y-8'>
                <div className='rounded-lg bg-white p-8 shadow-none'>
                    <div className='mb-8 text-center'>
                        <h2 className='text-xl font-medium text-gray-900'>
                            Verify Your Phone
                        </h2>
                        <p className='mt-2 text-gray-600'>
                            We&apos;ve sent a 5-digit code to
                        </p>
                        <p className='font-medium text-gray-900'>
                            {phoneNumber.substring(0, 3)}
                            {'****'}
                            {phoneNumber.substring(phoneNumber.length - 2)}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label
                                htmlFor='otp'
                                className='mb-2 block text-sm font-medium text-gray-500'
                            >
                                Enter OTP Code
                            </label>
                            <div className='flex justify-center'>
                                <InputOTP
                                    maxLength={5}
                                    value={otp}
                                    onChange={(value) => {
                                        setOtp(value);
                                        setError('');
                                    }}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            {error && (
                                <p className='mt-1 text-center text-sm text-red-600'>
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type='submit'
                            disabled={isLoading || otp.length !== 5}
                            className='h-11 w-full rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-secondary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>

                    <div className='mt-6 space-y-4 text-center'>
                        <p className='text-gray-600'>
                            {"Didn't receive the code?"}
                        </p>
                        <button
                            onClick={handleResendOTP}
                            disabled={isResending}
                            className='font-medium text-primary transition-colors hover:text-secondary disabled:opacity-50'
                        >
                            {isResending ? 'Resending...' : 'Resend OTP'}
                        </button>

                        <div className='border-t border-gray-200 pt-4'>
                            <Link
                                href='/register'
                                className='text-sm text-gray-600 transition-colors hover:text-gray-500'
                            >
                                ← Back to Registration
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
