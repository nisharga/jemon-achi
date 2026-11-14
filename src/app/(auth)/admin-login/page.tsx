import type { Metadata } from 'next';
import { LoginCard } from '../components';

export const metadata: Metadata = {
    title: 'Admin Login'
};

const AdminLoginPage = () => <LoginCard variant='admin' />;

export default AdminLoginPage;
