'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/public/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot
} from '@/components/public/ui/input-otp';
import {
    getErrorMessage,
    useSendOtpMutation,
    useVerifyOtpMutation
} from '@/redux/public/api/customer-api';
import { saveLogin } from '@/lib/customer-session';
import { getSafeRedirect, NEXT_PARAM } from '@/auth/routes';
import type { SendOtpResult } from '@/types/public/customer';

type Props = {
    phone: string;
    sentCode: SendOtpResult;
    onCodeResent: (result: SendOtpResult) => void;
    onChangePhone: () => void;
};

const CODE_LENGTH = 6;

/** Step 2: the customer types the code we texted them. */
export default function CodeStep({
    phone,
    sentCode,
    onCodeResent,
    onChangePhone
}: Props) {
    const searchParams = useSearchParams();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [secondsUntilResend, setSecondsUntilResend] = useState(
        sentCode.resend_in
    );

    const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
    const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

    // Count down to 0, one second at a time, so we know when "Resend" is allowed.
    useEffect(() => {
        if (secondsUntilResend <= 0) return;
        const timer = setTimeout(
            () => setSecondsUntilResend((seconds) => seconds - 1),
            1000
        );
        return () => clearTimeout(timer);
    }, [secondsUntilResend]);

    const logIn = async (codeToCheck: string) => {
        if (codeToCheck.length !== CODE_LENGTH) {
            setError('Please enter the 6-digit code.');
            return;
        }
        setError('');

        try {
            const result = await verifyOtp({
                phone_number: phone,
                otp: codeToCheck
            }).unwrap();

            saveLogin(result);

            // Back to the page they wanted (e.g. /profile/orders), else the dashboard.
            const nextPage = getSafeRedirect(
                searchParams.get(NEXT_PARAM),
                'USER'
            );
            // A full page load so the header and every page see the new login.
            window.location.replace(nextPage);
        } catch (verifyError) {
            setError(getErrorMessage(verifyError));
            setCode('');
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        logIn(code);
    };

    const handleResend = async () => {
        setError('');
        setCode('');
        try {
            const result = await sendOtp({ phone_number: phone }).unwrap();
            onCodeResent(result);
            setSecondsUntilResend(result.resend_in);
        } catch (resendError) {
            setError(getErrorMessage(resendError));
        }
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-6'>
            <button
                type='button'
                onClick={onChangePhone}
                className='flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900'
            >
                <ArrowLeft className='size-4' />
                Change number
            </button>

            <div className='space-y-2 text-center'>
                <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10'>
                    <ShieldCheck className='text-primary-ink size-6' />
                </div>
                <h1 className='text-2xl font-semibold text-gray-900'>
                    Enter your code
                </h1>
                <p className='text-sm text-gray-600'>
                    We sent a 6-digit code to{' '}
                    <span className='font-medium text-gray-900'>{phone}</span>.
                    It works for {Math.round(sentCode.expires_in / 60)} minutes.
                </p>
            </div>

            {/* The backend only includes this while developing, so testing needs no SMS. */}
            {sentCode.dev_otp && (
                <p className='rounded-md bg-amber-50 px-3 py-2 text-center text-sm text-amber-800'>
                    Development code:{' '}
                    <span className='font-mono font-semibold tracking-widest'>
                        {sentCode.dev_otp}
                    </span>
                </p>
            )}

            <div className='flex flex-col items-center gap-2'>
                <InputOTP
                    maxLength={CODE_LENGTH}
                    value={code}
                    onChange={(value) => {
                        setCode(value);
                        setError('');
                    }}
                    // Log in as soon as the last digit is typed (or pasted).
                    onComplete={logIn}
                    inputMode='numeric'
                    pattern='^[0-9]*$'
                    autoComplete='one-time-code'
                    autoFocus
                    disabled={isVerifying}
                    aria-label='Login code'
                >
                    <InputOTPGroup>
                        {Array.from({ length: CODE_LENGTH }, (_, index) => (
                            <InputOTPSlot
                                key={index}
                                index={index}
                                aria-invalid={Boolean(error)}
                                className='size-12 text-lg'
                            />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
                {error && (
                    <p className='text-center text-sm text-red-600'>{error}</p>
                )}
            </div>

            <Button
                type='submit'
                disabled={isVerifying || code.length !== CODE_LENGTH}
                className='h-12 w-full text-base'
            >
                {isVerifying && <Loader2 className='animate-spin' />}
                {isVerifying ? 'Checking…' : 'Log in'}
            </Button>

            <p className='text-center text-sm text-gray-600'>
                Didn&apos;t get it?{' '}
                {secondsUntilResend > 0 ? (
                    <span>Send again in {secondsUntilResend}s</span>
                ) : (
                    <button
                        type='button'
                        onClick={handleResend}
                        disabled={isResending}
                        className='text-primary-ink font-medium hover:underline disabled:opacity-50'
                    >
                        {isResending ? 'Sending…' : 'Send a new code'}
                    </button>
                )}
            </p>
        </form>
    );
}
