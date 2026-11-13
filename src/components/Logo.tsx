import { cn } from '@/lib/utils';
import Image from 'next/image';
import { FC } from 'react';

interface IProps {
    className?: string;
}

const Logo: FC<IProps> = ({ className }) => {
    return (
        <Image
            height={45}
            width={125}
            src={'/logo.svg'}
            alt='site-logo'
            // The logo sits in the sticky header, so it is the LCP element.
            loading='eager'
            fetchPriority='high'
            // Height comes from the classes; keep width proportional.
            style={{ width: 'auto' }}
            className={cn('h-8 w-auto md:h-9', className)}
            unoptimized
        />
    );
};

export default Logo;
