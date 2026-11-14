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
            src={'/logo.png'}
            alt='site-logo'
            // Above the fold on every page: load straight away.
            loading='eager'
            // Height comes from the classes; keep width proportional.
            style={{ width: 'auto' }}
            sizes='125px'
            className={cn('h-8 w-auto md:h-9', className)}
        />
    );
};

export default Logo;
