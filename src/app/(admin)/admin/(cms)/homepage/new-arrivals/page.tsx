'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Loader2,
    Plus,
    Trash2,
    RefreshCcw,
    Save,
    Search,
    Edit,
    X
} from 'lucide-react';
import { getImgFullUrl } from '@/admin/lib/utils';

import {
    useGetHomepageQuery,
    useUpsertNewArrivalsMutation,
    useUpdateNewArrivalGroupMutation,
    useDeleteNewArrivalGroupMutation
} from '@/admin/redux/api-queries/homepage-api';
import { useGetAllProductsQuery } from '@/admin/redux/api-queries/product-api';
import { TNewArrivalGroup } from '@/admin/types/homepage';

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
import { Badge } from '@/admin/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/admin/components/ui/dialog';
import { Textarea } from '@/admin/components/ui/textarea';
import Image from 'next/image';

type TNewArrivalForm = Omit<TNewArrivalGroup, '_id'> & {
    _id?: string;
    products?: Array<{ _id: string; name: string; thumbnail: string }>;
};

const DEFAULT_GROUP: TNewArrivalForm = {
    name: '',
    slug: '',
    icon: '',
    description: '',
    position: 1,
    product_ids: [],
    products: []
};

const NewArrivalsPage = () => {
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.CMS_VIEW,
            PermissionEnum.CMS_CREATE,
            PermissionEnum.CMS_UPDATE,
            PermissionEnum.CMS_DELETE
        ]
    });

    const {
        data: homepageData,
        isLoading,
        refetch
    } = useGetHomepageQuery('full');
    const [upsertNewArrivals, { isLoading: isSaving }] =
        useUpsertNewArrivalsMutation();
    const [updateGroup, { isLoading: isUpdating }] =
        useUpdateNewArrivalGroupMutation();
    const [deleteGroup] = useDeleteNewArrivalGroupMutation();

    const [groups, setGroups] = useState<TNewArrivalForm[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingGroup, setEditingGroup] = useState<TNewArrivalForm | null>(
        null
    );
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const { data: productsData } = useGetAllProductsQuery({
        page: 1,
        limit: 100
    });
    const allProducts = productsData?.data?.data || [];

    // Filter products based on search query (client-side filtering)
    const products = searchQuery
        ? allProducts.filter(
              (p: any) =>
                  p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allProducts;

    // Hydrate form from API data
    useEffect(() => {
        if (homepageData?.data?.new_arrivals?.length) {
            const formatted = homepageData.data.new_arrivals.map(
                (item: any) => ({
                    _id: item._id,
                    name: item.name,
                    slug: item.slug,
                    icon: item.icon || '',
                    description: item.description || '',
                    position: item.position,
                    product_ids: Array.isArray(item.product_ids)
                        ? item.product_ids.map((p: any) =>
                              typeof p === 'string' ? p : p._id
                          )
                        : [],
                    products: Array.isArray(item.product_ids)
                        ? item.product_ids.map((p: any) =>
                              typeof p === 'string'
                                  ? null
                                  : {
                                        _id: p._id,
                                        name: p.name,
                                        thumbnail: p.thumbnail
                                    }
                          )
                        : []
                })
            );
            const sorted = formatted.sort(
                (a: any, b: any) => a.position - b.position
            );
            setGroups(sorted);
        }
    }, [homepageData]);

    const handleAddGroup = () => {
        const nextPosition = groups.length + 1;
        const newGroup = {
            ...DEFAULT_GROUP,
            position: nextPosition
        };
        setEditingGroup(newGroup);
        setIsEditDialogOpen(true);
    };

    const handleEditGroup = (group: TNewArrivalForm) => {
        setEditingGroup({ ...group });
        setIsEditDialogOpen(true);
    };

    const handleSaveGroup = async () => {
        if (!editingGroup) return;

        // Validate
        if (!editingGroup.name.trim()) {
            toast.error('Group name is required');
            return;
        }
        if (!editingGroup.slug.trim()) {
            toast.error('Slug is required');
            return;
        }
        if (!/^[a-z0-9-]+$/.test(editingGroup.slug)) {
            toast.error(
                'Slug must contain only lowercase letters, numbers, and hyphens'
            );
            return;
        }
        if (editingGroup.product_ids.length === 0) {
            toast.error('At least one product is required');
            return;
        }

        // Check for duplicate slugs (excluding current group)
        const slugExists = groups.some(
            (g) => g.slug === editingGroup.slug && g._id !== editingGroup._id
        );
        if (slugExists) {
            toast.error('Slug already exists. Please use a unique slug.');
            return;
        }

        // If editing existing group, use update mutation
        if (editingGroup._id) {
            try {
                const res: any = await updateGroup({
                    groupId: editingGroup._id,
                    payload: {
                        name: editingGroup.name,
                        slug: editingGroup.slug,
                        ...(editingGroup.icon && { icon: editingGroup.icon }),
                        ...(editingGroup.description && {
                            description: editingGroup.description
                        }),
                        ...(editingGroup.position && {
                            position: editingGroup.position
                        }),
                        product_ids: editingGroup.product_ids
                    }
                }).unwrap();

                if (res?.success) {
                    toast.success(res?.message || 'Group updated successfully');
                    setIsEditDialogOpen(false);
                    setEditingGroup(null);
                    refetch();
                }
            } catch (e: any) {
                toast.error(e?.data?.message || 'Failed to update group');
            }
        } else {
            // New group - add to temp list and save all
            const updatedGroups = [...groups, editingGroup];
            setGroups(updatedGroups);
            setIsEditDialogOpen(false);
            setEditingGroup(null);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Are you sure you want to delete this group?')) return;

        try {
            const res: any = await deleteGroup({ groupId }).unwrap();
            if (res?.success) {
                toast.success(res?.message || 'Group deleted successfully');
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to delete group');
        }
    };

    const handleSaveAll = async () => {
        if (groups.length === 0) {
            toast.error('Add at least one group');
            return;
        }

        // Check for duplicate slugs
        const slugs = groups.map((g) => g.slug);
        const uniqueSlugs = new Set(slugs);
        if (slugs.length !== uniqueSlugs.size) {
            toast.error('Each group must have a unique slug');
            return;
        }

        // Validate all groups
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            if (
                !group.name.trim() ||
                !group.slug.trim() ||
                group.product_ids.length === 0
            ) {
                toast.error(
                    `Please complete all fields for group "${group.name}"`
                );
                return;
            }
        }

        // Build payload
        const processedGroups = groups.map((group) => ({
            ...(group._id && { _id: group._id }),
            name: group.name,
            slug: group.slug,
            ...(group.icon && { icon: group.icon }),
            ...(group.description && { description: group.description }),
            position: group.position,
            product_ids: group.product_ids
        }));

        try {
            const res: any = await upsertNewArrivals({
                new_arrivals: processedGroups
            }).unwrap();

            if (res?.success) {
                toast.success(
                    res?.message || 'New arrivals saved successfully'
                );
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to save new arrivals');
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // Get available products (not already selected in current editing group)
    const getAvailableProducts = (currentGroup: TNewArrivalForm) => {
        const selectedIds = currentGroup.product_ids || [];
        return products.filter((p: any) => !selectedIds.includes(p._id));
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
                        New Arrivals
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Manage new arrival groups (e.g., Tech, Bags, Fashion)
                        with products
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
                        Save All Groups
                    </Button>
                </div>
            </div>

            {/* Groups Grid */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
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
                    : groups.map((group) => (
                          <Card
                              key={group._id || group.slug}
                              className='relative rounded-2xl'
                          >
                              <CardHeader className='pb-4'>
                                  <div className='flex items-start justify-between gap-3'>
                                      <div className='flex items-center gap-2'>
                                          {group.icon && (
                                              <span className='text-2xl'>
                                                  {group.icon}
                                              </span>
                                          )}
                                          <div>
                                              <CardTitle className='text-lg'>
                                                  {group.name}
                                              </CardTitle>
                                              <CardDescription>
                                                  Slug: {group.slug}
                                              </CardDescription>
                                          </div>
                                      </div>
                                      <div className='flex items-center gap-1'>
                                          <Badge variant='secondary'>
                                              #{group.position}
                                          </Badge>
                                          <Button
                                              variant='ghost'
                                              size='icon'
                                              onClick={() =>
                                                  handleEditGroup(group)
                                              }
                                              className='h-8 w-8'
                                          >
                                              <Edit className='h-4 w-4' />
                                          </Button>
                                          <Button
                                              variant='ghost'
                                              size='icon'
                                              onClick={() =>
                                                  handleDeleteGroup(group._id!)
                                              }
                                              className='h-8 w-8 text-destructive hover:text-destructive'
                                          >
                                              <Trash2 className='h-4 w-4' />
                                          </Button>
                                      </div>
                                  </div>
                              </CardHeader>

                              <CardContent className='space-y-4'>
                                  {group.description && (
                                      <p className='text-sm text-muted-foreground'>
                                          {group.description}
                                      </p>
                                  )}

                                  {/* Products Preview */}
                                  <div className='space-y-2'>
                                      <Label className='text-sm'>
                                          Products ({group.product_ids.length})
                                      </Label>
                                      <div className='flex flex-wrap gap-2'>
                                          {group.products
                                              ?.slice(0, 3)
                                              .map((product) => (
                                                  <div
                                                      key={product._id}
                                                      className='h-12 w-12 overflow-hidden rounded-lg border bg-muted'
                                                  >
                                                      <Image
                                                          width={900}
                                                          height={900}
                                                          src={getImgFullUrl(
                                                              product.thumbnail
                                                          )}
                                                          alt={product.name}
                                                          className='h-full w-full object-cover'
                                                      />
                                                  </div>
                                              ))}
                                          {group.product_ids.length > 3 && (
                                              <div className='flex h-12 w-12 items-center justify-center rounded-lg border bg-muted text-xs font-medium'>
                                                  +
                                                  {group.product_ids.length - 3}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
            </div>

            {/* Add Group Button */}
            <Card
                className='cursor-pointer rounded-2xl border-2 border-dashed transition hover:bg-muted/20'
                onClick={handleAddGroup}
            >
                <CardContent className='flex flex-col items-center justify-center gap-3 p-12'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                        <Plus className='h-6 w-6 text-primary' />
                    </div>
                    <div className='text-center'>
                        <p className='font-medium'>Add New Group</p>
                        <p className='text-sm text-muted-foreground'>
                            Create a new product group (e.g., Tech, Bags,
                            Fashion)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Edit/Add Group Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>
                            {editingGroup?._id ? 'Edit Group' : 'Add New Group'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure your new arrival group with name, slug,
                            and products
                        </DialogDescription>
                    </DialogHeader>

                    {editingGroup && (
                        <div className='space-y-4'>
                            {/* Group Name */}
                            <div className='space-y-2'>
                                <Label>Group Name *</Label>
                                <Input
                                    value={editingGroup.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setEditingGroup({
                                            ...editingGroup,
                                            name,
                                            slug: editingGroup._id
                                                ? editingGroup.slug
                                                : generateSlug(name)
                                        });
                                    }}
                                    placeholder='e.g., Tech, Bags, Fashion'
                                    maxLength={50}
                                />
                                <p className='text-xs text-muted-foreground'>
                                    {editingGroup.name.length}/50 characters
                                </p>
                            </div>

                            {/* Slug */}
                            <div className='space-y-2'>
                                <Label>Slug *</Label>
                                <Input
                                    value={editingGroup.slug}
                                    onChange={(e) =>
                                        setEditingGroup({
                                            ...editingGroup,
                                            slug: e.target.value.toLowerCase()
                                        })
                                    }
                                    placeholder='e.g., tech, bags, fashion'
                                    maxLength={50}
                                />
                                <p className='text-xs text-muted-foreground'>
                                    URL-friendly identifier (lowercase, numbers,
                                    hyphens only)
                                </p>
                            </div>

                            {/* Icon */}
                            <div className='space-y-2'>
                                <Label>Icon (Optional)</Label>
                                <Input
                                    value={editingGroup.icon}
                                    onChange={(e) =>
                                        setEditingGroup({
                                            ...editingGroup,
                                            icon: e.target.value
                                        })
                                    }
                                    placeholder='e.g., 🚀, 👜, 👗'
                                    maxLength={10}
                                />
                                <p className='text-xs text-muted-foreground'>
                                    Emoji or icon name (max 10 chars)
                                </p>
                            </div>

                            {/* Description */}
                            <div className='space-y-2'>
                                <Label>Description (Optional)</Label>
                                <Textarea
                                    value={editingGroup.description}
                                    onChange={(e) =>
                                        setEditingGroup({
                                            ...editingGroup,
                                            description: e.target.value
                                        })
                                    }
                                    placeholder='Short description for this group'
                                    maxLength={200}
                                    rows={3}
                                />
                                <p className='text-xs text-muted-foreground'>
                                    {editingGroup.description?.length || 0}/200
                                    characters
                                </p>
                            </div>

                            {/* Position */}
                            <div className='space-y-2'>
                                <Label>Position</Label>
                                <Input
                                    type='number'
                                    min='1'
                                    value={editingGroup.position}
                                    onChange={(e) =>
                                        setEditingGroup({
                                            ...editingGroup,
                                            position: Number(e.target.value)
                                        })
                                    }
                                />
                            </div>

                            {/* Products */}
                            <div className='space-y-2'>
                                <Label>Products *</Label>
                                {/* Search Input */}
                                <div className='relative'>
                                    <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                                    <Input
                                        placeholder='Search products by name or SKU...'
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className='pl-9'
                                    />
                                </div>

                                {/* Search Results - Show when searching */}
                                {searchQuery && (
                                    <div className='max-h-48 overflow-y-auto rounded-lg border'>
                                        {getAvailableProducts(editingGroup)
                                            .length > 0 ? (
                                            getAvailableProducts(
                                                editingGroup
                                            ).map((p: any) => (
                                                <div
                                                    key={p._id}
                                                    className='flex cursor-pointer items-center gap-3 border-b p-3 transition-colors last:border-b-0 hover:bg-muted'
                                                    onClick={() => {
                                                        setEditingGroup({
                                                            ...editingGroup,
                                                            product_ids: [
                                                                ...editingGroup.product_ids,
                                                                p._id
                                                            ],
                                                            products: [
                                                                ...(editingGroup.products ||
                                                                    []),
                                                                {
                                                                    _id: p._id,
                                                                    name: p.name,
                                                                    thumbnail:
                                                                        p.thumbnail
                                                                }
                                                            ]
                                                        });
                                                        setSearchQuery(''); // Clear search after selection
                                                    }}
                                                >
                                                    <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border bg-muted'>
                                                        <Image
                                                            width={900}
                                                            height={900}
                                                            src={getImgFullUrl(
                                                                p.thumbnail
                                                            )}
                                                            alt={p.name}
                                                            className='h-full w-full object-cover'
                                                        />
                                                    </div>
                                                    <div className='min-w-0 flex-1'>
                                                        <p className='truncate text-sm font-medium'>
                                                            {p.name}
                                                        </p>
                                                        <p className='text-xs text-muted-foreground'>
                                                            SKU: {p.sku}
                                                        </p>
                                                    </div>
                                                    <Plus className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
                                                </div>
                                            ))
                                        ) : (
                                            <div className='p-4 text-center text-sm text-muted-foreground'>
                                                {searchQuery
                                                    ? 'No products match your search'
                                                    : 'Type to search products'}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Selected Products */}
                                {editingGroup.product_ids.length > 0 && (
                                    <div className='mt-2 flex flex-wrap gap-2'>
                                        {editingGroup.products?.map(
                                            (product) => (
                                                <Badge
                                                    key={product._id}
                                                    variant='secondary'
                                                    className='flex items-center gap-1 pr-1 pl-2'
                                                >
                                                    <span className='max-w-[150px] truncate'>
                                                        {product.name}
                                                    </span>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-4 w-4 p-0 hover:bg-transparent'
                                                        onClick={() => {
                                                            setEditingGroup({
                                                                ...editingGroup,
                                                                product_ids:
                                                                    editingGroup.product_ids.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            product._id
                                                                    ),
                                                                products:
                                                                    editingGroup.products?.filter(
                                                                        (p) =>
                                                                            p._id !==
                                                                            product._id
                                                                    )
                                                            });
                                                        }}
                                                    >
                                                        <X className='h-3 w-3' />
                                                    </Button>
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className='flex justify-end gap-2 pt-4'>
                                <Button
                                    variant='outline'
                                    onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setEditingGroup(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveGroup}
                                    disabled={isUpdating}
                                    className='bg-primary text-primary-foreground hover:bg-primary/90'
                                >
                                    {isUpdating && (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    )}
                                    {editingGroup._id
                                        ? 'Update Group'
                                        : 'Add Group'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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
                                    • Create groups to organize new arrivals
                                    (e.g., Tech, Bags, Fashion)
                                </li>
                                <li>
                                    • Each group must have a unique slug for URL
                                    routing
                                </li>
                                <li>
                                    • Add products to groups by searching and
                                    selecting
                                </li>
                                <li>
                                    • Use emojis as icons for visual appeal
                                    (optional)
                                </li>
                                <li>
                                    • Groups are displayed in position order on
                                    homepage
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewArrivalsPage;
