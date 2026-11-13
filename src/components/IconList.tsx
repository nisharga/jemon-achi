import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';

interface IProps {
    className?: string;
    children: ReactNode;
    list: string[];
}

const IconList: FC<IProps> = ({ children, list, className }) => {
    return (
        <ul className={cn('mb-10 flex flex-col gap-4 last:mb-0', className)}>
            {(list ?? []).map((label: string) => (
                <li key={label} className='flex items-center gap-4 text-lg'>
                    <span>{children}</span>
                    <span>{label}</span>
                </li>
            ))}
        </ul>
    );
};

export default IconList;
