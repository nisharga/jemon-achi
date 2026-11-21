/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { XCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/admin-button';
import { Input } from '@/components/ui/admin-input';
import { cn } from '@/lib/admin-utils';

interface VideoUploadInputProps {
    inputId: string;
    defaultValue?: string; // existing video URL
    onChange?: (video: File | string | undefined) => void;
    className?: string;
}

export const VideoUploadInput = ({
    inputId,
    defaultValue,
    onChange,
    className
}: VideoUploadInputProps) => {
    const [localVideo, setLocalVideo] = useState<{
        file?: File;
        url?: string;
    }>(defaultValue ? { url: defaultValue } : {});

    // Max video size: 50MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/quicktime'
        ];
        if (!validTypes.includes(file.type)) {
            toast.error(
                'Invalid video format. Please upload MP4, WebM, or OGG.'
            );
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Video size exceeds 50MB limit.');
            return;
        }

        const videoUrl = URL.createObjectURL(file);
        setLocalVideo({ file, url: videoUrl });
    };

    const handleRemoveVideo = () => {
        setLocalVideo({});
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) input.value = '';
    };

    // Notify parent of changes
    useEffect(() => {
        const value = localVideo.file ?? localVideo.url ?? undefined;
        onChange?.(value);
    }, [localVideo]);

    return (
        <div
            className={cn(
                'relative flex flex-col gap-3 rounded-lg border border-input p-4',
                className
            )}
        >
            {!localVideo.url ? (
                // Upload state
                <div
                    onClick={() => document.getElementById(inputId)?.click()}
                    className='flex w-full cursor-pointer items-center justify-center gap-4 rounded-lg border-2 border-dashed p-4 transition hover:bg-muted/20'
                >
                    <div className='grid size-10 place-items-center rounded-full bg-primary/10'>
                        <Video size={20} className='text-primary' />
                    </div>
                    <div className='flex flex-col'>
                        <span className='text-sm font-medium'>
                            Click to upload video
                        </span>
                        <span className='text-xs text-muted-foreground'>
                            Supported: .mp4, .webm, .ogg (max: 50MB)
                        </span>
                    </div>
                </div>
            ) : (
                // Preview state
                <div className='space-y-3'>
                    <video
                        src={localVideo.url}
                        controls
                        className='w-full rounded-md bg-black'
                        style={{ maxHeight: '200px' }}
                    />
                    <div className='flex items-center justify-between rounded-md bg-secondary p-3'>
                        <div className='flex items-center gap-2 overflow-hidden'>
                            <Video className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
                            <span className='truncate text-sm'>
                                {localVideo.file?.name || 'Existing video'}
                            </span>
                            {localVideo.file && (
                                <span className='text-xs text-muted-foreground'>
                                    (
                                    {(
                                        localVideo.file.size /
                                        1024 /
                                        1024
                                    ).toFixed(2)}{' '}
                                    MB)
                                </span>
                            )}
                        </div>
                        <Button
                            type='button'
                            size='icon'
                            variant='outline'
                            className='flex-shrink-0 hover:text-destructive'
                            onClick={handleRemoveVideo}
                        >
                            <XCircle size={16} />
                        </Button>
                    </div>
                </div>
            )}

            <Input
                id={inputId}
                type='file'
                className='hidden'
                accept='video/mp4,video/webm,video/ogg,video/quicktime'
                onChange={handleVideoUpload}
            />
        </div>
    );
};

// === Multiple Video Upload Component ===
type LocalVideo = {
    url: string;
    file?: File;
};

interface VideoUploadInputMultipleProps {
    inputId: string;
    defaultValue?: string[]; // existing video URLs
    onChange?: (videos: (string | File)[]) => void;
    className?: string;
}

export const VideoUploadInputMultiple = ({
    inputId,
    defaultValue = [],
    onChange,
    className
}: VideoUploadInputMultipleProps) => {
    const [localVideos, setLocalVideos] = useState<LocalVideo[]>(
        defaultValue?.map((url) => ({ url })) || []
    );

    // Track if component has initialized
    const isInitialized = useRef(false);

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    // Sync with defaultValue when it changes from API data
    useEffect(() => {
        if (!isInitialized.current && defaultValue.length > 0) {
            const defaultVideos = defaultValue.map((url) => ({ url }));
            setLocalVideos(defaultVideos);
            isInitialized.current = true;
        } else if (isInitialized.current && defaultValue.length > 0) {
            const defaultVideos = defaultValue.map((url) => ({ url }));
            setLocalVideos(defaultVideos);
        }
    }, [defaultValue]);

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const validFiles = files.filter((file) => {
            // Validate file type
            const validTypes = [
                'video/mp4',
                'video/webm',
                'video/ogg',
                'video/quicktime'
            ];
            if (!validTypes.includes(file.type)) {
                toast.error(`${file.name} is not a valid video format.`);
                return false;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} exceeds the 50MB limit.`);
                return false;
            }

            return true;
        });

        const newLocalVideos = validFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file)
        }));

        setLocalVideos((prev) => [...prev, ...newLocalVideos]);
    };

    const handleRemoveVideo = (index: number) => {
        setLocalVideos((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });

        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) input.value = '';
    };

    // Notify parent of changes
    useEffect(() => {
        const videos = localVideos.map((vid) => vid.file ?? vid.url);
        onChange?.(videos);
    }, [localVideos]);

    return (
        <div
            className={cn(
                'relative flex flex-col gap-4 rounded-lg border border-input p-4',
                className
            )}
        >
            {/* Upload Button */}
            <div
                onClick={() => document.getElementById(inputId)?.click()}
                className='flex w-full cursor-pointer items-center justify-center gap-4 rounded-lg border-2 border-dashed p-4 transition hover:bg-muted/20'
            >
                <div className='grid size-10 place-items-center rounded-full bg-primary/10'>
                    <Video size={20} className='text-primary' />
                </div>
                <div className='flex flex-col'>
                    <span className='text-sm font-medium'>
                        Click to upload videos
                    </span>
                    <span className='text-xs text-muted-foreground'>
                        Supported: .mp4, .webm, .ogg (max: 50MB each)
                    </span>
                </div>
            </div>

            {/* Video Previews */}
            {localVideos.length > 0 && (
                <div className='space-y-3'>
                    {localVideos.map((video, index) => (
                        <div key={index} className='space-y-2'>
                            <video
                                src={video.url}
                                controls
                                className='w-full rounded-md bg-black'
                                style={{ maxHeight: '200px' }}
                            />
                            <div className='flex items-center justify-between rounded-md bg-secondary p-3'>
                                <div className='flex items-center gap-2 overflow-hidden'>
                                    <Video className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
                                    <span className='truncate text-sm'>
                                        {video.file?.name ||
                                            `Video ${index + 1}`}
                                    </span>
                                    {video.file && (
                                        <span className='text-xs text-muted-foreground'>
                                            (
                                            {(
                                                video.file.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{' '}
                                            MB)
                                        </span>
                                    )}
                                </div>
                                <Button
                                    type='button'
                                    size='icon'
                                    variant='outline'
                                    className='flex-shrink-0 hover:text-destructive'
                                    onClick={() => handleRemoveVideo(index)}
                                >
                                    <XCircle size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Input
                id={inputId}
                type='file'
                className='hidden'
                accept='video/mp4,video/webm,video/ogg,video/quicktime'
                multiple
                onChange={handleVideoUpload}
            />
        </div>
    );
};
