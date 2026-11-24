'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/admin-button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteVariantsByProductIdMutation } from '@/redux/admin/api/product-api';

type TVariantRow = {
    _id: string;
    sku?: string;
    barcode?: string;
    regular_price?: number;
    sale_price?: number;
    attribute_values?: Record<string, string>;
};

type DangerZoneProps = {
    productId: string;
    variants: TVariantRow[];
    /**
     * Call your delete API here. Should throw on error.
     * Must return something like: { deletedCount: number }
     */
};

const DangerZone: React.FC<DangerZoneProps> = ({ productId, variants }) => {
    //  const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const [bulkLoading, setBulkLoading] = useState(false);

    const [onDelete] = useDeleteVariantsByProductIdMutation();

    const filtered = useMemo(() => {
        //   const q = query.trim().toLowerCase();
        const q = ''.trim().toLowerCase();
        if (!q) return variants;

        return variants.filter((v) => {
            const sku = (v.sku || '').toLowerCase();
            const barcode = (v.barcode || '').toLowerCase();
            const attrs = Object.values(v.attribute_values || {})
                .join(' ')
                .toLowerCase();
            return sku.includes(q) || barcode.includes(q) || attrs.includes(q);
        });
    }, [variants]);

    const selectedIds = useMemo(
        () => Object.keys(selected).filter((id) => selected[id]),
        [selected]
    );

    const toggle = (id: string) =>
        setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

    const toggleAll = () => {
        const allVisibleIds = filtered.map((v) => v._id);
        const allSelected = allVisibleIds.every((id) => selected[id]);

        setSelected((prev) => {
            const next = { ...prev };
            for (const id of allVisibleIds) next[id] = !allSelected;
            return next;
        });
    };

    const confirmTextForBulk = `delete ${selectedIds.length} variant(s)`;

    const doDeleteOne = async (id: string) => {
        const ok = window.confirm(
            'This will permanently delete the variant (unless your backend uses soft delete). Continue?'
        );
        if (!ok) return;

        try {
            setLoadingIds((p) => ({ ...p, [id]: true }));
            const res: any = await onDelete({
                productId: productId,
                variant_ids: [id]
            });
            if (res?.data?.success) {
                toast.success('Variant deleted');
                setSelected((p) => ({ ...p, [id]: false }));
            } else {
                toast.error('Variant delete failed');
            }
        } catch (e: any) {
            toast.error(e?.message || 'Failed to delete variant');
        } finally {
            setLoadingIds((p) => ({ ...p, [id]: false }));
        }
    };

    const doBulkDelete = async () => {
        if (!selectedIds.length) return;

        const confirm = window.prompt(
            `Type "${confirmTextForBulk}" to confirm.`
        );
        if (confirm !== confirmTextForBulk) {
            toast.error('Confirmation text did not match. Cancelled.');
            return;
        }

        try {
            setBulkLoading(true);
            await onDelete({ productId: productId, variant_ids: selectedIds });
            toast.success(`Deleted ${selectedIds.length} variant(s)`);
            setSelected({});
        } catch (e: any) {
            toast.error(e?.message || 'Failed to delete variants');
        } finally {
            setBulkLoading(false);
        }
    };

    return (
        <div className='space-y-4 rounded-lg border border-red-200 bg-red-50/30 p-4'>
            <div className='flex items-start gap-3'>
                <div className='mt-1'>
                    <AlertTriangle className='h-5 w-5 text-red-600' />
                </div>
                <div className='flex-1'>
                    <h3 className='text-base font-semibold text-red-700'>
                        Danger Zone — Delete Variants
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                        Product:{' '}
                        <span className='font-medium'>{productId}</span>.
                        Deleting variants can affect orders, inventory and
                        reporting. Prefer soft delete if you have order
                        references.
                    </p>
                </div>
            </div>

            <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-end'>
                {/* <Input
     value={query}
     onChange={(e) => setQuery(e.target.value)}
     placeholder='Search by SKU / barcode / attributes...'
     className='md:max-w-md'
    /> */}

                <div className='flex items-center gap-2'>
                    <Button
                        type='button'
                        variant='destructive'
                        disabled={!selectedIds.length || bulkLoading}
                        onClick={doBulkDelete}
                    >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete Selected ({selectedIds.length})
                    </Button>
                </div>
            </div>

            <div className='rounded-md border bg-background'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[50px]'>
                                <button
                                    type='button'
                                    onClick={toggleAll}
                                    className='text-xs underline'
                                >
                                    All
                                </button>
                            </TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead>Prices</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className='w-[140px] text-right'>
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filtered.map((v) => {
                            const attrsText = Object.values(
                                v.attribute_values || {}
                            ).join(' - ');
                            const isLoading = !!loadingIds[v._id];

                            return (
                                <TableRow key={v._id}>
                                    <TableCell>
                                        <input
                                            type='checkbox'
                                            checked={!!selected[v._id]}
                                            onChange={() => toggle(v._id)}
                                        />
                                    </TableCell>

                                    <TableCell className='space-y-1'>
                                        <div className='text-sm font-medium'>
                                            {attrsText || '—'}
                                        </div>
                                        <div className='text-xs text-muted-foreground'>
                                            ID: {v._id}
                                        </div>
                                        {v.barcode ? (
                                            <div className='text-xs text-muted-foreground'>
                                                Barcode: {v.barcode}
                                            </div>
                                        ) : null}
                                    </TableCell>

                                    <TableCell>
                                        <div className='text-sm'>
                                            Regular: {v.regular_price ?? '—'}
                                        </div>
                                        <div className='text-sm'>
                                            Sale: {v.sale_price ?? '—'}
                                        </div>
                                    </TableCell>

                                    <TableCell className='font-mono text-sm'>
                                        {v.sku || '—'}
                                    </TableCell>

                                    <TableCell className='text-right'>
                                        <Button
                                            type='button'
                                            variant='destructive'
                                            size='sm'
                                            disabled={isLoading}
                                            onClick={() => doDeleteOne(v._id)}
                                        >
                                            <Trash2 className='mr-2 h-4 w-4' />
                                            {isLoading
                                                ? 'Deleting...'
                                                : 'Delete'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {!filtered.length && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className='py-6 text-center text-sm'
                                >
                                    No variants found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className='text-xs text-muted-foreground'>
                Tip: If you don’t want hard delete, implement the API as
                “archive” instead and keep orders safe.
            </div>
        </div>
    );
};

export default DangerZone;
