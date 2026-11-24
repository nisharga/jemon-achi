import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react'; // Optional: for icons

const ErrorState = ({ isError, onRetry }: any) => {
    if (!isError) return null;

    return (
        <div className='animate-fadeIn my-4 w-full rounded-lg border border-red-100 bg-red-50 p-8 text-center'>
            <div className='mb-3 flex justify-center'>
                <AlertCircle className='h-10 w-10 text-red-500' />
            </div>
            <h3 className='text-lg font-bold text-red-800'>
                Oops! Something went wrong
            </h3>
            <p className='mt-1 mb-4 text-red-600'>
                {"We couldn't load the information. Please try again."}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className='inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700'
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorState;

export const NoData = ({ message }: { message: string }) => {
    return (
        <div className='rounded-lg border-2 border-dashed border-gray-200 py-20 text-center'>
            <p className='text-lg text-gray-600'>{message}</p>
        </div>
    );
};
