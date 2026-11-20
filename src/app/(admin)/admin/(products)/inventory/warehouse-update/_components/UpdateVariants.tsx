'use client';
import { TOutlet } from '@/admin/types/product';
import { TProduct } from '@/admin/types/product';
import React, { FC, useEffect, useState } from 'react';
import { useUpdateInventoryForWarehouseMutation } from '@/admin/redux/api-queries/outlet-api';
import { Button } from '@/admin/components/ui/button';
import { toast } from 'sonner';
import { useGetInventoryByProductAndWarehouseIdQuery } from '@/admin/redux/api-queries/inventory-api';
import AttributesAndVariantsAddOrUpdate, {
    TAttributesAndVariantsData
} from '@/admin/components/shared/AttributesAndVariantsAddOrUpdate';
import { useRouter } from 'next/navigation';

type TProps = {
    selectedProduct: TProduct | null;
    selectedWarehouse: TOutlet | null;
};

const UpdateVariants: FC<TProps> = ({ selectedProduct, selectedWarehouse }) => {
    const [newAttributesAndVariants, setNewAttributesAndVariants] =
        useState<TAttributesAndVariantsData | null>(null);
    const [defaultValue, setDefaultValue] =
        useState<TAttributesAndVariantsData | null>(null);

    const router = useRouter();

    const [updateInventoryApi, { isLoading }] =
        useUpdateInventoryForWarehouseMutation();

    const { data, isFetching: inventoryFetching } =
        useGetInventoryByProductAndWarehouseIdQuery(
            {
                productId: selectedProduct?._id,
                warehouseId: selectedWarehouse?._id
            },
            { skip: !selectedProduct?._id || !selectedWarehouse?._id }
        );

    useEffect(() => {
        if (!inventoryFetching && data?.data?.inventories?.[0]) {
            const inventory = data.data.inventories[0];

            setDefaultValue({
                attributes: inventory.attributes || [],
                variants:
                    inventory.variants?.map((variant: any) => ({
                        attribute_values: variant.attribute_values,
                        regular_price: variant.regular_price,
                        sale_price: variant.sale_price,
                        available_quantity: variant.available_quantity,
                        sku: variant.sku
                    })) || []
            });
        } else {
            setDefaultValue(null);
        }
    }, [data, inventoryFetching]);

    const handleConfirmUpdate = async () => {
        try {
            // validate selected product
            if (!selectedProduct?._id) {
                toast.error('Please select a product.');
                return;
            }

            // validate selected warehouse
            if (!selectedWarehouse?._id) {
                toast.error('Please select a warehouse.');
                return;
            }

            // validate attribute/variant structure
            const variant = newAttributesAndVariants?.variants?.[0];
            const isEmptyAttributeValues =
                !variant ||
                !variant.attribute_values ||
                Object.keys(variant.attribute_values).length === 0;

            if (isEmptyAttributeValues) {
                toast.error(
                    'Please select attribute values before confirming.'
                );
                return;
            }

            // validate attributes array exists
            if (!newAttributesAndVariants?.attributes?.length) {
                toast.error('Please provide at least one attribute.');
                return;
            }

            // format payload
            const payload = {
                product: selectedProduct._id,
                warehouse: selectedWarehouse._id,
                outlet: null,
                attributes: newAttributesAndVariants.attributes, // like ["Size", "Color"]
                variants: newAttributesAndVariants.variants.map((v) => ({
                    attribute_values: v.attribute_values,
                    sale_price: v.sale_price,
                    regular_price: v.regular_price,
                    // available_quantity: v.available_quantity,
                    sku: v.sku
                }))
            };

            // call API
            const res = await updateInventoryApi({ payload }).unwrap();
            if (res?.success) {
                toast.success('Inventory updated successfully!');
                router.push(
                    `/admin/inventory/view/warehouse?warehouse_id=${selectedWarehouse?._id}`
                );
            } else {
                toast.error('Failed to update inventory!');
            }
        } catch (error: any) {
            // show meaningfull message
            const err = error?.data?.errorMessages?.map(
                (errMessage: { path: string; message: string }) =>
                    errMessage?.message
            );

            if (err && err?.length > 0) {
                const errorMessage = err?.join('\n');
                toast.error(errorMessage);
            }
        }
    };

    return (
        <div className='mt-6 space-y-4 rounded-md bg-white p-4'>
            <h3 className='text-xl font-semibold'>
                Update Variants for{' '}
                <span className='text-green-500'>{selectedProduct?.name}</span>
            </h3>

            <AttributesAndVariantsAddOrUpdate
                onChange={setNewAttributesAndVariants}
                defaultRegularPrice={
                    defaultValue?.variants?.[0]?.regular_price || 0
                }
                defaultSalePrice={defaultValue?.variants?.[0]?.sale_price || 0}
                defaultValue={defaultValue}
            />
            <div className='mt-5 flex w-full items-center justify-end'>
                <Button
                    onClick={handleConfirmUpdate}
                    disabled={isLoading}
                    variant={'action'}
                    size={'lg'}
                >
                    {isLoading ? 'Please wait...' : 'Confirm Update'}
                </Button>
            </div>
        </div>
    );
};

export default UpdateVariants;
