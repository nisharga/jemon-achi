import React from 'react';
import LoginForm from './_components/login-form';
import Container from '@/admin/components/shared/container';

const LoginPage = () => {
    return (
        <section className='grid min-h-screen w-full place-items-center bg-secondary'>
            <Container>
                <div className='mx-auto max-w-[400px] gap-6 rounded-lg border bg-background p-6'>
                    <LoginForm />
                </div>
            </Container>
        </section>
    );
};

export default LoginPage;
