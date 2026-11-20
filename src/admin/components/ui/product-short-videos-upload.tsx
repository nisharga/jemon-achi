/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader, Sparkles, Video, XCircle } from 'lucide-react';
import { Button } from '@/admin/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import { cn } from '@/admin/lib/utils';
import { useUploadVideoToAWSMutation } from '@/admin/redux/api-queries/file-upload-api';
import { TProductShortVideo } from '@/admin/types/product';
import { getMediaUrl } from '@/admin/utils/get-media-url';

// Max video size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;
const VALID_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

type LocalShortVideo = TProductShortVideo & {
    _id: string; // stable client-side id
    _status: 'uploading' | 'done' | 'error';
    _localUrl?: string; // object url for live preview while uploading
};

const makeId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Reduce a width/height pair to a simple aspect ratio string like "9:16"
const computeRatio = (width: number, height: number): string => {
    if (!width || !height) return '';
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height) || 1;
    return `${width / divisor}:${height / divisor}`;
};

// Read aspect ratio + duration from a video file (client-side, no upload)
const readVideoMeta = (
    file: File
): Promise<{ ratio: string; duration: number }> => {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        const cleanup = () => URL.revokeObjectURL(url);
        video.onloadedmetadata = () => {
            const ratio = computeRatio(video.videoWidth, video.videoHeight);
            const duration = Math.round(video.duration || 0);
            cleanup();
            resolve({ ratio, duration });
        };
        video.onerror = () => {
            cleanup();
            resolve({ ratio: '', duration: 0 });
        };
        video.src = url;
    });
};

const getFormat = (file: File): string => {
    // Prefer the mime subtype, fall back to file extension
    const sub = file.type?.split('/')?.[1];
    if (sub) return sub === 'quicktime' ? 'mov' : sub;
    const ext = file.name?.split('.')?.pop()?.toLowerCase();
    return ext || '';
};

interface ProductShortVideosUploadProps {
    inputId: string;
    defaultValue?: TProductShortVideo[];
    onChange?: (videos: TProductShortVideo[]) => void;
    className?: string;
}

export const ProductShortVideosUpload = ({
    inputId,
    defaultValue = [],
    onChange,
    className
}: ProductShortVideosUploadProps) => {
    const [videos, setVideos] = useState<LocalShortVideo[]>([]);
    const [uploadVideoToAWS] = useUploadVideoToAWSMutation();
    const isInitialized = useRef(false);

    // Initialize from existing product videos (update flow)
    useEffect(() => {
        if (!isInitialized.current && defaultValue.length > 0) {
            setVideos(
                defaultValue.map((v) => ({
                    ...v,
                    _id: makeId(),
                    _status: 'done'
                }))
            );
            isInitialized.current = true;
        }
    }, [defaultValue]);

    // Emit only successfully uploaded videos with clean fields
    useEffect(() => {
        const cleaned: TProductShortVideo[] = videos
            .filter((v) => v._status === 'done' && v.url)
            .map(
                ({ url, format, ratio, size, thumbnail, title, duration }) => ({
                    url,
                    format,
                    ratio,
                    size,
                    thumbnail,
                    title,
                    duration
                })
            );
        onChange?.(cleaned);
    }, [videos]);

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const validFiles = files.filter((file) => {
            if (!VALID_TYPES.includes(file.type)) {
                toast.error(`${file.name} is not a valid video format.`);
                return false;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} exceeds the 500MB limit.`);
                return false;
            }
            return true;
        });

        // Reset input so the same file can be re-selected later
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) input.value = '';

        for (const file of validFiles) {
            const id = makeId();
            const localUrl = URL.createObjectURL(file);
            const meta = await readVideoMeta(file);
            const placeholder: LocalShortVideo = {
                _id: id,
                url: '',
                format: getFormat(file),
                ratio: meta.ratio,
                size: file.size,
                duration: meta.duration,
                title: '',
                _status: 'uploading',
                _localUrl: localUrl
            };

            setVideos((prev) => [...prev, placeholder]);

            try {
                const res: any = await uploadVideoToAWS(file);
                const key = res?.data?.data?.url;
                if (res?.data?.success && key) {
                    setVideos((prev) =>
                        prev.map((v) =>
                            v._id === id
                                ? { ...v, url: key, _status: 'done' }
                                : v
                        )
                    );
                } else {
                    setVideos((prev) =>
                        prev.map((v) =>
                            v._id === id ? { ...v, _status: 'error' } : v
                        )
                    );
                    toast.error(`Failed to upload ${file.name}.`);
                }
            } catch (err) {
                setVideos((prev) =>
                    prev.map((v) =>
                        v._id === id ? { ...v, _status: 'error' } : v
                    )
                );
                toast.error(`Something went wrong uploading ${file.name}.`);
                console.log(err);
            }
        }
    };

    const handleRemove = (id: string) => {
        setVideos((prev) => prev.filter((v) => v._id !== id));
    };

    const handleTitleChange = (id: string, title: string) => {
        setVideos((prev) =>
            prev.map((v) => (v._id === id ? { ...v, title } : v))
        );
    };

    return (
        <div
            className={cn(
                'relative flex flex-col gap-4 rounded-lg border border-input p-4',
                className
            )}
        >
            {/* Upload button */}
            <div
                onClick={() => document.getElementById(inputId)?.click()}
                className='flex w-full cursor-pointer items-center justify-center gap-4 rounded-lg border-2 border-dashed p-4 transition hover:bg-muted/20'
            >
                <div className='grid size-10 place-items-center rounded-full bg-primary/10'>
                    <Sparkles size={20} className='text-primary' />
                </div>
                <div className='flex flex-col'>
                    <span className='text-sm font-medium'>
                        Click to upload short videos (Story / Reels)
                    </span>
                    <span className='text-xs text-muted-foreground'>
                        Portrait 9:16 recommended • .mp4, .webm, .ogg, .mov (max
                        500MB each)
                    </span>
                </div>
            </div>

            {/* Previews */}
            {videos.length > 0 && (
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
                    {videos.map((video) => {
                        const previewSrc =
                            video._localUrl ??
                            (video.url ? getMediaUrl(video.url) : '');
                        return (
                            <div
                                key={video._id}
                                className='relative flex flex-col gap-2 rounded-lg border bg-secondary/40 p-2'
                            >
                                <div className='relative aspect-[9/16] w-full overflow-hidden rounded-md bg-black'>
                                    {previewSrc ? (
                                        <video
                                            src={previewSrc}
                                            muted
                                            playsInline
                                            className='h-full w-full object-cover'
                                        />
                                    ) : (
                                        <div className='grid h-full w-full place-items-center'>
                                            <Video
                                                className='text-white/50'
                                                size={24}
                                            />
                                        </div>
                                    )}

                                    {/* Status overlay */}
                                    {video._status === 'uploading' && (
                                        <div className='absolute inset-0 grid place-items-center bg-black/50'>
                                            <Loader
                                                className='animate-spin text-white'
                                                size={20}
                                            />
                                        </div>
                                    )}
                                    {video._status === 'error' && (
                                        <div className='absolute inset-0 grid place-items-center bg-destructive/60'>
                                            <span className='text-[10px] font-medium text-white'>
                                                Upload failed
                                            </span>
                                        </div>
                                    )}

                                    {/* Remove */}
                                    <Button
                                        type='button'
                                        size='icon'
                                        variant='outline'
                                        className='absolute top-1 right-1 size-6 hover:text-destructive'
                                        onClick={() => handleRemove(video._id)}
                                    >
                                        <XCircle size={14} />
                                    </Button>

                                    {/* Meta badges */}
                                    <div className='absolute bottom-1 left-1 flex flex-wrap gap-1'>
                                        {video.ratio && (
                                            <span className='rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white'>
                                                {video.ratio}
                                            </span>
                                        )}
                                        {typeof video.size === 'number' && (
                                            <span className='rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white'>
                                                {(
                                                    video.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(1)}
                                                MB
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Input
                                    placeholder='Caption (optional)'
                                    value={video.title ?? ''}
                                    onChange={(e) =>
                                        handleTitleChange(
                                            video._id,
                                            e.target.value
                                        )
                                    }
                                    className='h-7 text-xs'
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            <Input
                id={inputId}
                type='file'
                className='hidden'
                accept='video/mp4,video/webm,video/ogg,video/quicktime'
                multiple
                onChange={handleSelect}
            />
        </div>
    );
};
