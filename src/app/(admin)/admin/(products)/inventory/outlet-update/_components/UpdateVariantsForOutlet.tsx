import React, { FC, useEffect, useState } from 'react';
import {
    useGetInventoryByProductAndOutletIdQuery,
    useGetInventoryByProductAndWarehouseIdQuery
} from '@/redux/api-queries/inventory-api';
import { TProduct, TOutlet, TVariantCombination } from '@/types/product';
import { Button } from '@/components/ui/admin-button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/admin-card';
import { Input } from '@/components/ui/admin-input';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateInventoryWarehouseToOutletMutation } from '@/redux/api-queries/outlet-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface VariantForm {
    attribute_values: Record<string, string>;
    sku: string;
    barcode: string;
    available_quantity: string | number;
    selected: boolean;
    max_quantity: number;
    regular_price: number;
    sale_price: number;
}

type TProps = {
    selectedProduct: TProduct | null;
    selectedOutlet: TOutlet | null;
    selectedWarehouse: TOutlet | null;
};

const UpdateVariantsForOutlet: FC<TProps> = ({
    selectedOutlet,
    selectedProduct,
    selectedWarehouse
}) => {
    const {
        data: warehouseInventoryResData,
        isLoading: warehouseInventoryLoading
    } = useGetInventoryByProductAndWarehouseIdQuery(
        {
            warehouseId: selectedWarehouse?._id,
            productId: selectedProduct?._id
        },
        { skip: !selectedProduct?._id || !selectedWarehouse?._id }
    );

    const { data: outletInventoryResData } =
        useGetInventoryByProductAndOutletIdQuery(
            { outletId: selectedOutlet?._id, productId: selectedProduct?._id },
            { skip: !selectedProduct?._id || !selectedOutlet?._id }
        );

    const router = useRouter();

    const [updateOutletApi, { isLoading }] =
        useUpdateInventoryWarehouseToOutletMutation();

    const [formVariants, setFormVariants] = useState<VariantForm[]>([]);

    useEffect(() => {
        if (!warehouseInventoryResData?.data?.inventories?.length) return;
        const inventory = warehouseInventoryResData.data.inventories[0];
        const mappedVariants = inventory.variants.map(
            (variant: TVariantCombination) => ({
                attribute_values: variant.attribute_values,
                sku: variant.sku,
                barcode: variant.barcode || '',
                available_quantity: '',
                selected: false,
                // max_quantity: variant.available_quantity || 0,
                regular_price: variant.regular_price || 0,
                sale_price: variant.sale_price || 0
            })
        );
        setFormVariants(mappedVariants);
    }, [warehouseInventoryResData]);

    const handleInputChange = (index: number, value: string) => {
        const updated = [...formVariants];
        if (value === '' || /^\d+$/.test(value)) {
            const num =
                value === ''
                    ? ''
                    : Math.min(Number(value), updated[index].max_quantity);
            updated[index].available_quantity = num;
            setFormVariants(updated);
        }
    };

    const handleCheckboxChange = (index: number, checked: boolean) => {
        const updated = [...formVariants];
        updated[index].selected = checked;
        setFormVariants(updated);
    };

    const handleSubmit = async () => {
        if (!selectedProduct || !selectedWarehouse || !selectedOutlet) return;

        const selectedVariants = formVariants.filter((v) => v.selected);
        if (!selectedVariants.length) return;

        const attributes = selectedVariants.length
            ? warehouseInventoryResData?.data?.inventories[0]?.attributes || []
            : '';

        const payload = {
            product: selectedProduct._id,
            warehouse: selectedWarehouse._id,
            outlet: selectedOutlet._id,
            attributes,
            variants: selectedVariants.map(
                ({
                    attribute_values,
                    sku,
                    available_quantity,
                    regular_price,
                    sale_price,
                    barcode
                }) => ({
                    attribute_values,
                    sku,
                    available_quantity: Number(available_quantity),
                    regular_price,
                    sale_price,
                    barcode: barcode || ''
                })
            )
        };

        try {
            const res: any = await updateOutletApi({ payload });
            if (res?.data?.success) {
                toast.success('Outlet Inventory Updated!');
                router.push(
                    `/admin/inventory/view/outlet?outlet_id=${selectedOutlet._id}`
                );
            } else {
                toast.error('Outlet Inventory Update failed!');
            }
        } catch (error: any) {
            toast.error('Outlet Inventory Update failed!');
            console.log('Error:', error);
        }
    };

    return (
        <Card className='mt-6'>
            <CardHeader>
                <CardTitle>Transfer Inventory to Outlet</CardTitle>
            </CardHeader>
            <CardContent>
                {warehouseInventoryLoading ? (
                    <p>Loading warehouse inventory...</p>
                ) : (
                    <div className='space-y-4'>
                        {formVariants.map((variant, index) => {
                            const outletVariant =
                                outletInventoryResData?.data?.inventories?.[0]?.variants?.find(
                                    (v: TVariantCombination) =>
                                        JSON.stringify(v.attribute_values) ===
                                        JSON.stringify(variant.attribute_values)
                                );

                            return (
                                <div
                                    key={index}
                                    className='space-y-2 rounded-md border p-4 shadow-md'
                                >
                                    <div className='flex items-center gap-4'>
                                        <Checkbox
                                            checked={variant.selected}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(
                                                    index,
                                                    checked as boolean
                                                )
                                            }
                                        />
                                        <span className='text-sm'>
                                            SKU: {variant.sku}
                                        </span>
                                        <span className='text-sm'>
                                            {Object.entries(
                                                variant.attribute_values || {}
                                            )
                                                .map(
                                                    ([key, val]) =>
                                                        `${key}: ${val}`
                                                )
                                                .join(', ')}
                                        </span>
                                        <span className='ml-auto text-sm text-muted-foreground'>
                                            <span className='text-green-500'>
                                                In Warehouse:{' '}
                                                {variant.max_quantity}
                                            </span>{' '}
                                            |{' '}
                                            <span className='text-yellow-500'>
                                                In Outlet:{' '}
                                                {outletVariant?.available_quantity ||
                                                    0}
                                            </span>
                                        </span>
                                    </div>
                                    <div>
                                        <label className='mb-1 block text-sm'>
                                            Quantity to Transfer
                                        </label>
                                        <Input
                                            type='text'
                                            inputMode='numeric'
                                            placeholder='Quantity'
                                            value={variant.available_quantity}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            disabled={!variant.selected}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Updating' : 'Confirm Update'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UpdateVariantsForOutlet;
