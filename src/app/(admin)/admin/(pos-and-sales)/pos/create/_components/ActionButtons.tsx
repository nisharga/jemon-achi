'use client';
import React from 'react';
import { Button } from '@/admin/components/ui/button';
import { Loader } from 'lucide-react';

interface Props {
    onSave: () => void;
    onSavePrint: () => void;
    isDisabled: boolean;
    isLoading: boolean;
}

export const ActionButtons: React.FC<Props> = ({
    onSave,
    // onSavePrint,
    isDisabled,
    isLoading
}) => (
    <div className='flex justify-end gap-4'>
        <Button variant='primary' onClick={onSave} disabled={isDisabled}>
            Save
            {isLoading && <Loader size={16} className='ml-2 animate-spin' />}
        </Button>

        {/* <Button variant="primary" onClick={onSavePrint} disabled={isDisabled}>
      Save & Print
      {isLoading && <Loader size={16} className="animate-spin ml-2" />}
    </Button> */}
    </div>
);
