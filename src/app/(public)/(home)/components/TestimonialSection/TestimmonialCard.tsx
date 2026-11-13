import { Icons } from '@/components/Icons';
import { FC } from 'react';

interface IProps {
    id: string;
    title: string;
    name: string;
    comments: string;
}

const TestimmonialCard: FC<IProps> = ({ comments, name, title }) => {
    return (
        <div className='flex flex-col items-center justify-center gap-6 rounded-xl bg-primary-50 p-4 text-center dark:bg-primary-800'>
            <p>{comments}</p>
            <Icons.Quote className='fill-primary-600' />
            <div className=''>
                <h5 className='text-center font-semibold text-gray-900 dark:text-gray-100'>
                    {name}
                </h5>
                <p className='text-gray-600 dark:text-gray-200'>{title}</p>
            </div>
        </div>
    );
};

export default TestimmonialCard;
