import type { Metadata } from 'next';
import { LoginCard } from '../components';

export const metadata: Metadata = {
    title: 'Login'
};

const LoginPage = () => <LoginCard variant='user' />;

export default LoginPage;
