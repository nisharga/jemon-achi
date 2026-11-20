/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { Button } from '@/admin/components/ui/button';
import { Download } from 'lucide-react';
import { useBarcode } from 'next-barcode';

export const BarcodeImage = ({ barcode }: { barcode: string }) => {
    const { inputRef } = useBarcode({
        value: barcode,
        options: {
            width: 2
        }
    });

    const handleDownload = () => {
        const img = inputRef.current;
        if (!img) return;

        // Create a temporary <a> element
        const link = document.createElement('a');
        link.href = img.src;
        link.download = `${barcode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className='flex w-fit max-w-20 items-end gap-2'>
            <img ref={inputRef} className='w-fit object-contain' />
            <Button
                size='icon'
                variant='outline'
                onClick={handleDownload}
                className="size-6 [&_svg:not([class*='size-'])]:size-3.5"
            >
                <Download />
            </Button>
        </div>
    );
};
