'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Phone } from 'lucide-react';
import { Button } from '@/shop/components/ui/button';
import { Input } from '@/shop/components/ui/input';
import { Label } from '@/shop/components/ui/label';
import {
    getErrorMessage,
    useSendOtpMutation
} from '@/shop/redux/api/customer-api';
import type { SendOtpResult } from '@/shop/types/customer';

type Props = {
    initialPhone: string;
    onCodeSent: (phone: string, result: SendOtpResult) => void;
};

/** A Bangladeshi mobile number: 11 digits starting with 013–019. */
const BD_PHONE = /^01[3-9]\d{8}$/;

/**
 * Accepts what people usually type ("01712-345678", "+8801712345678")
 * and returns plain digits in the 01XXXXXXXXX form the API expects.
 */
const cleanPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.startsWith('880') ? `0${digits.slice(3)}` : digits;
};

/** Step 1: ask for the phone number and text a login code to it. */
export default function PhoneStep({ initialPhone, onCodeSent }: Props) {
    const [phone, setPhone] = useState(initialPhone);
    const [error, setError] = useState('');
    const [sendOtp, { isLoading }] = useSendOtpMutation();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');

        const phoneNumber = cleanPhoneNumber(phone);
        if (!BD_PHONE.test(phoneNumber)) {
            setError('Please enter a valid mobile number, e.g. 01712345678.');
            return;
        }

        try {
            const result = await sendOtp({
                phone_number: phoneNumber
            }).unwrap();
            onCodeSent(phoneNumber, result);
        } catch (sendError) {
            setError(getErrorMessage(sendError));
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className='space-y-6'>
            <div className='space-y-2 text-center'>
                <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10'>
                    <Phone className='text-primary-ink size-6' />
                </div>
                <h1 className='text-2xl font-semibold text-gray-900'>
                    Log in with your phone
                </h1>
                <p className='text-sm text-gray-600'>
                    We will text you a 6-digit code. New here? Your account is
                    created automatically.
                </p>
            </div>

            <div className='space-y-2'>
                <Label htmlFor='phone'>Mobile number</Label>
                <Input
                    id='phone'
                    type='tel'
                    inputMode='tel'
                    autoComplete='tel'
                    autoFocus
                    placeholder='01712345678'
                    value={phone}
                    onChange={(event) => {
                        setPhone(event.target.value);
                        setError('');
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'phone-error' : undefined}
                    className='h-12 text-base'
                />
                {error && (
                    <p id='phone-error' className='text-sm text-red-600'>
                        {error}
                    </p>
                )}
            </div>

            <Button
                type='submit'
                disabled={isLoading}
                className='h-12 w-full text-base'
            >
                {isLoading && <Loader2 className='animate-spin' />}
                {isLoading ? 'Sending code…' : 'Send code'}
            </Button>
        </form>
    );
}
