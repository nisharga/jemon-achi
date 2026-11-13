'use client';
import { Button, InputField, Texarea } from '@/components/core';
import { API_BASE_URL } from '@/configs/env';
import axios from 'axios';
import { ChangeEvent, useState } from 'react';

const INITIAL_FORM = {
    firstName: '',
    lastName: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    location: '',
    message: ''
};

type TStatus = 'idle' | 'success' | 'error';

const ContactForm = () => {
    const [contactForm, setContactForm] = useState(INITIAL_FORM);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<TStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const onChangeInputHandler = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setContactForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async () => {
        setIsLoading(true);
        setError(null);
        setStatus('idle');
        const {
            firstName,
            lastName,
            businessEmail,
            businessName,
            location,
            message
        } = contactForm;

        // businessPhone is optional; everything else is required
        if (
            !firstName ||
            !lastName ||
            !businessEmail ||
            !businessName ||
            !location ||
            !message
        ) {
            setError('All fields are required!');
            setStatus('error');
            setIsLoading(false);
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/contacts/submissions`,
                contactForm
            );
            setStatus('success');
            setContactForm(INITIAL_FORM);
        } catch {
            setError('Something wrong. Please try again.');
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='rounded-lg border border-primary-50 bg-primary-100/20 p-6'>
            <h3 className='mb-4 text-xl font-semibold capitalize'>
                Get in touch
            </h3>
            {status === 'success' ? (
                <p className='mb-6 text-sm text-success'>
                    Thanks for contacting. We will reply within 24 hours.
                </p>
            ) : (
                <p className='mb-6 text-sm text-error'>{error}</p>
            )}

            <div>
                <div className='flex w-full grid-cols-2 flex-col gap-4 xs:grid'>
                    <InputField
                        onChange={onChangeInputHandler}
                        value={contactForm.firstName}
                        name='firstName'
                        placeholder='First Name'
                    />
                    <InputField
                        onChange={onChangeInputHandler}
                        value={contactForm.lastName}
                        name='lastName'
                        placeholder='Last Name'
                    />
                </div>
                <InputField
                    onChange={onChangeInputHandler}
                    value={contactForm.businessName}
                    name='businessName'
                    placeholder='Business Name'
                />
                <InputField
                    onChange={onChangeInputHandler}
                    value={contactForm.businessEmail}
                    name='businessEmail'
                    type='email'
                    placeholder='Business Email'
                />
                <InputField
                    onChange={onChangeInputHandler}
                    value={contactForm.businessPhone}
                    name='businessPhone'
                    placeholder='Business Phone Number (Optional)'
                />
                <InputField
                    onChange={onChangeInputHandler}
                    value={contactForm.location}
                    name='location'
                    placeholder='Location'
                />
                <Texarea
                    onChange={onChangeInputHandler}
                    value={contactForm.message}
                    name='message'
                    placeholder='Message'
                />

                <Button
                    className='w-40 disabled:opacity-60'
                    onClick={() => void onSubmit()}
                    disabled={isLoading}
                    color='primary'
                >
                    {isLoading ? 'Loading...' : 'Send message'}
                </Button>
            </div>
        </div>
    );
};

export default ContactForm;
