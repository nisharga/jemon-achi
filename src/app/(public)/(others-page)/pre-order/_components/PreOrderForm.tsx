'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    Loader2,
    X,
    CheckCircle2,
    Minus,
    Plus,
    Link2,
    ImagePlus,
    User,
    MapPin,
    ShoppingBag,
    Ship,
    Truck,
    Trash2,
    Info,
    Package
} from 'lucide-react';

import { Input } from '@/shop/components/ui/input';
import { Label } from '@/shop/components/ui/label';
import { Button } from '@/shop/components/ui/button';
import { Textarea } from '@/shop/components/ui/textarea';
import { Container } from '@/shop/components/common/container';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { API_BASE_URL } from '@/shop/config';
import { cn } from '@/shop/lib/utils';
import { useCreatePreOrderMutation } from '@/shop/redux/api/pre-order';

const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6 MB
const MAX_IMAGES = 6;

// Shared presentation helpers (styling only)
const cardClass = 'rounded-2xl border bg-white p-4 shadow-sm sm:p-6';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
const focusClass =
    'focus-visible:border-[#ff5c00] focus-visible:ring-2 focus-visible:ring-[#ff5c00]/20';
const inputClass = cn('h-11', focusClass);

type Prefill = {
    productId?: string;
    productName?: string;
    productImage?: string;
    unitPrice?: string;
};

type CreatedResult = {
    invoice_number: string;
    pre_order_serial_id: number;
};

// One customer-described (EXTERNAL) product entry
type ExternalItem = {
    id: string;
    name: string;
    link: string;
    color: string;
    size: string;
    notes: string;
    images: string[];
    quantity: number;
};

const makeExternalItem = (): ExternalItem => ({
    id: Math.random().toString(36).slice(2),
    name: '',
    link: '',
    color: '',
    size: '',
    notes: '',
    images: [],
    quantity: 1
});

function QtyStepper({
    value,
    onChange
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className='inline-flex h-11 items-center overflow-hidden rounded-lg border bg-white'>
            <button
                type='button'
                onClick={() => onChange(Math.max(1, value - 1))}
                disabled={value <= 1}
                aria-label='Decrease quantity'
                className='hover:text-primary-ink flex h-full w-11 items-center justify-center text-gray-600 transition disabled:opacity-40'
            >
                <Minus className='h-4 w-4' />
            </button>
            <input
                type='number'
                min={1}
                value={value}
                onChange={(e) =>
                    onChange(Math.max(1, Number(e.target.value) || 1))
                }
                className='h-full w-14 [appearance:textfield] border-x text-center text-sm outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            />
            <button
                type='button'
                onClick={() => onChange(value + 1)}
                aria-label='Increase quantity'
                className='hover:text-primary-ink flex h-full w-11 items-center justify-center text-gray-600 transition'
            >
                <Plus className='h-4 w-4' />
            </button>
        </div>
    );
}

function SectionTitle({
    icon: Icon,
    title,
    hint
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    hint?: string;
}) {
    return (
        <div className='mb-4 flex items-center gap-3'>
            <span className='text-primary-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ff5c00]/10'>
                <Icon className='h-5 w-5' />
            </span>
            <div className='min-w-0'>
                <h2 className='leading-tight font-semibold'>{title}</h2>
                {hint && <p className='text-xs text-gray-600'>{hint}</p>}
            </div>
        </div>
    );
}

export default function PreOrderForm({ prefill }: { prefill?: Prefill }) {
    const isListed = !!prefill?.productId;

    // Listed (prefill) product quantity — only used when arriving from a product page
    const [listedQty, setListedQty] = useState(1);

    // EXTERNAL product entries. Start with one when not prefilled.
    const [externalItems, setExternalItems] = useState<ExternalItem[]>(
        isListed ? [] : [makeExternalItem()]
    );
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    // Common
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [secondaryPhone, setSecondaryPhone] = useState('');
    const [email, setEmail] = useState('');
    const [division, setDivision] = useState('');
    const [district, setDistrict] = useState('');
    const [thana, setThana] = useState('');
    const [address, setAddress] = useState('');
    const [note, setNote] = useState('');

    const [created, setCreated] = useState<CreatedResult | null>(null);
    const [createPreOrder, { isLoading }] = useCreatePreOrderMutation();

    const patchItem = (id: string, patch: Partial<ExternalItem>) =>
        setExternalItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
        );
    const removeItem = (id: string) =>
        setExternalItems((prev) => prev.filter((it) => it.id !== id));

    const handleFiles = async (
        e: React.ChangeEvent<HTMLInputElement>,
        item: ExternalItem
    ) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (!files.length) return;
        if (item.images.length + files.length > MAX_IMAGES) {
            toast.error(
                `You can upload up to ${MAX_IMAGES} images per product`
            );
            return;
        }
        setUploadingId(item.id);
        try {
            const uploaded: string[] = [];
            for (const file of files) {
                if (file.size > MAX_IMAGE_SIZE) {
                    toast.error(`${file.name} exceeds the 6MB limit`);
                    continue;
                }
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch(
                    `${API_BASE_URL}/pre-order/upload-image`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );
                const data = await res.json();
                if (res.ok && data?.data?.url) {
                    uploaded.push(data.data.url);
                } else {
                    toast.error(
                        data?.message || `Failed to upload ${file.name}`
                    );
                }
            }
            if (uploaded.length)
                patchItem(item.id, { images: [...item.images, ...uploaded] });
        } catch {
            toast.error('Image upload failed');
        } finally {
            setUploadingId(null);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) return toast.error('Please enter your name');
        if (!/^01[0-9]{9}$/.test(phone))
            return toast.error(
                'Please enter a valid phone number (01XXXXXXXXX)'
            );
        if (!address.trim()) return toast.error('Please enter your address');

        // Build the items[] array (listed prefill first, then external entries)
        const items: Record<string, unknown>[] = [];

        if (isListed) {
            items.push({
                source_type: 'LISTED',
                product: prefill?.productId,
                product_name: prefill?.productName,
                product_image: prefill?.productImage,
                unit_price: prefill?.unitPrice
                    ? Number(prefill.unitPrice)
                    : undefined,
                quantity: listedQty
            });
        }

        for (const it of externalItems) {
            if (!it.name.trim()) {
                return toast.error(
                    'Please enter the product name for every item'
                );
            }
            items.push({
                source_type: 'EXTERNAL',
                reference: {
                    product_name: it.name.trim(),
                    product_link: it.link.trim() || undefined,
                    images: it.images,
                    color: it.color.trim() || undefined,
                    size: it.size.trim() || undefined,
                    notes: it.notes.trim() || undefined
                },
                quantity: it.quantity
            });
        }

        if (items.length === 0) {
            return toast.error('Please add at least one product');
        }

        const payload: Record<string, unknown> = {
            items,
            customer_name: name.trim(),
            customer_phone: phone.trim(),
            customer_secondary_phone: secondaryPhone.trim() || undefined,
            customer_email: email.trim() || undefined,
            delivery_address: {
                division: division.trim() || undefined,
                district: district.trim() || undefined,
                thana: thana.trim() || undefined,
                address: address.trim()
            },
            customer_note: note.trim() || undefined
        };

        try {
            const res = await createPreOrder({ payload }).unwrap();
            if (res?.success) {
                setCreated(res.data);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(res?.message || 'Failed to submit pre-order');
            }
        } catch (err: unknown) {
            const message =
                (err as { data?: { message?: string } })?.data?.message ||
                'Something went wrong. Please try again.';
            toast.error(message);
        }
    };

    // ---------------------------------------------------------------- Success
    if (created) {
        const nextSteps = [
            {
                icon: CheckCircle2,
                title: 'Request received',
                desc: "We've logged your pre-order."
            },
            {
                icon: ShoppingBag,
                title: "We'll send a quote",
                desc: 'Our team reviews & prices it.'
            },
            {
                icon: Truck,
                title: 'Sourced & delivered',
                desc: 'China → Bangladesh → you.'
            }
        ];

        return (
            <div className='min-h-screen'>
                <Container className='py-6 pb-28 sm:py-10 lg:pb-16'>
                    <div className='mx-auto max-w-xl'>
                        <div className='rounded-2xl border bg-white p-6 text-center shadow-sm sm:p-10'>
                            <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50'>
                                <CheckCircle2 className='h-9 w-9 text-emerald-500' />
                            </div>
                            <h1 className='text-xl font-bold sm:text-2xl'>
                                Pre-Order Submitted!
                            </h1>
                            <p className='mx-auto mt-2 max-w-md text-sm text-gray-600'>
                                We&apos;ve sent a confirmation SMS to your
                                phone. Our team will contact you shortly with
                                pricing and next steps.
                            </p>

                            <div className='mx-auto mt-5 flex max-w-xs items-center justify-between gap-3 rounded-xl border bg-gray-50 px-4 py-3'>
                                <span className='text-xs font-medium tracking-wide text-gray-600 uppercase'>
                                    Pre-Order ID
                                </span>
                                <span className='text-primary-ink font-semibold'>
                                    {created.invoice_number}
                                </span>
                            </div>

                            <div className='mt-7 grid gap-3 text-left sm:grid-cols-3'>
                                {nextSteps.map((s) => (
                                    <div
                                        key={s.title}
                                        className='rounded-xl border bg-gray-50/60 p-3'
                                    >
                                        <s.icon className='text-primary-ink mb-2 h-5 w-5' />
                                        <p className='text-sm font-medium'>
                                            {s.title}
                                        </p>
                                        <p className='mt-0.5 text-xs text-gray-600'>
                                            {s.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className='mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center'>
                                <Link
                                    href={`/track?type=pre-order&id=${created.pre_order_serial_id}`}
                                    className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5c00] px-5 py-3 font-medium text-white transition-colors hover:bg-[#e65200] sm:w-auto'
                                >
                                    <Truck className='h-4 w-4' /> Track
                                    Pre-Order
                                </Link>
                                <Link
                                    href='/'
                                    className='inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto'
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    // reactive summary preview values
    const totalItems = (isListed ? 1 : 0) + externalItems.length;
    const totalQty =
        (isListed ? listedQty : 0) +
        externalItems.reduce((s, it) => s + (it.quantity || 0), 0);
    const summaryImage = isListed
        ? prefill?.productImage
        : externalItems[0]?.images[0];
    const summaryName = isListed
        ? prefill?.productName
        : externalItems[0]?.name.trim() || 'Your pre-order item';

    const howItWorks = [
        { icon: Package, label: 'You request the product' },
        { icon: Ship, label: 'We source it China → BD' },
        { icon: Truck, label: 'Delivered to your door' }
    ];

    const submitButton = (
        <Button
            onClick={handleSubmit}
            disabled={isLoading || !!uploadingId}
            className='h-12 w-full rounded-xl bg-[#ff5c00] text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#e65200]'
        >
            {isLoading ? (
                <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />{' '}
                    Submitting...
                </>
            ) : (
                'Submit Pre-Order Request'
            )}
        </Button>
    );

    // ------------------------------------------------------------------- Form
    return (
        <div className='min-h-screen'>
            <Container className='py-4 pb-28 sm:py-8 lg:pb-12'>
                {/* Hero header */}
                <header className='mb-4 overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm sm:mb-6 sm:p-8'>
                    <div className='mb-3'>
                        <h1 className='text-center text-xl font-bold sm:text-2xl'>
                            Place a Pre-Order
                        </h1>
                    </div>
                    <div className={cardClass}>
                        <ol className='space-y-3'>
                            {howItWorks.map((s, i) => (
                                <li
                                    key={s.label}
                                    className='flex items-center gap-3'
                                >
                                    <span className='text-primary-ink relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff5c00]/10'>
                                        <s.icon className='h-4 w-4' />
                                        <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5c00] text-[10px] font-bold text-white'>
                                            {i + 1}
                                        </span>
                                    </span>
                                    <span className='text-sm text-gray-700'>
                                        {s.label}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </header>

                <div className='grid gap-4 sm:gap-6 lg:grid-cols-3 lg:items-start'>
                    {/* LEFT: form */}
                    <div className='space-y-4 sm:space-y-6 lg:col-span-2'>
                        {/* Products */}
                        <section className={cardClass}>
                            <SectionTitle
                                icon={ShoppingBag}
                                title='Product Details'
                                hint='Add one or more products you want us to source'
                            />

                            {/* Listed (prefilled) product */}
                            {isListed && (
                                <div className='mb-4 rounded-xl border bg-gray-50 p-3'>
                                    <div className='flex items-center gap-3'>
                                        {prefill?.productImage && (
                                            <Image
                                                src={getMediaUrl(
                                                    prefill.productImage
                                                )}
                                                alt={
                                                    prefill?.productName ||
                                                    'product'
                                                }
                                                width={64}
                                                height={64}
                                                className='h-16 w-16 shrink-0 rounded-lg border object-cover'
                                            />
                                        )}
                                        <div className='min-w-0 flex-1'>
                                            <p className='truncate font-medium'>
                                                {prefill?.productName}
                                            </p>
                                            {prefill?.unitPrice && (
                                                <p className='mt-0.5 text-sm text-gray-600'>
                                                    Price: ৳{prefill.unitPrice}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <Label className={labelClass}>
                                            Quantity
                                        </Label>
                                        <QtyStepper
                                            value={listedQty}
                                            onChange={setListedQty}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* External items */}
                            <div className='space-y-4'>
                                {externalItems.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className='rounded-xl border p-3 sm:p-4'
                                    >
                                        <div className='mb-3 flex items-center justify-between'>
                                            <p className='text-sm font-semibold text-gray-700'>
                                                {isListed
                                                    ? 'Additional product'
                                                    : 'Product'}{' '}
                                                #{idx + 1}
                                            </p>
                                            {(externalItems.length > 1 ||
                                                isListed) && (
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    aria-label='Remove product'
                                                    className='inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600'
                                                >
                                                    <Trash2 className='h-3.5 w-3.5' />{' '}
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                            <div className='sm:col-span-2'>
                                                <Label className={labelClass}>
                                                    Product Name *
                                                </Label>
                                                <Input
                                                    className={inputClass}
                                                    value={item.name}
                                                    onChange={(e) =>
                                                        patchItem(item.id, {
                                                            name: e.target.value
                                                        })
                                                    }
                                                    placeholder='e.g. Nike Air Max 90'
                                                />
                                            </div>
                                            <div className='sm:col-span-2'>
                                                <Label className={labelClass}>
                                                    Product Link
                                                </Label>
                                                <div className='relative'>
                                                    <Link2 className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-600' />
                                                    <Input
                                                        className={cn(
                                                            inputClass,
                                                            'pl-9'
                                                        )}
                                                        value={item.link}
                                                        onChange={(e) =>
                                                            patchItem(item.id, {
                                                                link: e.target
                                                                    .value
                                                            })
                                                        }
                                                        placeholder='Paste the product URL'
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className={labelClass}>
                                                    Color
                                                </Label>
                                                <Input
                                                    className={inputClass}
                                                    value={item.color}
                                                    onChange={(e) =>
                                                        patchItem(item.id, {
                                                            color: e.target
                                                                .value
                                                        })
                                                    }
                                                    placeholder='e.g. Black'
                                                />
                                            </div>
                                            <div>
                                                <Label className={labelClass}>
                                                    Size
                                                </Label>
                                                <Input
                                                    className={inputClass}
                                                    value={item.size}
                                                    onChange={(e) =>
                                                        patchItem(item.id, {
                                                            size: e.target.value
                                                        })
                                                    }
                                                    placeholder='e.g. 42 / M'
                                                />
                                            </div>
                                        </div>

                                        {/* images */}
                                        <div className='mt-4'>
                                            <Label className={labelClass}>
                                                Reference Images{' '}
                                                <span className='font-normal text-gray-600'>
                                                    (up to {MAX_IMAGES}, max 6MB
                                                    each)
                                                </span>
                                            </Label>
                                            <div className='flex flex-wrap gap-2.5'>
                                                {item.images.map((key, i) => (
                                                    <div
                                                        key={i}
                                                        className='group relative h-20 w-20 overflow-hidden rounded-lg border sm:h-24 sm:w-24'
                                                    >
                                                        <Image
                                                            src={getMediaUrl(
                                                                key
                                                            )}
                                                            alt='reference'
                                                            width={96}
                                                            height={96}
                                                            className='h-full w-full object-cover'
                                                        />
                                                        <button
                                                            type='button'
                                                            onClick={() =>
                                                                patchItem(
                                                                    item.id,
                                                                    {
                                                                        images: item.images.filter(
                                                                            (
                                                                                _,
                                                                                ix
                                                                            ) =>
                                                                                ix !==
                                                                                i
                                                                        )
                                                                    }
                                                                )
                                                            }
                                                            aria-label='Remove image'
                                                            className='absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-100 transition hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100'
                                                        >
                                                            <X className='h-3 w-3' />
                                                        </button>
                                                    </div>
                                                ))}
                                                {item.images.length <
                                                    MAX_IMAGES && (
                                                    <label className='hover:text-primary-ink flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 transition hover:border-[#ff5c00] sm:h-24 sm:w-24'>
                                                        {uploadingId ===
                                                        item.id ? (
                                                            <Loader2 className='text-primary-ink h-5 w-5 animate-spin' />
                                                        ) : (
                                                            <>
                                                                <ImagePlus className='h-5 w-5' />
                                                                <span className='text-[10px] font-medium'>
                                                                    Add
                                                                </span>
                                                            </>
                                                        )}
                                                        <input
                                                            type='file'
                                                            accept='image/*'
                                                            multiple
                                                            className='hidden'
                                                            onChange={(e) =>
                                                                handleFiles(
                                                                    e,
                                                                    item
                                                                )
                                                            }
                                                            disabled={
                                                                uploadingId ===
                                                                item.id
                                                            }
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                            <div>
                                                <Label className={labelClass}>
                                                    Notes
                                                </Label>
                                                <Textarea
                                                    className={focusClass}
                                                    value={item.notes}
                                                    onChange={(e) =>
                                                        patchItem(item.id, {
                                                            notes: e.target
                                                                .value
                                                        })
                                                    }
                                                    rows={2}
                                                    placeholder='Any specific details (variant, brand, etc.)'
                                                />
                                            </div>
                                            <div>
                                                <Label className={labelClass}>
                                                    Quantity
                                                </Label>
                                                <QtyStepper
                                                    value={item.quantity}
                                                    onChange={(v) =>
                                                        patchItem(item.id, {
                                                            quantity: v
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type='button'
                                onClick={() =>
                                    setExternalItems((prev) => [
                                        ...prev,
                                        makeExternalItem()
                                    ])
                                }
                                className='text-primary-ink mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[#ff5c00] px-4 py-2.5 text-sm font-medium transition'
                            >
                                <Plus className='h-4 w-4' /> Add Another Product
                            </button>
                        </section>

                        {/* Contact + address */}
                        <section className={cardClass}>
                            <SectionTitle
                                icon={User}
                                title='Your Details'
                                hint='Where should we reach you and deliver?'
                            />

                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                <div>
                                    <Label className={labelClass}>
                                        Full Name *
                                    </Label>
                                    <Input
                                        className={inputClass}
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder='Your full name'
                                    />
                                </div>
                                <div>
                                    <Label className={labelClass}>
                                        Phone *
                                    </Label>
                                    <Input
                                        className={inputClass}
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder='01XXXXXXXXX'
                                        inputMode='numeric'
                                    />
                                </div>
                                <div>
                                    <Label className={labelClass}>
                                        Secondary Phone
                                    </Label>
                                    <Input
                                        className={inputClass}
                                        value={secondaryPhone}
                                        onChange={(e) =>
                                            setSecondaryPhone(e.target.value)
                                        }
                                        placeholder='Optional'
                                        inputMode='numeric'
                                    />
                                </div>
                                <div>
                                    <Label className={labelClass}>
                                        Email (optional)
                                    </Label>
                                    <Input
                                        className={inputClass}
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder='you@example.com'
                                        type='email'
                                    />
                                </div>
                            </div>

                            <div className='mt-4 flex items-center gap-2 text-sm font-medium text-gray-600'>
                                <MapPin className='text-primary-ink h-4 w-4' />{' '}
                                Delivery address
                            </div>

                            <div className='mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3'>
                                <div>
                                    <Label className={labelClass}>
                                        Division
                                    </Label>
                                    <Input
                                        className={inputClass}
                                        value={division}
                                        onChange={(e) =>
                                            setDivision(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className={labelClass}>
                                        District
                                    </Label>
                                    <Input
                                        className={inputClass}
                                        value={district}
                                        onChange={(e) =>
                                            setDistrict(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className={labelClass}>
                                        Thana / Upazila
                                    </Label>
                                    <Input
                                        className={inputClass}
                                        value={thana}
                                        onChange={(e) =>
                                            setThana(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className='mt-4'>
                                <Label className={labelClass}>
                                    Full Address *
                                </Label>
                                <Textarea
                                    className={focusClass}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={2}
                                    placeholder='House, road, area...'
                                />
                            </div>

                            <div className='mt-4'>
                                <Label className={labelClass}>Order Note</Label>
                                <Textarea
                                    className={focusClass}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={2}
                                    placeholder='Anything else we should know?'
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT: sticky summary / CTA */}
                    <aside className='space-y-4 lg:sticky lg:top-24'>
                        <div className={cardClass}>
                            <h3 className='mb-3 font-semibold'>Your request</h3>
                            <div className='flex items-center gap-3 rounded-xl border bg-gray-50 p-3'>
                                {summaryImage ? (
                                    <Image
                                        src={getMediaUrl(summaryImage)}
                                        alt={summaryName || 'product'}
                                        width={56}
                                        height={56}
                                        className='h-14 w-14 shrink-0 rounded-lg border object-cover'
                                    />
                                ) : (
                                    <span className='flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border bg-white text-gray-600'>
                                        <ShoppingBag className='h-6 w-6' />
                                    </span>
                                )}
                                <div className='min-w-0'>
                                    <p className='truncate font-medium'>
                                        {summaryName}
                                    </p>
                                    <p className='mt-0.5 text-sm text-gray-600'>
                                        {totalItems} product
                                        {totalItems > 1 ? 's' : ''} • Qty:{' '}
                                        {totalQty}
                                    </p>
                                </div>
                            </div>

                            <div className='mt-3 flex items-start gap-2 rounded-lg bg-[#ff5c00]/5 p-3 text-xs text-gray-600'>
                                <Info className='text-primary-ink mt-0.5 h-4 w-4 shrink-0' />
                                <span>
                                    Final price &amp; delivery time are
                                    confirmed by our team after review — no
                                    payment is required now.
                                </span>
                            </div>

                            <div className='mt-4'>{submitButton}</div>
                        </div>
                    </aside>
                </div>
            </Container>
        </div>
    );
}
