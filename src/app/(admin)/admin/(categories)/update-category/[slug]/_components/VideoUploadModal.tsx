'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/admin/components/ui/dialog';

export const VideoPreviewModal = ({
    isOpen,
    onClose,
    videoUrl,
    title
}: {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
    title: string;
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-3xl overflow-hidden border-none bg-black p-0'>
                <DialogHeader className='bg-card p-4'>
                    <DialogTitle>{title} Video Preview</DialogTitle>
                </DialogHeader>
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className='h-auto max-h-[70vh] w-full'
                />
            </DialogContent>
        </Dialog>
    );
};
