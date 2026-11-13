'use client';
import { useMounted } from '@/hooks';
import { useTheme } from 'next-themes';
import { Icons } from './Icons';

export const ThemeSwitcher = () => {
    const mounted = useMounted();
    const { theme, setTheme } = useTheme();

    if (!mounted) {
        return null;
    }

    return (
        <button
            className='w-fit duration-200 hover:scale-110 active:scale-100'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            {theme === 'light' ? (
                <Icons.Moon className='stroke-gray-800 stroke-[1.25px]' />
            ) : (
                <Icons.SunMedium className='stroke-[1.25px]' />
            )}
        </button>
    );
};
