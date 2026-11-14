import Logo from '@/components/Logo';
import Link from 'next/link';
import LoginForm from './LoginForm';

interface IProps {
    variant: 'admin' | 'user';
}

/** Centred card with the logo and the login form. */
const LoginCard = ({ variant }: IProps) => {
    return (
        <div className='w-full max-w-[400px] rounded-lg border border-primary-50 bg-white p-6 shadow-base dark:border-gray-800 dark:bg-gray-900'>
            <div className='mb-6 flex justify-center'>
                <Link href='/'>
                    <Logo />
                </Link>
            </div>
            <LoginForm variant={variant} />
        </div>
    );
};

export default LoginCard;
