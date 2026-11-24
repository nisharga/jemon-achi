'use client';

import type { TInventory } from '@/types/admin/product';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/admin-card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/admin-collapsible';
import { Badge } from '@/components/ui/admin-badge';
import { ChevronsDown, ChevronsRight, Package } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { BarcodeImage } from './barcode-image';
import { cn } from '@/lib/admin-utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { getImgFullUrl } from '@/lib/admin-utils';

type InventoryTableProps = {
    inventories: TInventory[];
};

const InventoryTable = ({ inventories }: InventoryTableProps) => {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems?.has(id)) {
            newOpenItems?.delete(id);
        } else {
            newOpenItems?.add(id);
        }
        setOpenItems(newOpenItems);
    };

    // const getTotalQuantity = (variants: TInventory["variants"]) => {
    //   return variants?.reduce(
    //     (total, variant) => total + variant?.available_quantity,
    //     0
    //   );
    // };

    // console.log("inventories", inventories);

    return (
        <div className='overflow-hidden'>
            {inventories?.map((inventory) => {
                const isOpen = openItems.has(inventory?._id);
                // const totalQuantity = getTotalQuantity(inventory?.variants);
                const totalQuantity = 0;

                return (
                    <Card
                        key={inventory?._id}
                        className='w-full overflow-hidden border-4 py-0 shadow-none md:py-0'
                    >
                        <Collapsible>
                            <CollapsibleTrigger
                                onClick={() => toggleItem(inventory?._id)}
                                className={cn('w-full', {
                                    'border-b bg-muted/50': isOpen
                                })}
                            >
                                <CardHeader className='transition-colors hover:bg-muted/50'>
                                    <div className='mt-1.5 flex items-center justify-between'>
                                        <div className='flex items-center gap-4'>
                                            {isOpen ? (
                                                <ChevronsDown className='size-5 shrink-0 text-accent-foreground' />
                                            ) : (
                                                <ChevronsRight className='size-5 shrink-0 text-muted-foreground' />
                                            )}
                                            <div className='flex items-center gap-3'>
                                                <Image
                                                    src={
                                                        getImgFullUrl(
                                                            inventory?.product
                                                                ?.thumbnail
                                                        ) || '/placeholder.svg'
                                                    }
                                                    alt={
                                                        inventory?.product?.name
                                                    }
                                                    className='size-8 shrink-0 rounded-md object-cover lg:size-12'
                                                    height={720}
                                                    width={720}
                                                />
                                                <div className='text-left'>
                                                    <CardTitle className='text-sm font-medium text-wrap lg:text-base'>
                                                        {
                                                            inventory?.product
                                                                ?.name
                                                        }
                                                    </CardTitle>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='hidden items-center gap-4 lg:flex'>
                                            <Badge
                                                variant='secondary'
                                                className='flex items-center gap-1'
                                            >
                                                <Package className='h-3 w-3' />
                                                {totalQuantity} units
                                            </Badge>
                                            <Badge variant='outline'>
                                                {inventory.variants.length}{' '}
                                                variant
                                                {inventory.variants.length !== 1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <CardContent className='space-y-4 py-4 lg:py-6'>
                                    {/* description and delivery time */}
                                    {/* <div className="grid gap-6">
                      <div className="space-y-2">
                        <p>Description</p>
                        <div
                          className="text-wrap"
                          dangerouslySetInnerHTML={{
                            __html: inventory?.product?.description,
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Delivery:</span>{" "}
                          {inventory?.product?.approximately_delivery_time}
                        </p>
                        {inventory?.product?.is_free_delivery && (
                          <Badge variant="secondary" className="text-xs">
                            Free Delivery
                          </Badge>
                        )}
                      </div>
                    </div> */}

                                    {/* Variants Table */}
                                    <div>
                                        {/* <h4 className="font-semibold mb-4">Variants</h4> */}
                                        <div className='overflow-hidden rounded-lg border'>
                                            <div className='overflow-x-auto'>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className='px-4'>
                                                                Items
                                                            </TableHead>
                                                            <TableHead className='px-4'>
                                                                SKU
                                                            </TableHead>
                                                            <TableHead className='px-4'>
                                                                Regular Price
                                                            </TableHead>
                                                            <TableHead className='px-4'>
                                                                {' '}
                                                                Sale Price
                                                            </TableHead>
                                                            <TableHead className='px-4'>
                                                                {' '}
                                                                Quantity
                                                            </TableHead>
                                                            <TableHead className='px-4'>
                                                                {' '}
                                                                Barcode
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {inventory?.variants?.map(
                                                            (
                                                                variant,
                                                                index
                                                            ) => {
                                                                // product variant
                                                                const formatedVariant =
                                                                    Object.entries(
                                                                        variant?.attribute_values ||
                                                                            {}
                                                                    )?.map(
                                                                        (
                                                                            item
                                                                        ) =>
                                                                            item?.[1]
                                                                    );
                                                                return (
                                                                    <TableRow
                                                                        key={
                                                                            variant?._id
                                                                        }
                                                                        className={
                                                                            index %
                                                                                2 ===
                                                                            0
                                                                                ? 'bg-background'
                                                                                : 'bg-muted/25'
                                                                        }
                                                                    >
                                                                        <TableCell className='px-4'>
                                                                            <div className='max-w-80 min-w-60 text-sm font-medium text-wrap'>
                                                                                {inventory?.product?.name.slice(
                                                                                    0,
                                                                                    20
                                                                                )}
                                                                                ...
                                                                                (
                                                                                {formatedVariant.join(
                                                                                    ' - '
                                                                                )}

                                                                                )
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className='px-4 font-mono text-sm'>
                                                                            {
                                                                                variant?.sku
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className='px-4'>
                                                                            <span
                                                                                className={
                                                                                    variant?.sale_price <
                                                                                    variant?.regular_price
                                                                                        ? 'text-muted-foreground line-through'
                                                                                        : ''
                                                                                }
                                                                            >
                                                                                ৳
                                                                                {
                                                                                    variant?.regular_price
                                                                                }
                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell className='px-4'>
                                                                            {variant?.sale_price <
                                                                            variant?.regular_price ? (
                                                                                <span className='font-medium'>
                                                                                    ৳
                                                                                    {
                                                                                        variant?.sale_price
                                                                                    }
                                                                                </span>
                                                                            ) : (
                                                                                <span>
                                                                                    ৳
                                                                                    {
                                                                                        variant?.sale_price
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className='px-4'>
                                                                            <Badge variant='outline'>
                                                                                {
                                                                                    0
                                                                                }
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className='px-4 font-mono text-sm'>
                                                                            <BarcodeImage
                                                                                barcode={
                                                                                    variant?.barcode
                                                                                }
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            }
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                );
            })}
        </div>
    );
};

export default InventoryTable;
