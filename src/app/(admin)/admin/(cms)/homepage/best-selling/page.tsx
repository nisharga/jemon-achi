'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Loader2,
    Plus,
    Trash2,
    GripVertical,
    RefreshCcw,
    Save,
    Search
} from 'lucide-react';

import {
    useGetHomepageQuery,
    useUpsertBestSellingMutation
} from '@/redux/api-queries/homepage-api';
import { useGetAllProductsQuery } from '@/redux/api-queries/product-api';
import { TBestSellingItem } from '@/types/homepage';

import { Button } from '@/components/ui/admin-button';
import { Card, CardContent, CardHeader } from '@/components/ui/admin-card';
import { Input } from '@/components/ui/admin-input';
import { Label } from '@/components/ui/admin-label';
import { Skeleton } from '@/components/ui/admin-skeleton';
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
import { Badge } from '@/components/ui/admin-badge';
import { getImgFullUrl } from '@/lib/admin-utils';

type TBestSellingForm = Omit<TBestSellingItem, '_id'> & {
    _id?: string;
    product_name?: string;
    product_image?: string;
};

const DEFAULT_FORM: TBestSellingForm = {
    product_id: '',
    position: 1
};

const MAX_ITEMS = 20;

const BestSellingPage = () => {
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
    const [upsertBestSelling, { isLoading: isSaving }] =
        useUpsertBestSellingMutation();

    const [items, setItems] = useState<TBestSellingForm[]>([DEFAULT_FORM]);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: productsData } = useGetAllProductsQuery({
        page: 1,
        limit: 100,
        searchQuery
    });
    const products = productsData?.data?.data || [];

    // Hydrate form from API data
    useEffect(() => {
        if (homepageData?.data?.best_selling?.length) {
            const formatted = homepageData.data.best_selling.map(
                (item: any) => ({
                    _id: item._id,
                    product_id:
                        typeof item.product_id === 'string'
                            ? item.product_id
                            : item.product_id?._id || '',
                    product_name:
                        typeof item.product_id === 'string'
                            ? ''
                            : item.product_id?.name || '',
                    product_image:
                        typeof item.product_id === 'string'
                            ? ''
                            : item.product_id?.thumbnail || '',
                    position: item.position
                })
            );
            setItems(formatted);
        }
    }, [homepageData]);

    const handleAddItem = () => {
        if (items.length >= MAX_ITEMS) {
            toast.error(`Maximum ${MAX_ITEMS} products allowed`);
            return;
        }

        const nextPosition = items.length + 1;
        setItems([...items, { ...DEFAULT_FORM, position: nextPosition }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        // Recalculate positions
        const repositioned = newItems.map((item, i) => ({
            ...item,
            position: i + 1
        }));
        setItems(repositioned);
    };

    const handleSaveAll = async () => {
        // Validate required fields
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.product_id) {
                toast.error(
                    `Product is required for position ${item.position}`
                );
                return;
            }
        }

        // Check for duplicate products
        const productIds = items.map((i) => i.product_id);
        const uniqueIds = new Set(productIds);
        if (productIds.length !== uniqueIds.size) {
            toast.error('Each product can only be added once');
            return;
        }

        // Build payload
        const processedItems = items.map((item) => ({
            ...(item._id && { _id: item._id }),
            product_id: item.product_id,
            position: item.position
        }));

        try {
            const res: any = await upsertBestSelling({
                best_selling: processedItems
            }).unwrap();

            if (res?.success) {
                toast.success(
                    res?.message || 'Best selling saved successfully'
                );
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to save best selling');
        }
    };

    const updateItem = (index: number, updates: Partial<TBestSellingForm>) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, ...updates } : item
            )
        );
    };

    const getProductById = (productId: string) => {
        return products.find((p: any) => p._id === productId);
    };

    // Filter out already selected products from the dropdown
    const availableProducts = products.filter((p: any) => {
        const isSelected = items.some((item) => item.product_id === p._id);
        return !isSelected;
    });

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
                        Best Selling Products
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Manage best selling products displayed on homepage (max{' '}
                        {MAX_ITEMS})
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
                        onClick={handleSaveAll}
                        disabled={isLoading || isSaving}
                    >
                        {isSaving && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        <Save className='mr-2 h-4 w-4' />
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Products Grid */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className='rounded-2xl'>
                              <CardContent className='space-y-3 p-4'>
                                  <Skeleton className='h-20 w-full' />
                                  <Skeleton className='h-4 w-3/4' />
                                  <Skeleton className='h-10 w-full' />
                              </CardContent>
                          </Card>
                      ))
                    : items.map((item, index) => (
                          <Card
                              key={item._id || index}
                              className='relative rounded-2xl'
                          >
                              <CardHeader className='pb-3'>
                                  <div className='flex items-start justify-between gap-2'>
                                      <div className='flex items-center gap-2'>
                                          <GripVertical className='h-4 w-4 text-muted-foreground' />
                                          <Badge variant='secondary'>
                                              #{item.position}
                                          </Badge>
                                      </div>
                                      <Button
                                          variant='ghost'
                                          size='icon'
                                          onClick={() =>
                                              handleRemoveItem(index)
                                          }
                                          className='h-7 w-7 text-destructive hover:text-destructive'
                                      >
                                          <Trash2 className='h-3.5 w-3.5' />
                                      </Button>
                                  </div>
                              </CardHeader>

                              <CardContent className='space-y-3'>
                                  {/* Product Image Preview */}
                                  {item.product_image && (
                                      <div className='aspect-square overflow-hidden rounded-lg bg-muted'>
                                          <img
                                              src={getImgFullUrl(
                                                  item.product_image
                                              )}
                                              alt={
                                                  item.product_name || 'Product'
                                              }
                                              className='h-full w-full object-cover'
                                          />
                                      </div>
                                  )}

                                  {/* Product Selection */}
                                  <div className='space-y-2'>
                                      <Label>Product *</Label>
                                      <div className='relative'>
                                          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                                          <Select
                                              value={item.product_id}
                                              onValueChange={(val) => {
                                                  const selected =
                                                      getProductById(val);
                                                  updateItem(index, {
                                                      product_id: val,
                                                      product_name:
                                                          selected?.name,
                                                      product_image:
                                                          selected?.thumbnail
                                                  });
                                              }}
                                          >
                                              <SelectTrigger className='pl-9'>
                                                  <SelectValue placeholder='Select product' />
                                              </SelectTrigger>
                                              <SelectContent>
                                                  <div className='p-2'>
                                                      <Input
                                                          placeholder='Search products...'
                                                          value={searchQuery}
                                                          onChange={(e) =>
                                                              setSearchQuery(
                                                                  e.target.value
                                                              )
                                                          }
                                                          className='mb-2'
                                                      />
                                                  </div>
                                                  {availableProducts.length >
                                                  0 ? (
                                                      <>
                                                          {availableProducts.map(
                                                              (p: any) => (
                                                                  <SelectItem
                                                                      key={
                                                                          p._id
                                                                      }
                                                                      value={
                                                                          p._id
                                                                      }
                                                                  >
                                                                      {p.name} (
                                                                      {p.sku})
                                                                  </SelectItem>
                                                              )
                                                          )}
                                                      </>
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
                                      {item.product_name && (
                                          <p className='truncate text-xs text-muted-foreground'>
                                              {item.product_name}
                                          </p>
                                      )}
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
            </div>

            {/* Add Product Button */}
            {items.length < MAX_ITEMS && (
                <Card
                    className='cursor-pointer rounded-2xl border-2 border-dashed transition hover:bg-muted/20'
                    onClick={handleAddItem}
                >
                    <CardContent className='flex flex-col items-center justify-center gap-3 p-8'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                            <Plus className='h-5 w-5 text-primary' />
                        </div>
                        <div className='text-center'>
                            <p className='font-medium'>Add Product</p>
                            <p className='text-sm text-muted-foreground'>
                                {items.length === 0
                                    ? 'Add your first best selling product'
                                    : `${MAX_ITEMS - items.length} more slot(s) available`}
                            </p>
                        </div>
                    </CardContent>
                </Card>
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
                                    • Add up to {MAX_ITEMS} best selling
                                    products
                                </li>
                                <li>
                                    • Products are displayed in the order they
                                    are added
                                </li>
                                <li>• Each product can only be added once</li>
                                <li>
                                    • Use the search box to find products
                                    quickly
                                </li>
                                <li>
                                    • Remove products by clicking the trash icon
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BestSellingPage;
