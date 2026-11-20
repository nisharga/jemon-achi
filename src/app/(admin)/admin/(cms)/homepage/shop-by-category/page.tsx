'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
    Loader2,
    Plus,
    Trash2,
    GripVertical,
    RefreshCcw,
    Save
} from 'lucide-react';

import {
    useGetHomepageQuery,
    useUpsertShopByCategoryMutation
} from '@/admin/redux/api-queries/homepage-api';
import { useGetAllCategoriesQuery } from '@/admin/redux/api-queries/category-api';
import { TShopByCategoryItem } from '@/admin/types/homepage';

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

type TShopByCategoryForm = Omit<TShopByCategoryItem, '_id'> & {
    _id?: string;
};

const DEFAULT_FORM: TShopByCategoryForm = {
    category_id: '',
    subcategory_id: '',
    position: 1,
    label: ''
};

const AVAILABLE_POSITIONS = [1, 2, 3];

const ShopByCategoryPage = () => {
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
    const [upsertShopByCategory, { isLoading: isSaving }] =
        useUpsertShopByCategoryMutation();

    const { data: categoriesData } = useGetAllCategoriesQuery({
        page: 1,
        limit: 100
    });
    const categories = categoriesData?.data?.data || [];

    const [items, setItems] = useState<TShopByCategoryForm[]>([DEFAULT_FORM]);

    // Derived state: ensure category_id and subcategory_id are always strings
    const cleanItems = useMemo(
        () =>
            items.map((item: any) => ({
                ...item,
                category_id:
                    typeof item.category_id === 'string'
                        ? item.category_id
                        : item.category_id?._id || '',
                subcategory_id: item.subcategory_id
                    ? typeof item.subcategory_id === 'string'
                        ? item.subcategory_id
                        : item.subcategory_id._id || ''
                    : ''
            })),
        [items]
    );

    // Hydrate form from API data
    useEffect(() => {
        if (homepageData?.data?.shop_by_category?.length) {
            const formatted = homepageData.data.shop_by_category.map(
                (item: any) => ({
                    _id: item._id,
                    category_id:
                        typeof item.category_id === 'string'
                            ? item.category_id
                            : item.category_id?._id || '',
                    subcategory_id: item.subcategory_id
                        ? typeof item.subcategory_id === 'string'
                            ? item.subcategory_id
                            : item.subcategory_id._id
                        : '',
                    position: item.position,
                    label: item.label || ''
                })
            );
            setItems(formatted);
        }
    }, [homepageData]);

    const handleAddItem = () => {
        if (cleanItems.length >= 3) {
            toast.error('Maximum 3 categories allowed');
            return;
        }

        const usedPositions = cleanItems.map((i) => i.position);
        const nextPosition = AVAILABLE_POSITIONS.find(
            (p) => !usedPositions.includes(p)
        );

        if (!nextPosition) {
            toast.error(
                'All positions are occupied. Please remove or reposition an item first.'
            );
            return;
        }

        setItems([...cleanItems, { ...DEFAULT_FORM, position: nextPosition }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(cleanItems.filter((_, i) => i !== index));
    };

    const handleSaveAll = async () => {
        // Validate unique positions
        const usedPositions = cleanItems.map((i) => i.position);
        const uniquePositions = new Set(usedPositions);
        if (usedPositions.length !== uniquePositions.size) {
            toast.error('Each item must have a unique position (1-3)');
            return;
        }

        // Validate required fields
        for (let i = 0; i < cleanItems.length; i++) {
            const item = cleanItems[i];
            if (!item.category_id) {
                toast.error(
                    `Category is required for position ${item.position}`
                );
                return;
            }
        }

        // Build payload - cleanItems already has string IDs
        const processedItems = cleanItems.map((item) => ({
            ...(item._id && { _id: item._id }),
            category_id: item.category_id,
            ...(item.subcategory_id && { subcategory_id: item.subcategory_id }),
            position: item.position,
            ...(item.label && { label: item.label })
        }));

        try {
            const res: any = await upsertShopByCategory({
                shop_by_category: processedItems
            }).unwrap();

            if (res?.success) {
                toast.success(
                    res?.message || 'Shop by category saved successfully'
                );
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to save shop by category');
        }
    };

    const updateItem = (
        index: number,
        updates: Partial<TShopByCategoryForm>
    ) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, ...updates } : item
            )
        );
    };

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
                        Shop by Category
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Manage top 3 categories displayed on the homepage
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

            {/* Items Grid */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
                {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className='rounded-2xl'>
                              <CardContent className='space-y-4 p-6'>
                                  <Skeleton className='h-6 w-3/4' />
                                  <Skeleton className='h-32 w-full' />
                                  <Skeleton className='h-10 w-full' />
                              </CardContent>
                          </Card>
                      ))
                    : cleanItems.map((item, index) => (
                          <Card
                              key={item._id || index}
                              className='group relative rounded-2xl'
                          >
                              <CardHeader className='pb-4'>
                                  <div className='flex items-start justify-between gap-3'>
                                      <div className='flex items-center gap-2'>
                                          <GripVertical className='h-5 w-5 text-muted-foreground' />
                                          <CardTitle className='text-lg'>
                                              Category {item.position}
                                          </CardTitle>
                                      </div>
                                      <Button
                                          variant='ghost'
                                          size='icon'
                                          onClick={() =>
                                              handleRemoveItem(index)
                                          }
                                          className='h-8 w-8 text-destructive hover:text-destructive'
                                      >
                                          <Trash2 className='h-4 w-4' />
                                      </Button>
                                  </div>
                                  <CardDescription>
                                      Position {item.position}
                                  </CardDescription>
                              </CardHeader>

                              <CardContent className='space-y-4'>
                                  {/* Position Selector */}
                                  <div className='space-y-2'>
                                      <Label>Position (1-3)</Label>
                                      <Select
                                          value={String(item.position)}
                                          onValueChange={(val) =>
                                              updateItem(index, {
                                                  position: Number(val)
                                              })
                                          }
                                      >
                                          <SelectTrigger>
                                              <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                              {AVAILABLE_POSITIONS.map(
                                                  (pos) => (
                                                      <SelectItem
                                                          key={pos}
                                                          value={String(pos)}
                                                          disabled={
                                                              pos !==
                                                                  item.position &&
                                                              cleanItems.some(
                                                                  (i) =>
                                                                      i.position ===
                                                                      pos
                                                              )
                                                          }
                                                      >
                                                          Position {pos}
                                                      </SelectItem>
                                                  )
                                              )}
                                          </SelectContent>
                                      </Select>
                                  </div>

                                  {/* Category Selection */}
                                  <div className='space-y-2'>
                                      <Label>Category *</Label>
                                      <Select
                                          value={item.category_id || undefined}
                                          onValueChange={(val) =>
                                              updateItem(index, {
                                                  category_id: val
                                              })
                                          }
                                      >
                                          <SelectTrigger>
                                              <SelectValue placeholder='Select category' />
                                          </SelectTrigger>
                                          <SelectContent>
                                              {categories.map((cat: any) => (
                                                  <SelectItem
                                                      key={cat._id}
                                                      value={cat._id}
                                                  >
                                                      {cat.name_en}
                                                  </SelectItem>
                                              ))}
                                          </SelectContent>
                                      </Select>
                                  </div>

                                  {/* Label (Optional) */}
                                  <div className='space-y-2'>
                                      <Label>Custom Label (Optional)</Label>
                                      <Input
                                          value={item.label}
                                          onChange={(e) =>
                                              updateItem(index, {
                                                  label: e.target.value
                                              })
                                          }
                                          placeholder='Custom label override'
                                          maxLength={50}
                                      />
                                      <p className='text-xs text-muted-foreground'>
                                          {item.label.length}/50 characters
                                      </p>
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
            </div>

            {/* Add Item Button */}
            {cleanItems.length < 3 && (
                <Card
                    className='cursor-pointer rounded-2xl border-2 border-dashed transition hover:bg-muted/20'
                    onClick={handleAddItem}
                >
                    <CardContent className='flex flex-col items-center justify-center gap-3 p-12'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                            <Plus className='h-6 w-6 text-primary' />
                        </div>
                        <div className='text-center'>
                            <p className='font-medium'>Add New Category</p>
                            <p className='text-sm text-muted-foreground'>
                                {cleanItems.length === 0
                                    ? 'Add your first category'
                                    : `${3 - cleanItems.length} more slot(s) available`}
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
                                    • Each category must have a unique position
                                    (1-3)
                                </li>
                                <li>
                                    • Categories are displayed in order:
                                    Position 1 → 2 → 3
                                </li>
                                <li>
                                    • Custom label overrides the category name
                                    on display
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ShopByCategoryPage;
