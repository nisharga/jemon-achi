'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, Check, X, Loader2, RefreshCcw } from 'lucide-react';

import { useGetAllSubCategoriesQuery } from '@/admin/redux/api-queries/subcategory-api';

import { Button } from '@/admin/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/admin/components/ui/card';
import { Input } from '@/admin/components/ui/input';
import { Textarea } from '@/admin/components/ui/textarea';
import { Switch } from '@/admin/components/ui/switch';
import { Label } from '@/admin/components/ui/label';
import { Separator } from '@/admin/components/ui/separator';
import { Badge } from '@/admin/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { Checkbox } from '@/admin/components/ui/checkbox';
import { ScrollArea } from '@/admin/components/ui/scroll-area';
import { Skeleton } from '@/admin/components/ui/skeleton';
import {
    useGetOfferPageQuery,
    usePutOfferPageMutation
} from '@/admin/redux/api-queries/offerpage-api';

type TOfferTimerMode = 'countdown' | '12h_timer' | '24h_timer';

type TOfferForm = {
    offer_start_date: string; // yyyy-mm-dd
    validFor: number;
    discountPercentage: number;
    freeDelivery: boolean;
    specialSaleActive: boolean;
    navbar_label: string;
    applied_subcategory: string[];
    pageConf: {
        title: string;
        header: {
            label: string;
            title_1: string;
            title_2: string;
            description: string;
            button_label: string;
        };
        timer_config: {
            show_timer: boolean;
            mode: TOfferTimerMode;
        };
    };
};

const DEFAULT_FORM: TOfferForm = {
    offer_start_date: new Date().toISOString().slice(0, 10),
    validFor: 7,
    discountPercentage: 20,
    freeDelivery: false,
    specialSaleActive: false,
    navbar_label: 'Special Offer',
    applied_subcategory: [],
    pageConf: {
        title: 'Hot Offers | Griipbuddy',
        header: {
            label: 'Special Offer',
            title_1: 'Limited Time Offers!',
            title_2: 'Discount Available Today',
            description: 'Grab your favorites before they are gone.',
            button_label: 'Shop Now'
        },
        timer_config: {
            show_timer: true,
            mode: 'countdown'
        }
    }
};

const clamp = (n: number, min: number, max: number) =>
    Math.min(max, Math.max(min, n));

const OfferPageManagement = () => {
    // ✅ load all subcategories
    const { data: getSubCategories, isLoading: isSubLoading } =
        useGetAllSubCategoriesQuery({ limit: 10000 });

    const subcategories = getSubCategories?.data?.subcategories || [];

    // load offer page config
    const {
        data: offerRes,
        isLoading: isOfferLoading,
        refetch
    } = useGetOfferPageQuery(undefined);
    const offerFromApi = offerRes?.data ?? null;

    const [putOfferPage, { isLoading: isSaving }] = usePutOfferPageMutation();

    // UI state
    const [form, setForm] = useState<TOfferForm>(DEFAULT_FORM);
    const [search, setSearch] = useState('');
    const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(
        {}
    );
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);

    // hydrate form from API (first load)
    useEffect(() => {
        if (!offerFromApi) return;

        const start = offerFromApi?.offer_start_date
            ? new Date(offerFromApi.offer_start_date).toISOString().slice(0, 10)
            : DEFAULT_FORM.offer_start_date;

        // ✅ supports both names + both shapes (ids or populated objects)
        const rawApplied =
            offerFromApi?.applied_subcategory ??
            offerFromApi?.applied_subcategories ??
            [];

        const appliedIds: string[] = Array.isArray(rawApplied)
            ? rawApplied
                  .map((x: any) => (typeof x === 'string' ? x : x?._id))
                  .filter(Boolean)
                  .map((id: any) => String(id))
            : [];

        const mapped: TOfferForm = {
            offer_start_date: start,
            validFor: Number(offerFromApi?.validFor ?? DEFAULT_FORM.validFor),
            discountPercentage: Number(
                offerFromApi?.discountPercentage ??
                    DEFAULT_FORM.discountPercentage
            ),
            freeDelivery: Boolean(
                offerFromApi?.freeDelivery ?? DEFAULT_FORM.freeDelivery
            ),
            specialSaleActive: Boolean(
                offerFromApi?.specialSaleActive ??
                DEFAULT_FORM.specialSaleActive
            ),
            navbar_label: String(
                offerFromApi?.navbar_label ?? DEFAULT_FORM.navbar_label
            ),

            // ✅ THIS is the key fix:
            applied_subcategory: appliedIds,

            pageConf: {
                title:
                    offerFromApi?.pageConf?.title ??
                    DEFAULT_FORM.pageConf.title,
                header: {
                    label:
                        offerFromApi?.pageConf?.header?.label ??
                        DEFAULT_FORM.pageConf.header.label,
                    title_1:
                        offerFromApi?.pageConf?.header?.title_1 ??
                        DEFAULT_FORM.pageConf.header.title_1,
                    title_2:
                        offerFromApi?.pageConf?.header?.title_2 ??
                        DEFAULT_FORM.pageConf.header.title_2,
                    description:
                        offerFromApi?.pageConf?.header?.description ??
                        DEFAULT_FORM.pageConf.header.description,
                    button_label:
                        offerFromApi?.pageConf?.header?.button_label ??
                        DEFAULT_FORM.pageConf.header.button_label
                },
                timer_config: {
                    show_timer: Boolean(
                        offerFromApi?.pageConf?.timer_config?.show_timer ??
                        DEFAULT_FORM.pageConf.timer_config.show_timer
                    ),
                    mode:
                        (offerFromApi?.pageConf?.timer_config
                            ?.mode as TOfferTimerMode) ??
                        DEFAULT_FORM.pageConf.timer_config.mode
                }
            }
        };

        setForm(mapped);
    }, [offerFromApi]);

    const selectAllRef = React.useRef<HTMLButtonElement | null>(null);

    // group by category
    const grouped = useMemo(() => {
        const q = search.trim().toLowerCase();

        const filtered = subcategories.filter((s: any) => {
            const name =
                `${s?.name_en ?? ''} ${s?.name_bn ?? ''} ${s?.slug ?? ''} ${
                    s?.category?.name_en ?? ''
                }`.toLowerCase();

            const matchSearch = q ? name.includes(q) : true;
            const matchSelected = showSelectedOnly
                ? form.applied_subcategory.includes(s._id)
                : true;

            return matchSearch && matchSelected;
        });

        const map = new Map<
            string,
            {
                categoryId: string;
                categoryName: string;
                categorySlug?: string;
                items: any[];
            }
        >();

        for (const s of filtered) {
            const catId = s?.category?._id || 'uncategorized';
            const catName =
                s?.category?.name_en || s?.category?.slug || 'Uncategorized';
            const catSlug = s?.category?.slug;

            if (!map.has(catId)) {
                map.set(catId, {
                    categoryId: catId,
                    categoryName: catName,
                    categorySlug: catSlug,
                    items: []
                });
            }
            map.get(catId)!.items.push(s);
        }

        // sort categories by name, and items by position/name
        const arr = Array.from(map.values())
            .map((g) => ({
                ...g,
                items: g.items.sort((a, b) => {
                    const ap = Number(a?.position ?? 0);
                    const bp = Number(b?.position ?? 0);
                    if (ap !== bp) return ap - bp;
                    return String(a?.name_en ?? '').localeCompare(
                        String(b?.name_en ?? '')
                    );
                })
            }))
            .sort((a, b) => a.categoryName.localeCompare(b.categoryName));

        return arr;
    }, [subcategories, search, showSelectedOnly, form.applied_subcategory]);

    // quick lookup for selected badges
    const selectedSubMap = useMemo(() => {
        const m = new Map<string, any>();
        for (const s of subcategories) m.set(String(s._id), s);
        return m;
    }, [subcategories]);

    const selectedCount = form.applied_subcategory.length;

    const toggleSub = (id: string) => {
        setForm((prev) => {
            const exists = prev.applied_subcategory.includes(id);
            const next = exists
                ? prev.applied_subcategory.filter((x) => x !== id)
                : [...prev.applied_subcategory, id];
            return { ...prev, applied_subcategory: next };
        });
    };

    const selectAllVisible = () => {
        const visibleIds = grouped.flatMap((g) =>
            g.items.map((i) => String(i._id))
        );
        if (visibleIds.length === 0) return;

        setForm((prev) => {
            const set = new Set(prev.applied_subcategory);
            for (const id of visibleIds) set.add(id);
            return { ...prev, applied_subcategory: Array.from(set) };
        });

        toast.success(`Selected ${visibleIds.length} subcategories`);
    };

    const clearVisible = () => {
        const visibleIds = new Set(
            grouped.flatMap((g) => g.items.map((i) => String(i._id)))
        );

        setForm((prev) => ({
            ...prev,
            applied_subcategory: prev.applied_subcategory.filter(
                (id) => !visibleIds.has(id)
            )
        }));

        toast.message('Cleared visible selections');
    };

    const clearAllSelected = () => {
        setForm((prev) => ({ ...prev, applied_subcategory: [] }));
        toast.message('All selections cleared');
    };

    const resetToDefault = () => {
        setForm(DEFAULT_FORM);
        toast.message('Reset to defaults');
    };

    const validateBeforeSave = () => {
        if (!form.navbar_label.trim()) return 'Navbar label is required';
        if (form.navbar_label.trim().length > 20)
            return 'Navbar label must be within 20 characters';
        if (!form.pageConf.title.trim()) return 'SEO title is required';
        if (selectedCount === 0) return 'Please select at least 1 subcategory';
        if (!form.offer_start_date) return 'Offer start date is required';
        if (form.validFor < 1) return 'Valid days must be at least 1';
        if (form.discountPercentage < 0 || form.discountPercentage > 100)
            return 'Discount must be 0 to 100';
        // Validate that at least one offer type is selected
        if (form.discountPercentage === 0 && !form.freeDelivery)
            return 'At least one offer type (discount or free delivery) must be selected';
        return null;
    };

    const handleSave = async () => {
        const err = validateBeforeSave();
        if (err) {
            toast.error(err);
            return;
        }

        const payload = {
            offer_start_date: form.offer_start_date,
            validFor: Number(form.validFor),
            discountPercentage: Number(form.discountPercentage),
            freeDelivery: Boolean(form.freeDelivery),
            specialSaleActive: Boolean(form.specialSaleActive),
            navbar_label: form.navbar_label.trim(),
            applied_subcategory: form.applied_subcategory,
            pageConf: form.pageConf
        };

        try {
            const res: any = await putOfferPage(payload).unwrap();
            toast.success(res?.message || 'Offer page saved');
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to save offer page');
        }
    };

    const toggleExpand = (catId: string) => {
        setExpandedCats((p) => ({ ...p, [catId]: !p[catId] }));
    };

    const allVisibleIds = useMemo(
        () => grouped.flatMap((g) => g.items.map((i) => String(i._id))),
        [grouped]
    );

    const allVisibleSelected = useMemo(() => {
        if (allVisibleIds.length === 0) return false;
        return allVisibleIds.every((id) =>
            form.applied_subcategory.includes(id)
        );
    }, [allVisibleIds, form.applied_subcategory]);

    const someVisibleSelected = useMemo(() => {
        if (allVisibleIds.length === 0) return false;
        const any = allVisibleIds.some((id) =>
            form.applied_subcategory.includes(id)
        );
        return any && !allVisibleSelected;
    }, [allVisibleIds, form.applied_subcategory, allVisibleSelected]);

    const loading = isSubLoading || isOfferLoading;

    useEffect(() => {
        if (selectAllRef.current) {
            // shadcn Checkbox is a button under the hood
            (selectAllRef.current as any).indeterminate = someVisibleSelected;
        }
    }, [someVisibleSelected]);

    return (
        <div className='space-y-6 p-4'>
            {/* Header */}
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                    <h1 className='text-xl font-semibold md:text-2xl'>
                        Special Global Offer Management
                    </h1>
                    {/* <p className='text-sm text-muted-foreground'>
      Manage your offer banner, timer, discount, and apply it to selected
      subcategories.
     </p> */}
                </div>

                <div className='flex items-center gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => refetch()}
                        disabled={loading}
                    >
                        <RefreshCcw className='mr-2 h-4 w-4' />
                        Refresh
                    </Button>

                    <Button
                        variant='outline'
                        onClick={resetToDefault}
                        disabled={isSaving}
                    >
                        Reset Defaults
                    </Button>

                    <Button
                        className='bg-primary text-primary-foreground hover:bg-primary/90'
                        onClick={handleSave}
                        disabled={loading || isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : null}
                        Save Offer
                    </Button>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 xl:grid-cols-12'>
                {/* Left: Settings */}
                <div className='space-y-6 xl:col-span-7'>
                    <Card className='rounded-2xl'>
                        <CardHeader>
                            <CardTitle>Offer Settings</CardTitle>
                            <CardDescription>
                                These settings control the offer behavior and
                                the offer page content.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className='space-y-5'>
                            {loading ? (
                                <div className='space-y-3'>
                                    <Skeleton className='h-10 w-full' />
                                    <Skeleton className='h-10 w-full' />
                                    <Skeleton className='h-24 w-full' />
                                </div>
                            ) : (
                                <>
                                    <div className='flex items-center justify-between gap-4 rounded-xl border p-4'>
                                        <div>
                                            <p className='font-medium'>
                                                Special Sale Offer Active
                                            </p>
                                            <p className='text-sm text-muted-foreground'>
                                                Turn this ON to show offer on
                                                website & navbar.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={form.specialSaleActive}
                                            onCheckedChange={(v) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    specialSaleActive: v
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                        <div className='space-y-2'>
                                            <Label>Offer Start Date</Label>
                                            <Input
                                                type='date'
                                                value={form.offer_start_date}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        offer_start_date:
                                                            e.target.value
                                                    }))
                                                }
                                            />
                                            <p className='text-xs text-muted-foreground'>
                                                Offer countdown starts from this
                                                date.
                                            </p>
                                        </div>

                                        <div className='space-y-2'>
                                            <Label>Valid For (days)</Label>
                                            <Input
                                                type='number'
                                                min={1}
                                                value={form.validFor}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        validFor: clamp(
                                                            Number(
                                                                e.target
                                                                    .value || 1
                                                            ),
                                                            1,
                                                            365
                                                        )
                                                    }))
                                                }
                                            />
                                            <p className='text-xs text-muted-foreground'>
                                                Example: 7 means offer ends
                                                after 7 days.
                                            </p>
                                        </div>

                                        <div className='space-y-2'>
                                            <Label>Discount Percentage</Label>
                                            <Input
                                                type='number'
                                                min={0}
                                                max={100}
                                                value={form.discountPercentage}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        discountPercentage:
                                                            clamp(
                                                                Number(
                                                                    e.target
                                                                        .value ||
                                                                        0
                                                                ),
                                                                0,
                                                                100
                                                            )
                                                    }))
                                                }
                                            />
                                            <p className='text-xs text-muted-foreground'>
                                                Will be applied in frontend
                                                pricing logic.
                                            </p>
                                        </div>

                                        <div className='flex items-center justify-between gap-4 rounded-xl border p-4'>
                                            <div>
                                                <p className='font-medium'>
                                                    Free Delivery
                                                </p>
                                                <p className='text-sm text-muted-foreground'>
                                                    Enable free delivery for
                                                    offer products.
                                                </p>
                                            </div>
                                            <Switch
                                                checked={form.freeDelivery}
                                                onCheckedChange={(v) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        freeDelivery: v
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div className='invisible space-y-2'>
                                            <Label>
                                                Navbar Label (max 20 chars)
                                            </Label>
                                            <Input
                                                value={form.navbar_label}
                                                maxLength={20}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        navbar_label:
                                                            e.target.value
                                                    }))
                                                }
                                            />
                                            <p className='text-xs text-muted-foreground'>
                                                Short label shown in navbar
                                                (example: Year End Sale).
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* temporary invisible */}
                                    <div className='invisible'>
                                        <div className='space-y-3'>
                                            <Label>SEO Title</Label>
                                            <Input
                                                value={form.pageConf.title}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        pageConf: {
                                                            ...p.pageConf,
                                                            title: e.target
                                                                .value
                                                        }
                                                    }))
                                                }
                                                placeholder='Offer page SEO title'
                                            />
                                        </div>

                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <div className='space-y-2'>
                                                <Label>Header Label</Label>
                                                <Input
                                                    value={
                                                        form.pageConf.header
                                                            .label
                                                    }
                                                    onChange={(e) =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            pageConf: {
                                                                ...p.pageConf,
                                                                header: {
                                                                    ...p
                                                                        .pageConf
                                                                        .header,
                                                                    label: e
                                                                        .target
                                                                        .value
                                                                }
                                                            }
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>Button Label</Label>
                                                <Input
                                                    value={
                                                        form.pageConf.header
                                                            .button_label
                                                    }
                                                    onChange={(e) =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            pageConf: {
                                                                ...p.pageConf,
                                                                header: {
                                                                    ...p
                                                                        .pageConf
                                                                        .header,
                                                                    button_label:
                                                                        e.target
                                                                            .value
                                                                }
                                                            }
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>Title Line 1</Label>
                                                <Input
                                                    value={
                                                        form.pageConf.header
                                                            .title_1
                                                    }
                                                    onChange={(e) =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            pageConf: {
                                                                ...p.pageConf,
                                                                header: {
                                                                    ...p
                                                                        .pageConf
                                                                        .header,
                                                                    title_1:
                                                                        e.target
                                                                            .value
                                                                }
                                                            }
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>Title Line 2</Label>
                                                <Input
                                                    value={
                                                        form.pageConf.header
                                                            .title_2
                                                    }
                                                    onChange={(e) =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            pageConf: {
                                                                ...p.pageConf,
                                                                header: {
                                                                    ...p
                                                                        .pageConf
                                                                        .header,
                                                                    title_2:
                                                                        e.target
                                                                            .value
                                                                }
                                                            }
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className='space-y-2'>
                                            <Label>Description</Label>
                                            <Textarea
                                                value={
                                                    form.pageConf.header
                                                        .description
                                                }
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        pageConf: {
                                                            ...p.pageConf,
                                                            header: {
                                                                ...p.pageConf
                                                                    .header,
                                                                description:
                                                                    e.target
                                                                        .value
                                                            }
                                                        }
                                                    }))
                                                }
                                                rows={4}
                                                placeholder='Write a simple description for customers'
                                            />
                                        </div>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <div className='flex items-center justify-between gap-4 rounded-xl border p-4'>
                                                <div>
                                                    <p className='font-medium'>
                                                        Show Timer
                                                    </p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        Display countdown /
                                                        timer on the offer page.
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={
                                                        form.pageConf
                                                            .timer_config
                                                            .show_timer
                                                    }
                                                    onCheckedChange={(v) =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            pageConf: {
                                                                ...p.pageConf,
                                                                timer_config: {
                                                                    ...p
                                                                        .pageConf
                                                                        .timer_config,
                                                                    show_timer:
                                                                        v
                                                                }
                                                            }
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>Timer Mode</Label>
                                                <Select
                                                    value={
                                                        form.pageConf
                                                            .timer_config.mode
                                                    }
                                                    onValueChange={(v) =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            pageConf: {
                                                                ...p.pageConf,
                                                                timer_config: {
                                                                    ...p
                                                                        .pageConf
                                                                        .timer_config,
                                                                    mode: v as TOfferTimerMode
                                                                }
                                                            }
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select timer mode' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='countdown'>
                                                            Countdown
                                                        </SelectItem>
                                                        <SelectItem value='12h_timer'>
                                                            12 Hours Timer
                                                        </SelectItem>
                                                        <SelectItem value='24h_timer'>
                                                            24 Hours Timer
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className='text-xs text-muted-foreground'>
                                                    Countdown is recommended for
                                                    campaigns.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action row */}
                    <Card className='rounded-2xl'>
                        <CardContent className='flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between'>
                            <div>
                                <p className='font-medium'>Quick Actions</p>
                                <p className='text-sm text-muted-foreground'>
                                    Manage selections faster and safer.
                                </p>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                <Button
                                    variant='outline'
                                    onClick={clearAllSelected}
                                    disabled={loading || isSaving}
                                >
                                    Clear All Selected
                                </Button>
                                <Button
                                    variant='outline'
                                    onClick={resetToDefault}
                                    disabled={loading || isSaving}
                                >
                                    Reset Form
                                </Button>
                                <Button
                                    className='bg-primary text-primary-foreground hover:bg-primary/90'
                                    onClick={handleSave}
                                    disabled={loading || isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : null}
                                    Save Offer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Subcategory selector */}
                <div className='space-y-6 xl:col-span-5'>
                    <Card className='rounded-2xl'>
                        <CardHeader>
                            <div className='flex items-start justify-between gap-4'>
                                <div>
                                    <CardTitle>Apply Offer</CardTitle>
                                    <CardDescription>
                                        Select which subcategories will have
                                        this offer.
                                    </CardDescription>
                                </div>

                                <div className='text-right'>
                                    <p className='text-sm text-muted-foreground'>
                                        Selected
                                    </p>
                                    <p className='text-2xl font-semibold text-primary'>
                                        {selectedCount}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className='space-y-4'>
                            {/* Search + filters */}
                            <div className='flex items-center gap-2'>
                                <div className='relative w-full'>
                                    <Search className='absolute top-3 left-3 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        className='pl-9'
                                        placeholder='Search subcategory (Tools, Beauty, slug, category...)'
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                <Button
                                    variant='outline'
                                    onClick={() => setSearch('')}
                                    disabled={!search}
                                    title='Clear search'
                                >
                                    <X className='h-4 w-4' />
                                </Button>
                            </div>

                            <div className='flex items-center justify-between gap-3 rounded-xl border p-3'>
                                <div className='space-y-0.5'>
                                    <p className='font-medium'>
                                        Show Selected Only
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Helpful when reviewing large lists.
                                    </p>
                                </div>
                                <Switch
                                    checked={showSelectedOnly}
                                    onCheckedChange={setShowSelectedOnly}
                                />
                            </div>

                            {/* Select all row */}
                            <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        ref={selectAllRef}
                                        checked={allVisibleSelected}
                                        onCheckedChange={() => {
                                            if (allVisibleSelected)
                                                clearVisible();
                                            else selectAllVisible();
                                        }}
                                    />
                                    <p className='text-sm'>
                                        Select All (visible)
                                        <span className='text-muted-foreground'>
                                            {' '}
                                            • {allVisibleIds.length} items
                                        </span>
                                    </p>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <Button
                                        variant='outline'
                                        onClick={selectAllVisible}
                                        disabled={
                                            loading ||
                                            allVisibleIds.length === 0
                                        }
                                    >
                                        <Check className='mr-2 h-4 w-4' />
                                        Select All
                                    </Button>
                                    <Button
                                        variant='outline'
                                        onClick={clearVisible}
                                        disabled={
                                            loading ||
                                            allVisibleIds.length === 0
                                        }
                                    >
                                        Clear Visible
                                    </Button>
                                </div>
                            </div>

                            {/* Selected chips */}
                            {selectedCount > 0 && (
                                <div className='rounded-xl border bg-muted/20 p-3'>
                                    <p className='mb-2 text-sm font-medium'>
                                        Selected Subcategories
                                    </p>
                                    <div className='flex flex-wrap gap-2'>
                                        {form.applied_subcategory
                                            .slice(0, 20)
                                            .map((id) => {
                                                const s: any =
                                                    selectedSubMap.get(id);
                                                const label =
                                                    s?.name_en || s?.slug || id;
                                                return (
                                                    <Badge
                                                        key={id}
                                                        variant='secondary'
                                                        className='flex items-center gap-2'
                                                    >
                                                        <span className='max-w-[180px] truncate'>
                                                            {label}
                                                        </span>
                                                        <button
                                                            type='button'
                                                            onClick={() =>
                                                                toggleSub(id)
                                                            }
                                                            className='opacity-70 hover:opacity-100'
                                                            title='Remove'
                                                        >
                                                            <X className='h-3 w-3' />
                                                        </button>
                                                    </Badge>
                                                );
                                            })}
                                        {selectedCount > 20 && (
                                            <Badge variant='outline'>
                                                +{selectedCount - 20} more
                                            </Badge>
                                        )}
                                    </div>
                                    <p className='mt-2 text-xs text-muted-foreground'>
                                        Tip: use search to quickly remove/edit
                                        selections.
                                    </p>
                                </div>
                            )}

                            <Separator />

                            {/* List */}
                            <div className='overflow-hidden rounded-xl border'>
                                <div className='flex items-center justify-between bg-muted/30 px-4 py-3'>
                                    <p className='text-sm font-medium'>
                                        Subcategory List
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Grouped by category
                                    </p>
                                </div>

                                <ScrollArea className='h-[520px]'>
                                    <div className='p-2'>
                                        {loading ? (
                                            <div className='space-y-2 p-2'>
                                                {Array.from({ length: 10 }).map(
                                                    (_, i) => (
                                                        <Skeleton
                                                            key={i}
                                                            className='h-10 w-full'
                                                        />
                                                    )
                                                )}
                                            </div>
                                        ) : grouped.length === 0 ? (
                                            <div className='p-6 text-center'>
                                                <p className='font-medium'>
                                                    No subcategories found
                                                </p>
                                                <p className='text-sm text-muted-foreground'>
                                                    Try another search or turn
                                                    off “Selected only”.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className='space-y-3'>
                                                {grouped.map((g) => {
                                                    const isOpen =
                                                        expandedCats[
                                                            g.categoryId
                                                        ] ?? true;
                                                    const selectedInGroup =
                                                        g.items.filter((i) =>
                                                            form.applied_subcategory.includes(
                                                                String(i._id)
                                                            )
                                                        ).length;

                                                    return (
                                                        <div
                                                            key={g.categoryId}
                                                            className='rounded-xl border'
                                                        >
                                                            <button
                                                                type='button'
                                                                className='flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 transition hover:bg-muted/20'
                                                                onClick={() =>
                                                                    toggleExpand(
                                                                        g.categoryId
                                                                    )
                                                                }
                                                            >
                                                                <div className='text-left'>
                                                                    <p className='font-medium'>
                                                                        {
                                                                            g.categoryName
                                                                        }
                                                                        <span className='text-xs text-muted-foreground'>
                                                                            {' '}
                                                                            (
                                                                            {
                                                                                g
                                                                                    .items
                                                                                    .length
                                                                            }
                                                                            )
                                                                        </span>
                                                                    </p>
                                                                    <p className='text-xs text-muted-foreground'>
                                                                        Selected
                                                                        in this
                                                                        category:{' '}
                                                                        <span className='font-medium text-primary'>
                                                                            {
                                                                                selectedInGroup
                                                                            }
                                                                        </span>
                                                                    </p>
                                                                </div>

                                                                <div className='flex items-center gap-2'>
                                                                    {selectedInGroup >
                                                                        0 && (
                                                                        <Badge className='bg-primary text-primary-foreground'>
                                                                            {
                                                                                selectedInGroup
                                                                            }{' '}
                                                                            selected
                                                                        </Badge>
                                                                    )}
                                                                    <span className='text-sm text-muted-foreground'>
                                                                        {isOpen
                                                                            ? 'Hide'
                                                                            : 'Show'}
                                                                    </span>
                                                                </div>
                                                            </button>

                                                            {isOpen && (
                                                                <div className='space-y-1 p-2'>
                                                                    {g.items.map(
                                                                        (
                                                                            s: any
                                                                        ) => {
                                                                            const id =
                                                                                String(
                                                                                    s._id
                                                                                );
                                                                            const checked =
                                                                                form.applied_subcategory.includes(
                                                                                    id
                                                                                );

                                                                            return (
                                                                                <label
                                                                                    key={
                                                                                        id
                                                                                    }
                                                                                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-muted/20 ${
                                                                                        checked
                                                                                            ? 'bg-primary/5'
                                                                                            : ''
                                                                                    }`}
                                                                                >
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            checked
                                                                                        }
                                                                                        onCheckedChange={() =>
                                                                                            toggleSub(
                                                                                                id
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    <div className='min-w-0'>
                                                                                        <p className='truncate text-sm font-medium'>
                                                                                            {s?.name_en ||
                                                                                                s?.slug}
                                                                                        </p>
                                                                                        <p className='truncate text-xs text-muted-foreground'>
                                                                                            {
                                                                                                s?.slug
                                                                                            }{' '}
                                                                                            •
                                                                                            position{' '}
                                                                                            {s?.position ??
                                                                                                0}
                                                                                        </p>
                                                                                    </div>
                                                                                </label>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Friendly preview */}
                    {/* temporary invisible */}
                    <Card className='invisible rounded-2xl'>
                        <CardHeader>
                            <CardTitle>Quick Preview</CardTitle>
                            <CardDescription>
                                This is roughly what customers will see
                                (text-only).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            <div className='rounded-xl border p-4'>
                                <p className='text-xs text-muted-foreground'>
                                    Navbar Label
                                </p>
                                <p className='text-base font-semibold'>
                                    {form.navbar_label || '—'}
                                </p>
                            </div>

                            <div className='rounded-xl border p-4'>
                                <p className='text-xs text-muted-foreground'>
                                    {form.pageConf.header.label}
                                </p>
                                <p className='text-lg font-semibold'>
                                    {form.pageConf.header.title_1}
                                </p>
                                <p className='text-lg font-semibold text-primary'>
                                    {form.pageConf.header.title_2}
                                </p>
                                <p className='mt-2 text-sm text-muted-foreground'>
                                    {form.pageConf.header.description}
                                </p>
                                <Button className='mt-3 bg-primary text-primary-foreground hover:bg-primary/90'>
                                    {form.pageConf.header.button_label}
                                </Button>
                            </div>

                            <div className='flex items-center justify-between rounded-xl border p-4'>
                                <div>
                                    <p className='text-sm font-medium'>
                                        Timer:{' '}
                                        {form.pageConf.timer_config.show_timer
                                            ? 'ON'
                                            : 'OFF'}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Mode: {form.pageConf.timer_config.mode}
                                    </p>
                                </div>
                                <Badge variant='secondary'>
                                    {form.specialSaleActive
                                        ? 'Active'
                                        : 'Inactive'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OfferPageManagement;
