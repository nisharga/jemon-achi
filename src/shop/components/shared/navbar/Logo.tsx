import Image from 'next/image';
import Link from 'next/link';

/** Shop logo, linking to the home page. */
export default function Logo() {
    return (
        <Link href='/' className='shrink-0' aria-label='Griipbuddy home'>
            <Image
                src='/logo/logo-transparent.jpg'
                alt='Griipbuddy'
                width={100}
                height={50}
                loading='eager'
                className='h-auto w-auto'
            />
        </Link>
    );
}
