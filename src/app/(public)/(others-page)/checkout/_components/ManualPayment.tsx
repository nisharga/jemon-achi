'use client';

import { useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/public/ui/card';
import { Input } from '@/components/public/ui/input';
import { Label } from '@/components/public/ui/label';
import { Info, ShieldCheck } from 'lucide-react';
import { BKASH_NUMBER, NAGAD_NUMBER } from '@/configs/storefront';
import { CopyableText } from './CopyableText';
import ImageUploader from './ImageUploader';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/public/ui/select';
import ManualPaymentLabel from '@/components/public/common/ManualPaymentLabel';

export type ManualPaymentFields = {
    senderPhone: string;
    trxId: string;
    amount: number;
    payment_method: string;
};

type Mode = 'cod' | 'full' | 'delivery_charge';

type Props = {
    mode: Mode;
    amountNow: number;
    fields: ManualPaymentFields;
    onChange: (patch: Partial<ManualPaymentFields>) => void;
    payToNumber?: string;
    instructionImageSrc?: string;
    setUploadedFiles: any;
};

export default function ManualPayment({
    mode,
    amountNow,
    fields,
    onChange,
    setUploadedFiles
}: Props) {
    // lock the amount box to expected value
    useEffect(() => {
        if (fields.amount !== amountNow) onChange({ amount: amountNow });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amountNow]);

    return (
        <Card className='overflow-hidden rounded-xl border-0 shadow-none'>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <CardTitle className='base-medium'>
                        Manual Payment
                    </CardTitle>
                    <ShieldCheck className='h-5 w-5 text-emerald-600' />
                </div>
            </CardHeader>

            <CardContent className='sm:space-y-4'>
                <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900'>
                    <div className='flex items-start gap-2'>
                        <div className='leading-relaxed'>
                            {mode === 'cod' ? (
                                <ManualPaymentLabel
                                    title='No advance payment is required
'
                                    content='To confirm your Cash On Delivery order.'
                                    // amount={0}
                                />
                            ) : mode === 'delivery_charge' ? (
                                <ManualPaymentLabel
                                    title='Delivery Charge Payment:'
                                    content='Please pay the delivery charge to proceed with your order.'
                                    amount={amountNow}
                                />
                            ) : (
                                <ManualPaymentLabel
                                    title='Secure Your Order:'
                                    content='Complete the full payment below to confirm your purchase and begin processing.'
                                    amount={amountNow}
                                />
                            )}

                            <CopyableText
                                text={BKASH_NUMBER}
                                label='bKash'
                                className='pb-1'
                            />
                            <CopyableText
                                text={NAGAD_NUMBER}
                                label='Nagad'
                                className='pb-2'
                            />
                            <span className='sm-normal'>
                                To verify your payment, please transfer the
                                amount to the designated account. After the
                                transfer, ensure you provide your Transaction ID
                                and screenshot in the fields below for rapid
                                processing
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export const PaymentDetails = ({ fields, onChange, setUploadedFiles }: any) => {
    return (
        <div className='grid grid-cols-12 gap-4'>
            {/* select -type */}
            <div className='col-span-12'>
                <div>
                    <Label className='mb-2 block text-sm text-gray-600'>
                        Select Payment Method *
                    </Label>

                    <Select
                        value={fields.payment_method}
                        onValueChange={(val) =>
                            onChange({ payment_method: val })
                        }
                    >
                        <SelectTrigger className='w-full rounded-lg border-gray-200 py-5 text-sm focus:ring-[#ff5c00]'>
                            <SelectValue placeholder='Choose Method' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='BKASH'>bKash</SelectItem>
                            <SelectItem value='NAGAD'>Nagad</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='col-span-4'>
                <ImageUploader
                    onUploadSuccess={(url) => setUploadedFiles([url])}
                />
            </div>
            <div className='col-span-8 gap-4'>
                <div className='pb-4'>
                    <Label className='mb-2 block text-sm text-gray-600'>
                        Your {fields.payment_method} Number / Last 4 digits
                    </Label>
                    <Input
                        inputMode='numeric'
                        pattern='[0-9]*'
                        className='rounded-lg py-5 text-sm placeholder:text-sm focus-visible:ring-[#ff5c00]'
                        placeholder='01XXXXXXXXX'
                        value={fields.senderPhone}
                        onChange={(e) =>
                            onChange({ senderPhone: e.target.value })
                        }
                        required
                    />
                </div>

                <div className='md:col-span-2'>
                    <Label className='mb-2 block text-sm text-gray-600'>
                        Transaction ID (Optional)
                    </Label>
                    <Input
                        className='rounded-lg py-5 text-sm placeholder:text-sm focus-visible:ring-[#ff5c00]'
                        placeholder='e.g., 7ABC1D2E3'
                        value={fields.trxId}
                        onChange={(e) => onChange({ trxId: e.target.value })}
                        required
                    />
                </div>
            </div>
        </div>
    );
};
