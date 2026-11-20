'use client';

import { Button } from '@/admin/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/admin/components/ui/dialog';
import { Label } from '@/admin/components/ui/label';
import { useOrderAdminNoteMutation } from '@/admin/redux/api-queries/order-api';
import { Loader } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/admin/components/ui/textarea';
import { IRoles } from '@/admin/types/user';
import { format } from 'date-fns';

type DialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    order_id: string;
    notes: {
        note: string;
        added_at: Date;
        added_by: {
            _id: string;
            full_name: string;
            role: IRoles;
        };
        _id: string;
    }[];
};

const UpdateOrderNoteDialog = ({
    open,
    setOpen,
    order_id,
    notes
}: DialogProps) => {
    const [note, setNote] = useState('');

    const [updateAdminNote, { isLoading }] = useOrderAdminNoteMutation();

    // === handle update order note ===
    const handleUpdateOrderNote = async () => {
        try {
            const updateNoteRes: any = await updateAdminNote({
                payload: { note: note },
                order_id
            });
            if (updateNoteRes?.data?.success) {
                toast.success('Order note updated!');
                setOpen(false);
            } else if (updateNoteRes?.error?.data?.message) {
                toast.error(
                    updateNoteRes?.error?.data?.message ||
                        'Failed to update order note!'
                );
            }
        } catch (error: any) {
            console.error('UPDATE ORDER NOTE ERROR: ', error);
            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );

            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            } else {
                toast.error('Somthing went wrong!');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen} modal>
            <DialogContent className='overflow-hidden p-0 sm:max-w-md lg:max-w-xl'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle>Update Note</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Dialog Description for Meta
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 px-6'>
                    <div className='space-y-2'>
                        <Label>New Note</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e?.target?.value)}
                            placeholder='Enter you note'
                        />
                    </div>
                    {notes?.length > 0 && (
                        <div className='grid gap-2'>
                            {notes?.toReversed()?.map((n) => {
                                return (
                                    <div
                                        key={n?._id}
                                        className='w-full space-y-2 rounded-md border bg-muted/30 p-2'
                                    >
                                        <p className='text-sm'>{n?.note}</p>
                                        <div className='flex w-full items-center justify-between gap-2 text-sm font-medium text-primary'>
                                            <p className='text-xs text-muted-foreground'>
                                                Added By:{' '}
                                                {n?.added_by?.full_name}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                {format(
                                                    new Date(n?.added_at),
                                                    'dd MMM yyyy'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className='grid w-full grid-cols-2 gap-4 border-t bg-muted/50 p-6'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <Button
                        disabled={isLoading}
                        onClick={handleUpdateOrderNote}
                    >
                        {isLoading ? (
                            <>
                                <Loader className='size-4 animate-spin' />
                                Updating Note
                            </>
                        ) : (
                            `Update Note`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateOrderNoteDialog;
