'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/admin-input';
import { RotateCcwIcon, UserPlus } from 'lucide-react';
import useDebounce from '@/hooks/use-debounce';
import { Button } from '@/components/ui/admin-button';
import { useLazySearchUsersByPhoneQuery } from '@/redux/admin/api/pos-sale-api';
import { Label } from '@/components/ui/admin-label';

// Define a type for the customer object used within the component
export interface Customer {
    phone: string;
    name: string;
}

// // Define a type for the user object returned by the API
interface TUser {
    _id: string;
    full_name: string;
    phone_number: string;
}

interface Props {
    selectedCustomer: Customer | null; // Allow null for initial state
    onSelect: (c: Customer) => void;
    onAddNew: (phone: string, name: string) => void;
    businessLocation: string;
}

export const CustomerSelector: React.FC<Props> = ({
    selectedCustomer,
    onSelect,
    onAddNew,
    businessLocation
}) => {
    const [open, setOpen] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const debouncedPhone = useDebounce(phoneInput, 400);

    const [trigger, { data: searchResult, isLoading }] =
        useLazySearchUsersByPhoneQuery();

    // Whenever the debounced phone number changes, trigger the API search
    useEffect(() => {
        if (debouncedPhone.trim().length > 2) {
            // Start searching after a few digits
            trigger(debouncedPhone);
        }
    }, [debouncedPhone, trigger]);

    const handleAddNew = () => {
        if (phoneInput.trim()) {
            // Pass both phoneInput and nameInput
            const name = nameInput.trim() || 'New Customer'; // Default name if none is provided
            onAddNew(phoneInput.trim(), name);
            setOpen(false);
            setPhoneInput('');
            setNameInput(''); // Clear name input as well
        }
    };
    const handleReset = () => {
        onSelect({ name: 'Walk-In Customer', phone: '' });
        setPhoneInput('');
        setNameInput('');
        setOpen(false);
    };

    const noCustomerFound =
        debouncedPhone.trim() &&
        !isLoading &&
        (searchResult?.data?.length === 0 || searchResult?.data === undefined);

    return (
        <div className='relative space-y-2'>
            {/* <button
        type="button"
        className="w-full text-left p-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:cursor-pointer"
        onClick={() => setOpen((o) => !o)}
        disabled={!businessLocation}
      >
        {selectedCustomer?.phone
          ? `${selectedCustomer?.name} (${selectedCustomer?.phone})`
          : "Walk-in Customer"}
      </button> */}
            <Label>Customer</Label>
            <Button
                type='button'
                variant='outline'
                className='w-full justify-start'
                onClick={() => setOpen((o) => !o)}
                disabled={!businessLocation}
            >
                {selectedCustomer?.phone
                    ? `${selectedCustomer?.name} (${selectedCustomer?.phone})`
                    : 'Walk-in Customer'}
            </Button>

            {open && (
                <div className='absolute z-10 mt-1 w-full space-y-2 rounded-lg border bg-white p-3 shadow-lg'>
                    <div className='flex items-center gap-2'>
                        <Input
                            placeholder='Search by phone...'
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            autoFocus
                        />
                        <Button
                            onClick={handleAddNew}
                            title='Add new customer'
                            variant={'outline'}
                        >
                            <UserPlus />
                        </Button>
                        <Button
                            onClick={handleReset}
                            title='Reset'
                            variant={'outline'}
                        >
                            <RotateCcwIcon />
                        </Button>
                    </div>

                    {/* New Customer Name Input - Only appears when no results are found */}
                    {noCustomerFound && (
                        <div className=''>
                            <p className='pb-1 text-sm font-medium'>
                                Add Customer Name
                            </p>
                            <Input
                                placeholder='Enter new customer name (optional)'
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                            />
                        </div>
                    )}

                    {isLoading ? (
                        <div className='p-2 text-sm text-gray-500'>
                            Searching...
                        </div>
                    ) : noCustomerFound ? (
                        <div className='p-2 text-sm text-gray-500'>
                            No customers found. Enter a name above and click the
                            &apos;+&apos; icon to add as a new customer with
                            phone: **{phoneInput.trim()}**.
                        </div>
                    ) : (
                        <div className='max-h-60 overflow-y-auto'>
                            {searchResult?.data?.map((c: TUser) => (
                                <div
                                    key={c._id}
                                    className='cursor-pointer rounded-md p-2 hover:bg-gray-100'
                                    onClick={() => {
                                        onSelect({
                                            name: c.full_name,
                                            phone: c.phone_number
                                        });
                                        setOpen(false);
                                        setPhoneInput(''); // Clear search input after selection
                                        setNameInput(''); // Clear name input
                                    }}
                                >
                                    {c.full_name} ({c.phone_number})
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
