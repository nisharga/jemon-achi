'use client';

import { Button } from '@/components/ui/admin-button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { useDeleteStaffMutation } from '@/redux/api-queries/staff-api';
import { Loader } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

type DeleteStaffDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    staffId: string;
    staffName: string;
};

const DeleteStaffDialog = ({
    open,
    setOpen,
    staffId,
    staffName
}: DeleteStaffDialogProps) => {
    // === delete staff api mutation hook ===
    const [deleteStaff, { isLoading }] = useDeleteStaffMutation();

    // === handle delete staff ===
    const handleDeleteStaff = async () => {
        try {
            const res: any = await deleteStaff({ staff_id: staffId });
            if (res?.data?.success) {
                setOpen(false);
                toast.success('Staff deleted successfully!');
            } else if (res?.error?.data?.message) {
                toast.error(
                    res?.error?.data?.message || 'Failed to delete staff!'
                );
            }
        } catch (error: any) {
            console.error('DELETE STAFF ERROR: ', error);
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );
            if (err && err?.length > 0) {
                toast.error(err.join('\n'));
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='overflow-hidden p-0 sm:max-w-sm'>
                <DialogHeader className='px-6 pt-6'>
                    <DialogTitle>Delete Staff</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. Are you sure you want to
                        delete{' '}
                        <strong className='text-foreground'>{staffName}</strong>
                        ?
                    </DialogDescription>
                </DialogHeader>

                <div className='grid w-full grid-cols-2 gap-4 border-t bg-muted/50 p-6'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='destructive'
                        disabled={isLoading}
                        onClick={handleDeleteStaff}
                    >
                        {isLoading ? (
                            <>
                                Deleting..
                                <Loader className='ml-2 size-4 animate-spin' />
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteStaffDialog;
