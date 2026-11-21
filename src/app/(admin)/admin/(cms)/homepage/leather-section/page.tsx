'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Loader2,
    RefreshCcw,
    Save,
    Search,
    Image as ImageIcon,
    X
} from 'lucide-react';

import {
    useGetHomepageQuery,
    useUpsertLeatherSectionMutation
} from '@/redux/api-queries/homepage-api';
import { useGetAllProductsQuery } from '@/redux/api-queries/product-api';
import { TLeatherSection } from '@/types/homepage';
import { useUploadFileToAWSMutation } from '@/redux/api-queries/file-upload-api';

import { Button } from '@/components/ui/admin-button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/admin-card';
import { Input } from '@/components/ui/admin-input';
import { Label } from '@/components/ui/admin-label';
import { Skeleton } from '@/components/ui/admin-skeleton';
import { Switch } from '@/components/ui/switch';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { ImageUploadInput } from '@/components/ui/image-upload-input';
import { Textarea } from '@/components/ui/textarea';
import { getImgFullUrl } from '@/lib/admin-utils';
import Image from 'next/image';

type TLeatherSectionForm = Omit<TLeatherSection, 'product_ids'> & {
    product_ids: string[];
    products?: Array<{ _id: string; name: string; thumbnail: string }>;
    banner_image_file?: File;
};

const DEFAULT_FORM: TLeatherSectionForm = {
    enabled: true,
    title: 'Shop All Leather',
    subtitle: '',
    button_text: 'Shop Now',
    button_link: '',
    banner_image_url: '',
    position: 1,
    product_ids: [],
    products: []
};

const LeatherSectionPage = () => {
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.CMS_VIEW,
            PermissionEnum.CMS_CREATE,
            PermissionEnum.CMS_UPDATE
        ]
    });

    const {
        data: homepageData,
        isLoading,
        refetch
    } = useGetHomepageQuery('full');
    const [upsertLeatherSection, { isLoading: isSaving }] =
        useUpsertLeatherSectionMutation();
    const [uploadFile] = useUploadFileToAWSMutation();

    const [formData, setFormData] = useState<TLeatherSectionForm>(DEFAULT_FORM);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const { data: productsData } = useGetAllProductsQuery({
        page: 1,
        limit: 100,
        searchQuery
    });
    const products = productsData?.data?.data || [];

    // Hydrate form from API data
    useEffect(() => {
        if (homepageData?.data?.leather_section) {
            const section = homepageData.data.leather_section;
            setFormData({
                enabled: section.enabled ?? true,
                title: section.title || 'Shop All Leather',
                subtitle: section.subtitle || '',
                button_text: section.button_text || 'Shop Now',
                button_link: section.button_link || '',
                banner_image_url: section.banner_image_url || '',
                position: section.position || 1,
                product_ids: Array.isArray(section.product_ids)
                    ? section.product_ids.map((p: any) =>
                          typeof p === 'string' ? p : p._id
                      )
                    : [],
                products: Array.isArray(section.product_ids)
                    ? section.product_ids.map((p: any) =>
                          typeof p === 'string'
                              ? null
                              : {
                                    _id: p._id,
                                    name: p.name,
                                    thumbnail: p.thumbnail
                                }
                      )
                    : []
            });
        }
    }, [homepageData]);

    const handleSave = async () => {
        // Validate
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.button_text.trim()) {
            toast.error('Button text is required');
            return;
        }
        if (!formData.button_link.trim()) {
            toast.error('Button link is required');
            return;
        }
        if (formData.product_ids.length === 0) {
            toast.error('At least one product is required');
            return;
        }

        // Upload banner image if needed
        let bannerImageUrl = formData.banner_image_url;
        if (formData.banner_image_file instanceof File) {
            const uploadedUrl = await handleUploadFile(
                formData.banner_image_file
            );
            if (!uploadedUrl) {
                toast.error('Failed to upload banner image');
                return;
            }
            bannerImageUrl = uploadedUrl;
        }

        // Build payload
        const payload: any = {
            enabled: formData.enabled,
            title: formData.title,
            button_text: formData.button_text,
            button_link: formData.button_link,
            position: formData.position,
            product_ids: formData.product_ids
        };

        if (formData.subtitle) {
            payload.subtitle = formData.subtitle;
        }
        if (bannerImageUrl) {
            payload.banner_image_url = bannerImageUrl;
        }

        try {
            const res: any = await upsertLeatherSection({
                leather_section: payload
            }).unwrap();

            if (res?.success) {
                toast.success(
                    res?.message || 'Leather section saved successfully'
                );
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to save leather section');
        }
    };

    const handleUploadFile = async (
        file: File
    ): Promise<string | undefined> => {
        try {
            setIsUploading(true);
            const res: any = await uploadFile(file);
            if (res?.data?.success) {
                return res?.data?.data?.url;
            }
        } catch (e) {
            toast.error('Failed to upload file');
            console.log(e);
            return undefined;
        } finally {
            setIsUploading(false);
        }
    };

    const updateField = (field: keyof TLeatherSectionForm, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Get available products (not already selected)
    const availableProducts = products.filter(
        (p: any) => !formData.product_ids.includes(p._id)
    );

    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <div className='space-y-6 p-4'>
            {/* Header */}
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                    <h1 className='text-xl font-semibold md:text-2xl'>
                        Leather Section
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Manage the leather products section displayed on
                        homepage
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCcw className='mr-2 h-4 w-4' />
                        Refresh
                    </Button>

                    <Button
                        className='bg-primary text-primary-foreground hover:bg-primary/90'
                        onClick={handleSave}
                        disabled={isLoading || isSaving || isUploading}
                    >
                        {(isSaving || isUploading) && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        <Save className='mr-2 h-4 w-4' />
                        Save Changes
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <Skeleton className='h-64 w-full' />
                    <Skeleton className='h-64 w-full' />
                </div>
            ) : (
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    {/* Settings Card */}
                    <Card className='rounded-2xl'>
                        <CardHeader>
                            <CardTitle>Section Settings</CardTitle>
                            <CardDescription>
                                Configure the leather section display
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {/* Enabled Toggle */}
                            <div className='flex items-center justify-between rounded-xl border bg-muted/20 p-4'>
                                <div>
                                    <Label htmlFor='enabled'>
                                        Enable Section
                                    </Label>
                                    <p className='text-xs text-muted-foreground'>
                                        Show this section on the homepage
                                    </p>
                                </div>
                                <Switch
                                    id='enabled'
                                    checked={formData.enabled}
                                    onCheckedChange={(checked) =>
                                        updateField('enabled', checked)
                                    }
                                />
                            </div>

                            {/* Title */}
                            <div className='space-y-2'>
                                <Label>Section Title *</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) =>
                                        updateField('title', e.target.value)
                                    }
                                    placeholder='Shop All Leather'
                                    maxLength={100}
                                />
                                <p className='text-xs text-muted-foreground'>
                                    {formData.title.length}/100 characters
                                </p>
                            </div>

                            {/* Subtitle */}
                            <div className='space-y-2'>
                                <Label>Subtitle (Optional)</Label>
                                <Textarea
                                    value={formData.subtitle}
                                    onChange={(e) =>
                                        updateField('subtitle', e.target.value)
                                    }
                                    placeholder='Additional description for the section'
                                    maxLength={200}
                                    rows={3}
                                />
                                <p className='text-xs text-muted-foreground'>
                                    {formData.subtitle?.length || 0}/200
                                    characters
                                </p>
                            </div>

                            {/* Button Text */}
                            <div className='space-y-2'>
                                <Label>Button Text *</Label>
                                <Input
                                    value={formData.button_text}
                                    onChange={(e) =>
                                        updateField(
                                            'button_text',
                                            e.target.value
                                        )
                                    }
                                    placeholder='Shop Now'
                                    maxLength={50}
                                />
                                <p className='text-xs text-muted-foreground'>
                                    {formData.button_text.length}/50 characters
                                </p>
                            </div>

                            {/* Button Link */}
                            <div className='space-y-2'>
                                <Label>Button Link *</Label>
                                <Input
                                    value={formData.button_link}
                                    onChange={(e) =>
                                        updateField(
                                            'button_link',
                                            e.target.value
                                        )
                                    }
                                    placeholder='/products?category=leather'
                                />
                                <p className='text-xs text-muted-foreground'>
                                    Internal path (e.g., /products) or external
                                    URL
                                </p>
                            </div>

                            {/* Position */}
                            <div className='space-y-2'>
                                <Label>Section Position</Label>
                                <Input
                                    type='number'
                                    min='1'
                                    value={formData.position}
                                    onChange={(e) =>
                                        updateField(
                                            'position',
                                            Number(e.target.value)
                                        )
                                    }
                                />
                                <p className='text-xs text-muted-foreground'>
                                    Order on homepage (lower numbers appear
                                    first)
                                </p>
                            </div>

                            {/* Banner Image */}
                            <div className='space-y-2'>
                                <Label>Banner Image (Optional)</Label>
                                {formData.banner_image_url && (
                                    <div className='relative h-32 w-full overflow-hidden rounded-lg border'>
                                        <img
                                            src={getImgFullUrl(
                                                formData.banner_image_url
                                            )}
                                            alt='Banner'
                                            className='h-full w-full object-cover'
                                        />
                                        <Button
                                            variant='destructive'
                                            size='icon'
                                            className='absolute top-2 right-2 h-8 w-8 p-0'
                                            onClick={() => {
                                                updateField(
                                                    'banner_image_url',
                                                    ''
                                                );
                                                updateField(
                                                    'banner_image_file',
                                                    undefined
                                                );
                                            }}
                                        >
                                            <X className='h-4 w-4' />
                                        </Button>
                                    </div>
                                )}
                                <ImageUploadInput
                                    mode='single'
                                    inputId='banner-image'
                                    onChange={(images) => {
                                        if (images[0]) {
                                            updateField(
                                                'banner_image_file',
                                                images[0]
                                            );
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products Card */}
                    <Card className='rounded-2xl'>
                        <CardHeader>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>
                                Add leather products to display in this section
                                ({formData.product_ids.length} selected)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {/* Product Search */}
                            <div className='relative'>
                                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                                <Select
                                    value=''
                                    onValueChange={(val) => {
                                        if (
                                            !formData.product_ids.includes(val)
                                        ) {
                                            const product = products.find(
                                                (p: any) => p._id === val
                                            );
                                            updateField('product_ids', [
                                                ...formData.product_ids,
                                                val
                                            ]);
                                            updateField('products', [
                                                ...(formData.products || []),
                                                {
                                                    _id: product._id,
                                                    name: product.name,
                                                    thumbnail: product.thumbnail
                                                }
                                            ]);
                                        }
                                    }}
                                >
                                    <SelectTrigger className='pl-9'>
                                        <SelectValue placeholder='Add products to section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className='sticky top-0 bg-background p-2'>
                                            <Input
                                                placeholder='Search products...'
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        {availableProducts.length > 0 ? (
                                            availableProducts.map((p: any) => (
                                                <SelectItem
                                                    key={p._id}
                                                    value={p._id}
                                                >
                                                    {p.name} ({p.sku})
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='p-2 text-center text-sm text-muted-foreground'>
                                                {searchQuery
                                                    ? 'No products found'
                                                    : 'All products are already selected'}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Selected Products */}
                            {formData.product_ids.length > 0 ? (
                                <div className='space-y-2'>
                                    <Label>Selected Products</Label>
                                    <div className='max-h-[400px] space-y-2 overflow-y-auto'>
                                        {formData.products?.map((product) => (
                                            <div
                                                key={product._id}
                                                className='flex items-center gap-3 rounded-lg border bg-muted/20 p-3'
                                            >
                                                <div className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted'>
                                                    {product.thumbnail ? (
                                                        <Image
                                                            width={500}
                                                            height={500}
                                                            src={getImgFullUrl(
                                                                product.thumbnail
                                                            )}
                                                            alt={product.name}
                                                            className='h-full w-full object-cover'
                                                        />
                                                    ) : (
                                                        <div className='flex h-full w-full items-center justify-center'>
                                                            <ImageIcon className='h-5 w-5 text-muted-foreground' />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='min-w-0 flex-1'>
                                                    <p className='truncate font-medium'>
                                                        {product.name}
                                                    </p>
                                                    <p className='text-xs text-muted-foreground'>
                                                        {product._id}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() => {
                                                        updateField(
                                                            'product_ids',
                                                            formData.product_ids.filter(
                                                                (id) =>
                                                                    id !==
                                                                    product._id
                                                            )
                                                        );
                                                        updateField(
                                                            'products',
                                                            formData.products?.filter(
                                                                (p) =>
                                                                    p._id !==
                                                                    product._id
                                                            )
                                                        );
                                                    }}
                                                    className='h-8 w-8 text-destructive hover:text-destructive'
                                                >
                                                    <X className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className='py-12 text-center text-muted-foreground'>
                                    <ImageIcon className='mx-auto mb-3 h-12 w-12 opacity-50' />
                                    <p>No products selected</p>
                                    <p className='text-sm'>
                                        Search and add products above
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Info Card */}
            <Card className='rounded-2xl bg-muted/30'>
                <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
                            <Save className='h-4 w-4 text-primary' />
                        </div>
                        <div className='space-y-1'>
                            <p className='text-sm font-medium'>Tips</p>
                            <ul className='space-y-1 text-sm text-muted-foreground'>
                                <li>
                                    • Toggle the section on/off to show/hide on
                                    homepage
                                </li>
                                <li>
                                    • Add a banner image for visual appeal
                                    (optional)
                                </li>
                                <li>
                                    • Button link supports internal paths
                                    (/products) and external URLs
                                </li>
                                <li>
                                    • Position determines order relative to
                                    other homepage sections
                                </li>
                                <li>
                                    • Add as many products as needed for the
                                    leather section
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LeatherSectionPage;
