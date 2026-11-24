'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/public/ui/card';
import type { SendOtpResult } from '@/types/public/customer';
import PhoneStep from './_components/PhoneStep';
import CodeStep from './_components/CodeStep';

/**
 * Phone login in two steps:
 *   1. the customer types their phone number and we text them a code
 *   2. they type the code and are logged in
 *
 * There is no separate sign-up: a new phone number gets an account
 * automatically the first time its code is confirmed.
 */
export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [sentCode, setSentCode] = useState<SendOtpResult | null>(null);

    const handleCodeSent = (phoneNumber: string, result: SendOtpResult) => {
        setPhone(phoneNumber);
        setSentCode(result);
    };

    return (
        <section className='flex min-h-[70vh] items-center justify-center px-4 py-10'>
            <Card className='w-full max-w-md border-0 shadow-lg'>
                <CardContent className='p-6 sm:p-8'>
                    {sentCode ? (
                        <CodeStep
                            phone={phone}
                            sentCode={sentCode}
                            onCodeResent={setSentCode}
                            onChangePhone={() => setSentCode(null)}
                        />
                    ) : (
                        <PhoneStep
                            initialPhone={phone}
                            onCodeSent={handleCodeSent}
                        />
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
