import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const inputClasses =
    'border bg-white border-white text-gray-800 text-sm rounded-lg focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:outline-primary-700 dark:focus:border-primary-500 duration-150 transition-all';

const InputField = forwardRef<HTMLInputElement, IProps>(
    ({ className, type, label, placeholder, required, ...rest }, ref) => {
        return (
            <div className='mb-5'>
                {label && (
                    <label className='mb-2 block text-sm font-medium text-gray-900 dark:text-white'>
                        {label}
                    </label>
                )}
                <input
                    {...rest}
                    ref={ref}
                    type={type || 'text'}
                    className={cn(inputClasses, className)}
                    placeholder={placeholder}
                    required={required}
                />
            </div>
        );
    }
);

InputField.displayName = 'InputField';

export default InputField;
