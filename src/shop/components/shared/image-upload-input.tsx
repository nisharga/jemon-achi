'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Plus, XCircle } from 'lucide-react';
import { Button } from '@/shop/components/ui/button';
import { Input } from '@/shop/components/ui/input';
import { cn } from '@/shop/lib/utils';
import { getMediaUrl } from '@/shop/lib/get-media-url';

type UploadMode = 'single' | 'multiple';

type LocalImg = {
    url: string;
    file?: File; // optional for existing URLs
};

interface ImageUploadInputProps {
    mode?: UploadMode;
    inputId: string;
    defaultValue?: string[]; // existing image URLs
    onChange?: (images: (File | string)[]) => void;
    className?: string;
    imgClass?: string;
}

export const ImageUploadInput = ({
    mode = 'single',
    inputId,
    defaultValue = [],
    onChange,
    className,
    imgClass
}: ImageUploadInputProps) => {
    const [localImgs, setLocalImgs] = useState<LocalImg[]>(
        defaultValue?.map((url) => ({ url }))
    );

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const validFiles = files.filter((file) => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} exceeds the 5MB limit.`);
                return false;
            }
            return true;
        });

        const newLocalImgs = validFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file)
        }));

        setLocalImgs((prev) =>
            mode === 'multiple' ? [...prev, ...newLocalImgs] : newLocalImgs
        );
    };

    const handleRemoveLocalFile = (index: number) => {
        setLocalImgs((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });

        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) input.value = '';
    };

    useEffect(() => {
        const value =
            mode === 'single'
                ? localImgs[0]
                    ? (localImgs[0].file ?? localImgs[0].url)
                    : ''
                : localImgs.map((img) => img.file ?? img.url);

        onChange?.(Array.isArray(value) ? value : [value]);
    }, [localImgs, mode, onChange]);

    return (
        <div
            className={cn(
                'relative flex flex-col gap-4 rounded-lg border border-input p-4',
                className
            )}
        >
            <div
                onClick={() => document.getElementById(inputId)?.click()}
                className='flex w-full cursor-pointer items-center justify-center gap-4'
            >
                <div className='grid size-10 place-items-center rounded-md bg-slate-100'>
                    <Plus size={16} />
                </div>
                <div className='flex flex-col'>
                    <span className='text-sm font-medium'>Click to upload</span>
                    <span className='text-xs text-muted-foreground'>
                        Supported: .png, .jpg, .svg, .webp .jpeg (max: 5MB)
                    </span>
                </div>
            </div>

            {localImgs?.length > 0 && (
                <div className='flex w-full gap-4'>
                    {localImgs?.map((img, index) => (
                        <div
                            key={index}
                            className='flex items-center justify-between gap-4 rounded-md bg-secondary p-2'
                        >
                            <Image
                                src={getMediaUrl(img?.url)}
                                alt='Uploaded'
                                width={500}
                                height={500}
                                className={cn(
                                    'size-12 h-[100px] w-auto rounded-md',
                                    imgClass
                                )}
                            />
                            <Button
                                type='button'
                                size='icon'
                                variant='outline'
                                className='hover:text-destructive'
                                onClick={() => handleRemoveLocalFile(index)}
                            >
                                <XCircle />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Input
                id={inputId}
                type='file'
                className='hidden'
                // accept=".png,.jpg,.jpeg"
                accept='image/webp,image/jpeg,image/png, image/jpg'
                multiple={mode === 'multiple'}
                onChange={handleImageUpload}
            />
        </div>
    );
};
