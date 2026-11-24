'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { API_BASE_URL } from '@/configs/storefront';
import { Label } from '@/components/public/ui/label';
import { getMediaUrl } from '@/lib/get-media-url';

export default function ImageUploader({
    onUploadSuccess
}: {
    onUploadSuccess: (url: string) => void;
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview
        setPreview(URL.createObjectURL(file));
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Public, rate-limited backend endpoint for checkout screenshots
            // (no login needed; images only, max 5 MB).
            const res = await fetch(`${API_BASE_URL}/upload/payment-proof`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json().catch(() => null);
            const url: string | undefined = data?.data?.url;

            if (!res.ok || !url) {
                throw new Error(
                    data?.message || 'Upload failed. Please try again.'
                );
            }
            onUploadSuccess(url);
            toast.success('Screenshot uploaded successfully!');
        } catch (error) {
            toast.error(
                error instanceof Error && error.message
                    ? error.message
                    : 'Upload failed. Please try again.'
            );
            setPreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className='space-y-2'>
            <Label className='mb-2 block text-sm text-gray-600'>
                Screenshot *
            </Label>

            <div className='group relative flex h-31 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:bg-gray-100'>
                {preview ? (
                    <>
                        <Image
                            src={getMediaUrl(preview)}
                            alt='Preview'
                            className='h-full w-full object-cover'
                            width={500}
                            height={500}
                        />
                        <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                            <button
                                onClick={() => setPreview(null)}
                                className='rounded-full bg-red-500 p-2 text-white'
                            >
                                <X className='h-4 w-4' />
                            </button>
                        </div>
                    </>
                ) : (
                    <label className='flex cursor-pointer flex-col items-center gap-2'>
                        {isUploading ? (
                            <Loader2 className='text-primary-ink h-6 w-6 animate-spin' />
                        ) : (
                            <>
                                <Upload className='h-6 w-6 text-gray-600' />
                                <span className='text-center text-xs text-gray-600'>
                                    Click to
                                </span>
                                <span className='-mt-2 text-center text-xs text-gray-600'>
                                    Upload image
                                </span>
                            </>
                        )}
                        <input
                            type='file'
                            className='hidden'
                            accept='image/*'
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}
