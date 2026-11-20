// "use client";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/admin/components/ui/table";
// import { cn } from "@/admin/lib/utils";
// import React from "react";
// import { format } from "date-fns";
// import { Badge } from "@/admin/components/ui/badge";
// import { IPOSSale } from "@/admin/types/pos-sale";
// import SaleActions from "./sale-actions";

// type PurchaseTableProps = {
//   sales: [];
//   isLoading: boolean;
//   isFetching: boolean;
//   hasPermission?: boolean;
//   isPermissionLoading?: boolean;
// };

// const TABLE_HEADERS = [
//   "Actions",
//   "Date",
//   "Sale, Invoice No.",
//   "Customer",
//   "Location",
//   "Total Items",
//   "Items SKU",
//   "Total Paid",
//   "Total Purchase Price",
//   "Total Profit",
//   "Total Discount",
//   "Total Amount",
//   "Sell Due",
//   "Payment Status",
//   "Payment Method",

//   // "Sell Return Due",
//   // "Shipping Status",
//   "Added By",
//   "Sell Note",
//   "Payment Note",
//   // "Shipping Details",
// ];

// export function SalesTable({
//   sales,
//   isLoading,
//   isFetching,

//   isPermissionLoading,
//   hasPermission = false,
// }: PurchaseTableProps) {
//   // Show loading state while checking permissions
//   if (isPermissionLoading) {
//     return (
//       <div className="bg-background p-2 rounded-lg shadow-md max-h-[150vh] overflow-auto">
//         <div className="w-full grid gap-4">
//           {Array.from({ length: 10 }).map((_, index) => (
//             <span
//               key={index}
//               className="bg-secondary h-14 rounded-md animate-skeleton"
//             />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   console.log(sales, "sales,,,,,,,,,");

//   return (
//     <div className="bg-background p-2 rounded-lg shadow-md">
//       {!isLoading && !isFetching && (
//         <Table>
//           {/* table header */}
//           <TableHeader className="relative h-9 bg-sidebar">
//             <TableRow className="border-b-primary/50">
//               {TABLE_HEADERS.map((header, index) => (
//                 <TableHead
//                   key={header}
//                   className={cn(
//                     "bg-primary/10 border-r border-r-primary/20 text-wrap whitespace-normal h-auto py-2",
//                     {
//                       "rounded-tr-md border-r-0 text-center":
//                         index === TABLE_HEADERS?.length - 1,
//                       "rounded-tl-md": index === 0,
//                     }
//                   )}
//                 >
//                   {header}
//                 </TableHead>
//               ))}
//             </TableRow>
//           </TableHeader>

//           {/* table body */}
//           {sales?.length > 0 && (
//             <TableBody>
//               {sales?.map((sale: IPOSSale, index) => {
//                 return (
//                   <TableRow key={index}>
//                     {/* Actions  */}
//                     <TableCell className="whitespace-normal border-r w-24">
//                       <div className="w-fit mx-auto">
//                         <SaleActions sale={sale} />
//                       </div>
//                     </TableCell>
//                     {/* sale_date */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {sale?.sale_date ? (
//                         <span className="flex flex-col">
//                           <p>
//                             {format(new Date(sale?.sale_date), "dd/MM/yyyy")}
//                           </p>
//                           <p>{format(new Date(sale?.sale_date), "hh:mm a")}</p>
//                         </span>
//                       ) : (
//                         <p>-</p>
//                       )}
//                     </TableCell>
//                     {/* invoice_number */}
//                     <TableCell className="border-r whitespace-normal w-[100px]">
//                       {sale?.invoice_number ? (
//                         <div>
//                           <p className="text-wrap">#{sale?.sale_serial_id}</p>
//                           <p className="text-wrap text-xs text-muted-foreground">
//                             {sale?.invoice_number}
//                           </p>
//                         </div>
//                       ) : (
//                         <p>-</p>
//                       )}
//                     </TableCell>
//                     {/* customer name _phone */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {sale?.user ? (
//                         <div className="text-wrap">
//                           <p>{sale?.user?.full_name}</p>
//                           <p>{sale?.customer_phone}</p>
//                         </div>
//                       ) : (
//                         <p>Walk-In Customer</p>
//                       )}
//                     </TableCell>
//                     {/* business_location */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {sale?.business_location ? (
//                         <p className="text-wrap">
//                           {sale?.business_location?.name}
//                         </p>
//                       ) : (
//                         <p>-</p>
//                       )}
//                     </TableCell>
//                     {/* total Item products quantity */}
//                     <TableCell className="border-r whitespace-normal w-14">
//                       {(sale?.products ?? []).reduce(
//                         (sum, p) => sum + Number(p?.quantity || 0),
//                         0
//                       )}
//                     </TableCell>
//                     {/* selected_variant sku */}
//                     <TableCell className="border-r whitespace-normal w-28">
//                       {Array.from(
//                         new Set(
//                           (sale?.products ?? [])
//                             .map(
//                               (p) =>
//                                 `${p?.selected_variant?.sku} (Qty ${p?.quantity})`
//                             )
//                             .filter(Boolean)
//                         )
//                       ).join(", ") || "—"}
//                     </TableCell>
//                     {/* total  paid_amount */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {Number(sale?.paid_amount).toLocaleString()} Tk
//                     </TableCell>
//                     {/*Purchase  total_cost */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {hasPermission ? (
//                         <span>
//                           {Number(
//                             (sale?.products ?? []).reduce(
//                               (sum, p) => sum + (Number(p?.total_cost) || 0),
//                               0
//                             )
//                           ).toLocaleString()}{" "}
//                           Tk
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </TableCell>
//                     {/* profit */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {hasPermission ? (
//                         <span>{Number(sale?.profit).toLocaleString()} Tk</span>
//                       ) : (
//                         "-"
//                       )}
//                     </TableCell>
//                     {/* total_discount */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {Number(sale?.total_discount).toLocaleString()} Tk
//                     </TableCell>
//                     {/* total_amount */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {Number(sale?.total_amount).toLocaleString()} Tk
//                     </TableCell>
//                     {/* due_amount */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {sale?.due_amount} Tk
//                     </TableCell>
//                     {/* payment_status */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {sale?.payment_status ? (
//                         <Badge
//                           variant={
//                             sale?.payment_status === "PAID"
//                               ? "emerald-outline"
//                               : sale?.payment_status === "PARTIAL"
//                               ? "blue-outline"
//                               : sale?.payment_status === "DUE"
//                               ? "rose-outline"
//                               : "default"
//                           }
//                         >
//                           {sale?.payment_status}
//                         </Badge>
//                       ) : (
//                         <p>-</p>
//                       )}
//                     </TableCell>
//                     {/* payment_method */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {sale?.payment_method ? (
//                         <p>{sale?.payment_method}</p>
//                       ) : (
//                         <p>-</p>
//                       )}
//                     </TableCell>
//                     {/* created_by */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {sale?.created_by?.[0]?.full_name || "-"}
//                     </TableCell>
//                     {/* sale_note */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {sale?.sale_note ? <p>{sale?.sale_note}</p> : <p>-</p>}
//                     </TableCell>
//                     {/* payment_note */}
//                     <TableCell className="border-r whitespace-normal w-24">
//                       {sale?.payment_note || "-"}
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           )}
//         </Table>
//       )}

//       {/* loading data state */}
//       {(isLoading || isFetching) && (
//         <div className="w-full grid gap-4">
//           {Array.from({ length: 10 }).map((_, index) => (
//             <span
//               key={index}
//               className="bg-secondary h-14 rounded-md animate-skeleton"
//             />
//           ))}
//         </div>
//       )}

//       {/* empty data state */}
//       {!isLoading && sales?.length <= 0 && (
//         <div className="text-center py-4">No data found!</div>
//       )}
//     </div>
//   );
// }

'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/admin/components/ui/table';
import { cn } from '@/admin/lib/utils';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/admin/components/ui/badge';
import { IPOSSale } from '@/admin/types/pos-sale';
import SaleActions from './sale-actions';
import { Checkbox } from '@/admin/components/ui/checkbox';
import { Label } from '@/admin/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/admin/components/ui/dropdown-menu';
import { Button } from '@/admin/components/ui/button';
import { ChevronDown } from 'lucide-react';

type PurchaseTableProps = {
    sales: [];
    isLoading: boolean;
    isFetching: boolean;
    hasPermission?: boolean;
    isPermissionLoading?: boolean;
};

// Table headers using actual data field names as keys
const TABLE_HEADERS = [
    { key: 'actions', label: 'Actions' },
    { key: 'sale_date', label: 'Date' },
    { key: 'invoice_number', label: 'Sale, Invoice No.' },
    { key: 'customer', label: 'Customer' },
    { key: 'business_location', label: 'Location' },
    { key: 'total_items', label: 'Total Items' },
    { key: 'sku', label: 'Items SKU' },
    { key: 'paid_amount', label: 'Total Paid' },
    { key: 'total_cost', label: 'Total Purchase Price' },
    { key: 'profit', label: 'Total Profit' },
    { key: 'total_discount', label: 'Total Discount' },
    { key: 'total_amount', label: 'Total Amount' },
    { key: 'due_amount', label: 'Sell Due' },
    { key: 'payment_status', label: 'Payment Status' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'created_by', label: 'Added By' },
    { key: 'sale_note', label: 'Sell Note' },
    { key: 'payment_note', label: 'Payment Note' }
];

// Types for selected fields
type SelectedField = {
    due_amount: boolean;
    sale_note: boolean;
    payment_note: boolean;
};

export function SalesTable({
    sales,
    isLoading,
    isFetching,
    isPermissionLoading,
    hasPermission = false
}: PurchaseTableProps) {
    // State for selected fields - initially all false (columns hidden)
    const [selectedFields, setSelectedFields] = useState<SelectedField>({
        due_amount: false,
        sale_note: false,
        payment_note: false
    });

    // Toggle field selection
    const toggleField = (field: keyof SelectedField) => {
        setSelectedFields((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Filter headers based on selected fields
    const filteredHeaders = TABLE_HEADERS.filter((header) => {
        // Always show all headers except the three conditional ones
        if (!['due_amount', 'sale_note', 'payment_note'].includes(header.key)) {
            return true;
        }
        // Only show conditional headers if they are selected
        return selectedFields[header.key as keyof SelectedField];
    });

    // Show loading state while checking permissions
    if (isPermissionLoading) {
        return (
            <div className='max-h-[150vh] overflow-auto rounded-lg bg-background p-2 shadow-md'>
                <div className='grid w-full gap-4'>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <span
                            key={index}
                            className='animate-skeleton h-14 rounded-md bg-secondary'
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className='rounded-lg bg-background p-2 shadow-md'>
            {/* Field Selection Controls */}

            <div className='mb-4'>
                <div className='flex items-center justify-end'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='outline' size='sm'>
                                Select Fields
                                <ChevronDown className='ml-2 h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-56'>
                            <DropdownMenuItem className='p-0'>
                                <div className='flex w-full items-center space-x-2 p-2'>
                                    <Checkbox
                                        id='due_amount'
                                        checked={selectedFields.due_amount}
                                        onCheckedChange={() =>
                                            toggleField('due_amount')
                                        }
                                    />
                                    <Label
                                        htmlFor='due_amount'
                                        className='flex-1 cursor-pointer text-sm'
                                    >
                                        Sell Due
                                    </Label>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className='p-0'>
                                <div className='flex w-full items-center space-x-2 p-2'>
                                    <Checkbox
                                        id='sale_note'
                                        checked={selectedFields.sale_note}
                                        onCheckedChange={() =>
                                            toggleField('sale_note')
                                        }
                                    />
                                    <Label
                                        htmlFor='sale_note'
                                        className='flex-1 cursor-pointer text-sm'
                                    >
                                        Sell Note
                                    </Label>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className='p-0'>
                                <div className='flex w-full items-center space-x-2 p-2'>
                                    <Checkbox
                                        id='payment_note'
                                        checked={selectedFields.payment_note}
                                        onCheckedChange={() =>
                                            toggleField('payment_note')
                                        }
                                    />
                                    <Label
                                        htmlFor='payment_note'
                                        className='flex-1 cursor-pointer text-sm'
                                    >
                                        Payment Note
                                    </Label>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {!isLoading && !isFetching && (
                <Table>
                    {/* Table header - only show selected columns */}
                    <TableHeader className='relative h-9 bg-sidebar'>
                        <TableRow className='border-b-primary/50'>
                            {filteredHeaders.map((header, index) => (
                                <TableHead
                                    key={header.key}
                                    className={cn(
                                        'h-auto border-r border-r-primary/20 bg-primary/10 py-2 text-wrap whitespace-normal',
                                        {
                                            'rounded-tr-md border-r-0 text-center':
                                                index ===
                                                filteredHeaders?.length - 1,
                                            'rounded-tl-md': index === 0
                                        }
                                    )}
                                >
                                    {header.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* Table body */}
                    {sales?.length > 0 && (
                        <TableBody>
                            {sales?.map((sale: IPOSSale, index) => {
                                const saleId = sale._id || `sale-${index}`;

                                return (
                                    <TableRow key={saleId}>
                                        {/* Render cells based on filtered headers */}
                                        {filteredHeaders.map((header) => {
                                            switch (header.key) {
                                                case 'actions':
                                                    return (
                                                        <TableCell
                                                            key='actions'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            <div className='mx-auto w-fit'>
                                                                <SaleActions
                                                                    sale={sale}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    );

                                                case 'sale_date':
                                                    return (
                                                        <TableCell
                                                            key='sale_date'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {sale?.sale_date ? (
                                                                <span className='flex flex-col'>
                                                                    <p>
                                                                        {format(
                                                                            new Date(
                                                                                sale.sale_date
                                                                            ),
                                                                            'dd/MM/yyyy'
                                                                        )}
                                                                    </p>
                                                                    <p>
                                                                        {format(
                                                                            new Date(
                                                                                sale.sale_date
                                                                            ),
                                                                            'hh:mm a'
                                                                        )}
                                                                    </p>
                                                                </span>
                                                            ) : (
                                                                <p>-</p>
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'invoice_number':
                                                    return (
                                                        <TableCell
                                                            key='invoice_number'
                                                            className='w-[100px] border-r whitespace-normal'
                                                        >
                                                            {sale?.invoice_number ? (
                                                                <div>
                                                                    <p className='text-wrap'>
                                                                        #
                                                                        {
                                                                            sale?.sale_serial_id
                                                                        }
                                                                    </p>
                                                                    <p className='text-xs text-wrap text-muted-foreground'>
                                                                        {
                                                                            sale.invoice_number
                                                                        }
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p>-</p>
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'customer':
                                                    return (
                                                        <TableCell
                                                            key='customer'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {sale?.user ? (
                                                                <div className='text-wrap'>
                                                                    <p>
                                                                        {
                                                                            sale
                                                                                .user
                                                                                .full_name
                                                                        }
                                                                    </p>
                                                                    <p>
                                                                        {
                                                                            sale.customer_phone
                                                                        }
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p>
                                                                    Walk-In
                                                                    Customer
                                                                </p>
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'business_location':
                                                    return (
                                                        <TableCell
                                                            key='business_location'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {sale?.business_location ? (
                                                                <p className='text-wrap'>
                                                                    {
                                                                        sale
                                                                            .business_location
                                                                            .name
                                                                    }
                                                                </p>
                                                            ) : (
                                                                <p>-</p>
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'total_items':
                                                    return (
                                                        <TableCell
                                                            key='total_items'
                                                            className='w-14 border-r whitespace-normal'
                                                        >
                                                            {(
                                                                sale?.products ??
                                                                []
                                                            ).reduce(
                                                                (sum, p) =>
                                                                    sum +
                                                                    Number(
                                                                        p?.quantity ||
                                                                            0
                                                                    ),
                                                                0
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'sku':
                                                    return (
                                                        <TableCell
                                                            key='sku'
                                                            className='w-28 border-r whitespace-normal'
                                                        >
                                                            {Array.from(
                                                                new Set(
                                                                    (
                                                                        sale?.products ??
                                                                        []
                                                                    )
                                                                        .map(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                `${p?.selected_variant?.sku} (Qty ${p?.quantity})`
                                                                        )
                                                                        .filter(
                                                                            Boolean
                                                                        )
                                                                )
                                                            ).join(', ') || '—'}
                                                        </TableCell>
                                                    );

                                                case 'paid_amount':
                                                    return (
                                                        <TableCell
                                                            key='paid_amount'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {Number(
                                                                sale?.paid_amount
                                                            ).toLocaleString()}{' '}
                                                            Tk
                                                        </TableCell>
                                                    );

                                                case 'total_cost':
                                                    return (
                                                        <TableCell
                                                            key='total_cost'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {hasPermission ? (
                                                                <span>
                                                                    {Number(
                                                                        (
                                                                            sale?.products ??
                                                                            []
                                                                        ).reduce(
                                                                            (
                                                                                sum,
                                                                                p
                                                                            ) =>
                                                                                sum +
                                                                                (Number(
                                                                                    p?.total_cost
                                                                                ) ||
                                                                                    0),
                                                                            0
                                                                        )
                                                                    ).toLocaleString()}{' '}
                                                                    Tk
                                                                </span>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'profit':
                                                    return (
                                                        <TableCell
                                                            key='profit'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {hasPermission ? (
                                                                <span>
                                                                    {Number(
                                                                        sale?.profit
                                                                    ).toLocaleString()}{' '}
                                                                    Tk
                                                                </span>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'total_discount':
                                                    return (
                                                        <TableCell
                                                            key='total_discount'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {Number(
                                                                sale?.total_discount
                                                            ).toLocaleString()}{' '}
                                                            Tk
                                                        </TableCell>
                                                    );

                                                case 'total_amount':
                                                    return (
                                                        <TableCell
                                                            key='total_amount'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {Number(
                                                                sale?.total_amount
                                                            ).toLocaleString()}{' '}
                                                            Tk
                                                        </TableCell>
                                                    );

                                                case 'due_amount':
                                                    // Only show if selected
                                                    if (
                                                        !selectedFields.due_amount
                                                    )
                                                        return null;
                                                    return (
                                                        <TableCell
                                                            key='due_amount'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {sale?.due_amount}{' '}
                                                            Tk
                                                        </TableCell>
                                                    );

                                                case 'payment_status':
                                                    return (
                                                        <TableCell
                                                            key='payment_status'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {sale?.payment_status ? (
                                                                <Badge
                                                                    variant={
                                                                        sale.payment_status ===
                                                                        'PAID'
                                                                            ? 'emerald-outline'
                                                                            : sale.payment_status ===
                                                                                'PARTIAL'
                                                                              ? 'blue-outline'
                                                                              : sale.payment_status ===
                                                                                  'DUE'
                                                                                ? 'rose-outline'
                                                                                : 'default'
                                                                    }
                                                                >
                                                                    {
                                                                        sale.payment_status
                                                                    }
                                                                </Badge>
                                                            ) : (
                                                                <p>-</p>
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'payment_method':
                                                    return (
                                                        <TableCell
                                                            key='payment_method'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {sale?.payment_method ? (
                                                                <p>
                                                                    {
                                                                        sale.payment_method
                                                                    }
                                                                </p>
                                                            ) : (
                                                                <p>-</p>
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'created_by':
                                                    return (
                                                        <TableCell
                                                            key='created_by'
                                                            className='w-24 border-r whitespace-normal'
                                                        >
                                                            {sale
                                                                ?.created_by?.[0]
                                                                ?.full_name ||
                                                                '-'}
                                                        </TableCell>
                                                    );

                                                case 'sale_note':
                                                    // Only show if selected
                                                    if (
                                                        !selectedFields.sale_note
                                                    )
                                                        return null;
                                                    return (
                                                        <TableCell
                                                            key='sale_note'
                                                            className='Max-w-24 border-r whitespace-normal'
                                                        >
                                                            {sale?.sale_note ? (
                                                                <div
                                                                    title={
                                                                        sale.sale_note
                                                                    }
                                                                >
                                                                    {sale
                                                                        .sale_note
                                                                        .length >
                                                                        0 &&
                                                                        `${sale.sale_note}`}
                                                                </div>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </TableCell>
                                                    );

                                                case 'payment_note':
                                                    // Only show if selected
                                                    if (
                                                        !selectedFields.payment_note
                                                    )
                                                        return null;
                                                    return (
                                                        <TableCell
                                                            key='payment_note'
                                                            className='Max-w-24 border-r whitespace-normal'
                                                        >
                                                            {sale?.payment_note ? (
                                                                <div
                                                                    title={
                                                                        sale.payment_note
                                                                    }
                                                                >
                                                                    {sale
                                                                        .payment_note
                                                                        .length >
                                                                        0 &&
                                                                        `${sale.payment_note}`}
                                                                </div>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </TableCell>
                                                    );

                                                default:
                                                    return null;
                                            }
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    )}
                </Table>
            )}

            {/* loading data state */}
            {(isLoading || isFetching) && (
                <div className='grid w-full gap-4'>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <span
                            key={index}
                            className='animate-skeleton h-14 rounded-md bg-secondary'
                        />
                    ))}
                </div>
            )}

            {/* empty data state */}
            {!isLoading && sales?.length <= 0 && (
                <div className='py-4 text-center'>No data found!</div>
            )}
        </div>
    );
}
