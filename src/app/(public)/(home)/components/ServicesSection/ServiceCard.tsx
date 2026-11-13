import { FC, ReactNode } from 'react';

interface IProps {
    name: string;
    icon: ReactNode;
    details: string;
}

const ServiceCard: FC<IProps> = ({ icon, name, details }) => {
    return (
        <div
            data-aos='zoom-in'
            className='rounded-lg bg-primary-50 px-4 py-5 dark:bg-primary-900'
        >
            <div className='mb-6'>{icon}</div>
            <h5 className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {name}
            </h5>
            <p>{details}</p>
        </div>
    );
};

export default ServiceCard;
