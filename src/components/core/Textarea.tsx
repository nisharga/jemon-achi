import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface IProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

const textareaClasses =
    'border bg-white border-white text-gray-800 text-sm rounded-lg focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:outline-primary-700 dark:focus:border-primary-500 duration-150 transition-all';

const Texarea = forwardRef<HTMLTextAreaElement, IProps>(
    ({ className, label, placeholder, required, ...rest }, ref) => {
        return (
            <div className='mb-5'>
                {label && (
                    <label className='mb-2 block text-sm font-medium text-gray-900 dark:text-white'>
                        {label}
                    </label>
                )}

                <textarea
                    {...rest}
                    ref={ref}
                    rows={6}
                    placeholder={placeholder}
                    required={required}
                    className={cn(textareaClasses, className)}
                ></textarea>
            </div>
        );
    }
);

Texarea.displayName = 'Texarea';

export default Texarea;
