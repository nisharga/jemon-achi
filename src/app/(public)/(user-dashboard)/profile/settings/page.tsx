'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shop/components/ui/button';
import { Input } from '@/shop/components/ui/input';
import { Label } from '@/shop/components/ui/label';
import { Skeleton } from '@/shop/components/ui/skeleton';
import { useUser } from '@/shop/hooks/use-user';
import {
    getErrorMessage,
    useUpdateMyProfileMutation
} from '@/shop/redux/api/customer-api';
import type { Customer } from '@/shop/types/customer';
import { hasRealName } from '../_lib/format';
import Panel from '../_components/Panel';

/** Lets the customer change their name and email. */
export default function AccountSettingsPage() {
    const { user, isLoading } = useUser();

    return (
        <div className='space-y-6'>
            <h1 className='text-2xl font-semibold text-gray-900'>
                Account details
            </h1>

            <Panel title='Personal information'>
                {isLoading || !user ? (
                    <div className='space-y-4 p-6'>
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-10 w-full' />
                    </div>
                ) : (
                    // The form starts with the saved values, so it only renders once they are loaded.
                    <ProfileForm customer={user} />
                )}
            </Panel>
        </div>
    );
}

/** Very small email check; the server does the full validation. */
const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

function ProfileForm({ customer }: { customer: Customer }) {
    const [fullName, setFullName] = useState(
        hasRealName(customer.full_name) ? customer.full_name : ''
    );
    const [email, setEmail] = useState(customer.email ?? '');
    const [error, setError] = useState('');
    const [updateProfile, { isLoading: isSaving }] =
        useUpdateMyProfileMutation();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');

        const name = fullName.trim();
        const emailAddress = email.trim();

        if (name.length < 2) {
            setError('Please enter your full name.');
            return;
        }
        if (!looksLikeEmail(emailAddress)) {
            setError('Please enter a valid email, e.g. rahim@example.com.');
            return;
        }

        try {
            await updateProfile({
                full_name: name,
                email: emailAddress
            }).unwrap();
            toast.success('Your details are saved.');
        } catch (saveError) {
            setError(getErrorMessage(saveError));
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className='max-w-lg space-y-5 px-4 py-6 sm:px-6'
        >
            <div className='space-y-2'>
                <Label htmlFor='full_name'>Full name</Label>
                <Input
                    id='full_name'
                    autoComplete='name'
                    placeholder='e.g. Rahim Uddin'
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                />
            </div>

            <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                    id='email'
                    type='email'
                    autoComplete='email'
                    placeholder='e.g. rahim@example.com'
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </div>

            <div className='space-y-2'>
                <Label htmlFor='phone'>Mobile number</Label>
                <Input id='phone' value={customer.phone_number} disabled />
                <p className='text-xs text-gray-600'>
                    You log in with this number, so it cannot be changed here.
                </p>
            </div>

            {error && <p className='text-sm text-red-600'>{error}</p>}

            <Button type='submit' disabled={isSaving}>
                {isSaving && <Loader2 className='animate-spin' />}
                {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
        </form>
    );
}
