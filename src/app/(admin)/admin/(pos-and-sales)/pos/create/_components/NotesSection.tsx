'use client';

import React from 'react';
import { Label } from '@/admin/components/ui/label';
import { Textarea } from '@/admin/components/ui/textarea';

interface Props {
    saleNote: string;
    paymentNote: string;
    onSaleNoteChange: (v: string) => void;
    onPaymentNoteChange: (v: string) => void;
}

export const NotesSection: React.FC<Props> = ({
    saleNote,
    paymentNote,
    onSaleNoteChange,
    onPaymentNoteChange
}) => (
    <div className='space-y-4'>
        <div className='space-y-1'>
            <Label htmlFor='sale-note'>Sale Note</Label>
            <Textarea
                id='sale-note'
                rows={2}
                value={saleNote}
                onChange={(e) => onSaleNoteChange(e.target.value)}
            />
        </div>
        <div className='space-y-1'>
            <Label htmlFor='payment-note'>Payment Note</Label>
            <Textarea
                id='payment-note'
                rows={2}
                value={paymentNote}
                onChange={(e) => onPaymentNoteChange(e.target.value)}
            />
        </div>
    </div>
);
