'use client';

import { cn } from '@/lib/utils';
import { ReactNode, useEffect } from 'react';

interface IProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    header?: string | ReactNode;
    bodyClass?: string;
}
const Modal = ({ isOpen, onClose, children, header, bodyClass }: IProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className='fixed top-0 right-0 left-0 z-[999999] flex h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900/40 p-4 md:inset-0'>
            <div
                className={cn('relative max-h-full w-full max-w-md', bodyClass)}
            >
                <div className='relative rounded-lg bg-white shadow dark:bg-gray-700'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='absolute top-3 right-2.5 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-100/50 hover:text-gray-800 dark:hover:bg-gray-600 dark:hover:text-white'
                    >
                        <svg
                            className='h-3 w-3'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 14 14'
                        >
                            <path
                                stroke='currentColor'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                            />
                        </svg>
                        <span className='sr-only'>Close modal</span>
                    </button>

                    {header ? (
                        <div className='px-6 pt-4'>
                            <h3 className='text-base font-semibold text-gray-900 lg:text-xl dark:text-white'>
                                {header}
                            </h3>
                        </div>
                    ) : null}

                    <div className='p-6 text-center'>{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
