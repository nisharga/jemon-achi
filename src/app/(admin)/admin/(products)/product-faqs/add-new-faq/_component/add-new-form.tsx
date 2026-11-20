'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Save, Search, Image as ImageIcon } from 'lucide-react';

import { useGetAllProductsQuery } from '@/admin/redux/api-queries/product-api';

import { Button } from '@/admin/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/admin/components/ui/card';
import { Input } from '@/admin/components/ui/input';
import { Label } from '@/admin/components/ui/label';
import { Skeleton } from '@/admin/components/ui/skeleton';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { Textarea } from '@/admin/components/ui/textarea';
import Image from 'next/image';
import { getImgFullUrl } from '@/admin/lib/utils';
import SectionTitle from '@/admin/components/shared/section-title';
import { useCreateFaqMutation } from '@/admin/redux/api-queries/faq-api';

type TStatus = 'active' | 'inactive' | 'pending';

type TProductFAQForm = {
    question: string;
    answer: string;
    status: TStatus;
    product: string;
    productName?: string;
    productThumbnail?: string;
};

const DEFAULT_FORM: TProductFAQForm = {
    question: '',
    answer: '',
    status: 'active',
    product: ''
};

const AddNewFAQForm = () => {
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.PRODUCT_VIEW,
            PermissionEnum.PRODUCT_CREATE
        ]
    });

    const [formData, setFormData] = useState<TProductFAQForm>(DEFAULT_FORM);
    const [searchQuery, setSearchQuery] = useState('');

    const [createFaq, { isLoading: isCreateFaqLoading }] =
        useCreateFaqMutation();

    const { data: productsData, isLoading: isLoadingProducts } =
        useGetAllProductsQuery({
            page: 1,
            limit: 100,
            searchQuery
        });
    const products = productsData?.data?.data || [];

    const updateField = (field: keyof TProductFAQForm, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.question.trim()) {
            toast.error('Question is required');
            return;
        }
        if (!formData.answer.trim()) {
            toast.error('Answer is required');
            return;
        }
        if (!formData.product) {
            toast.error('Product is required');
            return;
        }

        try {
            // Build the payload
            const payload = {
                question: formData.question,
                answer: formData.answer,
                status: formData.status,
                product: formData.product
            };

            try {
                const res = await createFaq(payload).unwrap();
                if (res?.success) {
                    toast.success(res?.message || 'FAQ created successfully!');
                    // Reset form
                    setFormData(DEFAULT_FORM);
                }
            } catch (error: any) {
                toast.error(error?.data?.message || 'Failed to create FAQ');
            }
        } catch (error) {
            toast.error('Failed to create FAQ');
            console.error('Error creating FAQ:', error);
        }
    };

    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    const selectedProduct = products.find(
        (p: any) => p._id === formData.product
    );

    return (
        <div className='space-y-6 p-4'>
            {/* Header */}
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <SectionTitle title='Add New Faq' url='/admin/product-faqs' />

                <Button
                    className='bg-primary text-primary-foreground hover:bg-primary/90'
                    onClick={handleSubmit}
                    disabled={isCreateFaqLoading}
                >
                    {isCreateFaqLoading && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    <Save className='mr-2 h-4 w-4' />
                    Save FAQ
                </Button>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* FAQ Details Card */}
                <Card className='rounded-2xl'>
                    <CardHeader>
                        <CardTitle>FAQ Details</CardTitle>
                        <CardDescription>
                            Enter the question and answer details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {/* Question */}
                        <div className='space-y-2'>
                            <Label>Question *</Label>
                            <Input
                                value={formData.question}
                                onChange={(e) =>
                                    updateField('question', e.target.value)
                                }
                                placeholder='e.g., What is the warranty period?'
                                maxLength={500}
                            />
                            <p className='text-xs text-muted-foreground'>
                                {formData.question.length}/500 characters
                            </p>
                        </div>

                        {/* Answer */}
                        <div className='space-y-2'>
                            <Label>Answer *</Label>
                            <Textarea
                                value={formData.answer}
                                onChange={(e) =>
                                    updateField('answer', e.target.value)
                                }
                                placeholder='Provide a detailed answer to the question'
                                maxLength={2000}
                                rows={6}
                            />
                            <p className='text-xs text-muted-foreground'>
                                {formData.answer.length}/2000 characters
                            </p>
                        </div>

                        {/* Status */}
                        <div className='space-y-2'>
                            <Label>Status *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val: TStatus) =>
                                    updateField('status', val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select status' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='active'>
                                        Active
                                    </SelectItem>
                                    <SelectItem value='inactive'>
                                        Inactive
                                    </SelectItem>
                                    <SelectItem value='pending'>
                                        Pending
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className='text-xs text-muted-foreground'>
                                Control visibility of the FAQ on the product
                                page
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Product Selection Card */}
                <Card className='rounded-2xl'>
                    <CardHeader>
                        <CardTitle>Product</CardTitle>
                        <CardDescription>
                            Select the product this FAQ belongs to
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {/* Product Search */}
                        <div className='relative'>
                            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                            <Select
                                value={formData.product}
                                onValueChange={(val) => {
                                    updateField('product', val);
                                    const product = products.find(
                                        (p: any) => p._id === val
                                    );
                                    updateField('productName', product?.name);
                                    updateField(
                                        'productThumbnail',
                                        product?.thumbnail
                                    );
                                }}
                            >
                                <SelectTrigger className='pl-9'>
                                    <SelectValue placeholder='Select a product' />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className='sticky top-0 bg-background p-2'>
                                        <Input
                                            placeholder='Search products...'
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        />
                                    </div>
                                    {isLoadingProducts ? (
                                        <div className='p-4 text-center'>
                                            <Skeleton className='h-6 w-full' />
                                        </div>
                                    ) : products.length > 0 ? (
                                        products.map((p: any) => (
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
                                                : 'No products available'}
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selected Product Preview */}
                        {selectedProduct ? (
                            <div className='space-y-2'>
                                <Label>Selected Product</Label>
                                <div className='flex items-center gap-3 rounded-lg border bg-muted/20 p-3'>
                                    <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted'>
                                        {selectedProduct.thumbnail ? (
                                            <Image
                                                width={500}
                                                height={500}
                                                src={getImgFullUrl(
                                                    selectedProduct.thumbnail
                                                )}
                                                alt={selectedProduct.name}
                                                className='h-full w-full object-cover'
                                            />
                                        ) : (
                                            <div className='flex h-full w-full items-center justify-center'>
                                                <ImageIcon className='h-6 w-6 text-muted-foreground' />
                                            </div>
                                        )}
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <p className='truncate font-medium'>
                                            {selectedProduct.name}
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                            SKU: {selectedProduct.sku}
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                            ID: {selectedProduct._id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='py-12 text-center text-muted-foreground'>
                                <ImageIcon className='mx-auto mb-3 h-12 w-12 opacity-50' />
                                <p>No product selected</p>
                                <p className='text-sm'>
                                    Search and select a product above
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddNewFAQForm;
