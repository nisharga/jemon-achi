import { FC } from 'react';

interface IProps {
    title: string;
    description?: string;
    className?: string;
    headingClass?: string;
    descriptionClass?: string;
}

const SectionHeading: FC<IProps> = ({ title, description, className }) => {
    return (
        <div className={className}>
            <h2
                data-aos='fade-right'
                className={`mb-8 text-4xl leading-tight font-semibold text-gray-900 dark:text-gray-100`}
            >
                {title}
            </h2>
            {description ? <p data-aos='fade-up'>{description}</p> : null}
        </div>
    );
};

export default SectionHeading;
