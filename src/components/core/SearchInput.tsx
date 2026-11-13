'use client';
import { ChangeEvent } from 'react';

interface ISearchInput {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}
const SearchInput = ({ onChange, placeholder }: ISearchInput) => {
    return (
        <div className='w-full'>
            <label htmlFor='search' className='sr-only'>
                Search projects
            </label>
            <div className='relative text-gray-300 focus-within:text-gray-400'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                    <svg
                        className='h-5 w-5'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                    >
                        <path
                            fillRule='evenodd'
                            d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                            clipRule='evenodd'
                        ></path>
                    </svg>
                </div>
                <input
                    onChange={onChange}
                    id='search'
                    className='block w-full rounded-md border border-transparent bg-gray-200/25 py-2 pr-3 pl-10 leading-5 text-indigo-300 placeholder-gray-300 transition duration-150 ease-in-out focus:border-indigo-500 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none sm:text-sm'
                    placeholder={placeholder || 'Search here'}
                    type='search'
                />
            </div>
        </div>
    );
};

export default SearchInput;
