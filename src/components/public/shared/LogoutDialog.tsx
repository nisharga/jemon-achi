'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/public/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/public/ui/dialog';
import { handleLogout } from '@/lib/logout';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/**
 * "Are you sure you want to log out?" — shown before every customer logout.
 *
 * Controlled by the button that opens it: keep `open` in that component's
 * state and render this dialog outside any dropdown, so closing the dropdown
 * does not close the dialog too.
 */
export default function LogoutDialog({ open, onOpenChange }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-sm'>
                <DialogHeader>
                    <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-50'>
                        <LogOut
                            className='size-6 text-red-700'
                            aria-hidden='true'
                        />
                    </div>
                    <DialogTitle className='text-center'>Log out?</DialogTitle>
                    <DialogDescription className='text-center'>
                        Are you sure you want to log out? You can log in again
                        any time with your phone number.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='gap-2 sm:justify-center'>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={handleLogout}
                        className='bg-red-700 text-white hover:bg-red-800'
                    >
                        Yes, log out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
