import Logo from '@/components/Logo';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminLoginForm } from './components';

export const metadata: Metadata = {
    title: 'Admin Login'
};

const AdminLoginPage = () => {
    return (
        <div className='w-full max-w-[400px] rounded-lg border border-primary-50 bg-white p-6 shadow-base dark:border-gray-800 dark:bg-gray-900'>
            <div className='mb-6 flex justify-center'>
                <Logo />
            </div>
            {/* useSearchParams inside the form requires a Suspense boundary */}
            <Suspense fallback={null}>
                <AdminLoginForm />
            </Suspense>
        </div>
    );
};

export default AdminLoginPage;
