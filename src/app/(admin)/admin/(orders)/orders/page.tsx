'use client';

import Pagination from '@/components/shared/pagination';
import { Input } from '@/components/ui/admin-input';
import useDebounce from '@/hooks/use-debounce';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { OrdersTable } from './_components/orders-table';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { FileSpreadsheet, Filter, Truck } from 'lucide-react';
import {
    parseAsIsoDate,
    parseAsString,
    useQueryState,
    useQueryStates
} from 'nuqs';
import { DateRange } from 'react-day-picker';
import { DateRangeCalendar } from '@/components/ui/date-range-calendar';
import { Button } from '@/components/ui/admin-button';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import OrderTabsV2 from '../_components/order-tabs-v2';
import { usePathname } from 'next/navigation';
import { getTodayDateRange } from '@/utils/getTodayDateRange';
import * as XLSX from 'xlsx';
import { useOrderData } from '@/hooks/useOrderData';
import { Label } from '@/components/ui/admin-label';
import {
    SelectItem,
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/admin-badge';
import { getRoleBadgeVariant } from '@/utils/getRoleBadgeVariant';
import { IRoles, TUser } from '@/types/admin/user';
import { useGetAllStaffsQuery } from '@/redux/admin/api/staff-api';
import {
    //  useGetAllOrderSummaryQuery,
    // useGetAllOrderSummaryQuery,
    useLazyGetAllOrdersQuery,
    useLazyGetAllTodaysActivityQuery,
    useLazySynchWithCourierQuery
} from '@/redux/admin/api/order-api';
import { toast } from 'sonner';

const OrdersPageComponent = () => {
    const pathname = usePathname();

    // Check if current route is the specific one
    const isAllOrdersRoute = pathname === '/admin/orders';
    const isTodaysActivityRoute = pathname === '/admin/sales-executive';

    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.ORDER_VIEW]
    });

    // === LAZY QUERY for download data ===
    // For all orders page
    const [
        triggerDownloadAllOrders,
        { isLoading: isAllOrdersDownloadLoading }
    ] = useLazyGetAllOrdersQuery();

    // For sales executive page (today-actives)
    const [
        triggerDownloadTodayActives
        // { isLoading: isTodayActivesDownloadLoading },
    ] = useLazyGetAllTodaysActivityQuery();

    // === nuqs state for order status ===
    const [orderStatus, setOrderStatus] = useQueryState('status');
    const [isAccordionOpen, setIsAccordionOpen] = useState(true);

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);
    const [businessLocation, setBusinessLocation] = useState('');
    const [assignedBusinessLocation, setaAsignedBusinessLocation] =
        useState('');
    const [searchQuery, setSearchQuery] = useQueryState('searchQuery');
    const debouncedSearchQuery = useDebounce(searchQuery);
    const [sku, setSku] = useQueryState('sku');
    const debouncedSku = useDebounce(sku);
    const [created_by, setCreatedBy] = useState('');
    const [isCalled, setIsCalled] = useState('');

    // === Date range state ===
    const [{ from, to, selectedOption }, setDateRangeAndOption] =
        useQueryStates(
            {
                from: parseAsIsoDate.withDefault(
                    isAllOrdersRoute ? new Date(0) : getTodayDateRange().from
                ),
                to: parseAsIsoDate.withDefault(
                    isAllOrdersRoute ? new Date() : getTodayDateRange().to
                ),
                selectedOption: parseAsString.withDefault(
                    isAllOrdersRoute ? 'All Time' : 'Today'
                )
            },
            { history: 'replace' }
        );

    const dateRange: DateRange | undefined = { from, to };

    // === Use the unified custom hook for TABLE DATA ONLY ===
    const {
        currentData,
        currentMeta,
        currentStatusCounts,
        statusCount,
        businessLocationOptions,
        isLoading,
        isFetching
    } = useOrderData({
        page,
        limit,
        searchQuery: debouncedSearchQuery,
        businessLocation,
        sku: debouncedSku,
        orderStatus,
        created_by,
        from,
        to,
        assignedBusinessLocation,
        isAllOrdersRoute,
        is_called: isCalled
    });

    // === get all staffs ===
    const { data: staffData } = useGetAllStaffsQuery({
        page: 1,
        limit: 1000,
        role: [
            'OUTLET_MANAGER',
            'OUTLET_STAFF',
            'INVENTORY_MANAGER',
            'FOUNDER',
            'MODERATOR',
            'SALES_EXECUTIVE',
            'SUPPORT_ADMIN',
            'CUSTOMER_SUPPORT',
            'CUSTOMER_EXECUTIVE',
            'OUTLET_MANAGER',
            'WAREHOUSE_MANAGER',
            'INVENTORY_MANAGER',
            'ACCOUNT_MANAGER'
        ]
    });
    const staffs = staffData?.data?.data;

    const [syncWithCourierApi, { isLoading: isLoadingSyncWithCourier }] =
        useLazySynchWithCourierQuery();
    // === useGetAllOrderSummaryQuery ===
    // const { data: OrderSummaryData } = useGetAllOrderSummaryQuery({});
    // const orderSummarys = OrderSummaryData?.data?.data;

    // Replace this line:
    // const { data: OrderSummaryData } = useGetAllOrderSummaryQuery({});

    // With this:
    //  const { data: OrderSummaryData, refetch } = useGetAllOrderSummaryQuery({
    //   searchQuery: debouncedSearchQuery || undefined,
    //   business_location_id: businessLocation || undefined,
    //   sku: debouncedSku || undefined,
    //   filter: orderStatus || undefined,
    //   startDate: from?.toISOString().split("T")[0] || undefined,
    //   endDate: to?.toISOString().split("T")[0] || undefined,
    //   created_by: created_by || undefined,
    //   is_assigned_to_business_location: assignedBusinessLocation || undefined,
    //  });

    //  // Add a refetch effect
    //  useEffect(() => {
    //   refetch();
    //  }, [
    //   debouncedSearchQuery,
    //   businessLocation,
    //   debouncedSku,
    //   orderStatus,
    //   from,
    //   to,
    //   created_by,
    //   assignedBusinessLocation,
    //   refetch,
    //  ]);

    //  const orderSummarys = OrderSummaryData?.data?.data;

    const staffOptions = staffs?.map((staff: TUser) => ({
        name: staff?.full_name,
        id: staff?._id,
        role: staff?.role
    }));

    const handleClearFilter = () => {
        setDateRangeAndOption({
            from: null,
            to: null,
            selectedOption: null
        });
        setSearchQuery(null);
        setSku(null);
        setBusinessLocation('');
        setCreatedBy('');
        setIsCalled('');
    };

    // === paginations ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // === reset to first page whenover limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit, searchQuery]);

    const isDownloadingRef = useRef(false);
    const [downloadState, setDownloadState] = useState({
        excel: false
    });

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    // handleDownload
    const handleDownload = async (type: 'excel') => {
        if (isDownloadingRef.current) return;

        isDownloadingRef.current = true;
        setDownloadState((prev) => ({ ...prev, [type]: true }));

        try {
            // Use EXACTLY the same date format as useOrderData hook
            const formatDate = (date: Date | null) => {
                if (!date) return undefined;
                return date.toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            };

            // Build parameters EXACTLY like useOrderData
            const downloadParams: any = {
                page: 1,
                limit: 10000,
                searchQuery: debouncedSearchQuery || '',
                business_location_id: businessLocation,
                sku: sku || '',
                filter: orderStatus || '',
                startDate: formatDate(from),
                endDate: formatDate(to),
                created_by: created_by || ''
            };

            // Add is_assigned_to_business_location if it exists
            if (
                assignedBusinessLocation &&
                assignedBusinessLocation.trim() !== ''
            ) {
                downloadParams.is_assigned_to_business_location =
                    assignedBusinessLocation;
            }

            let downloadResult;

            // USE CORRECT ENDPOINT BASED ON ROUTE
            if (isTodaysActivityRoute) {
                // Use today-actives endpoint (SAME as table)
                downloadResult =
                    await triggerDownloadTodayActives(downloadParams);
            } else {
                // Use all-orders endpoint
                downloadResult = await triggerDownloadAllOrders(downloadParams);
            }

            if (downloadResult.data) {
                let ordersData;

                // Extract data based on response structure
                if (
                    downloadResult.data.data &&
                    Array.isArray(downloadResult.data.data.data)
                ) {
                    ordersData = downloadResult.data.data.data;
                } else if (Array.isArray(downloadResult.data.data)) {
                    ordersData = downloadResult.data.data;
                } else if (Array.isArray(downloadResult.data)) {
                    ordersData = downloadResult.data;
                } else {
                    ordersData = [];
                }

                if (ordersData && ordersData.length > 0) {
                    await generateExcel(ordersData);
                } else {
                    alert('No orders data available to download');
                }
            } else {
                throw new Error('No data received for download');
            }
        } catch (err) {
            console.error('Download error:', err);
            alert('Error downloading Excel file: ' + (err as Error).message);
        } finally {
            isDownloadingRef.current = false;
            setDownloadState((prev) => ({ ...prev, [type]: false }));
        }
    };

    const generateExcel = async (ordersData: any[]) => {
        if (!ordersData || ordersData.length === 0) {
            alert('No orders data available to download');
            return;
        }

        // --- headers for orders ---
        const headers = [
            'Order Id',
            'Customer Name',
            'Phone Number',
            'Address',
            'Steadfast Parcel Id',
            'Product SKU',
            'Product Price',
            'Delivery Charge',
            'Status',
            'Assigned Location'
        ];

        const isCancelled = (order: any) =>
            String(order?.status).toUpperCase() === 'CANCELLED';

        // Calculate totals EXCLUDING cancelled orders
        const totalProductPrice = ordersData.reduce((sum, order) => {
            return isCancelled(order)
                ? sum
                : sum + (Number(order?.total_amount) || 0);
        }, 0);

        const totalDeliveryCharge = ordersData.reduce((sum, order) => {
            return isCancelled(order)
                ? sum
                : sum + (Number(order?.delivery_charge) || 0);
        }, 0);

        // Total amount excluding cancelled orders
        const totalAmount = totalProductPrice + totalDeliveryCharge;

        // Cancelled orders (count + amount)
        const totalCancelledOrders = ordersData.filter(isCancelled).length;

        const totalCancelledAmount = ordersData.reduce((sum, order) => {
            return isCancelled(order)
                ? sum + (Number(order?.total_amount) || 0)
                : sum;
        }, 0);

        // Grand total across ALL orders (including cancelled)
        const grandTotal = ordersData.reduce((sum, order) => {
            return (
                sum +
                (Number(order?.total_amount) || 0) +
                (Number(order?.delivery_charge) || 0)
            );
        }, 0);

        const rows = ordersData.map((order: any) => {
            // Extract product SKUs
            const productSkus = order?.products
                ?.map((product: any) => product?.selected_variant?.sku || 'N/A')
                .join(', ');

            // Combine all address fields for assigned location
            const assignedLocationAddress =
                order?.assigned_business_location?.name;

            return [
                `${order?.order_serial_id || 'N/A'}`,
                order?.customer_name || 'N/A',
                `${order?.customer_phone || 'N/A'}`,
                order?.delivery_address?.address || 'N/A',
                order?.consignment_id ? `${order.consignment_id}` : 'N/A',
                productSkus || 'N/A',
                Number(order?.total_amount) || 0,
                Number(order?.delivery_charge) || 0,
                order?.status || 'N/A',
                assignedLocationAddress
            ];
        });

        // --- build sheet ---
        const wb = XLSX.utils.book_new();

        // Create worksheet data
        const wsData: any[][] = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
            { wch: 30 }, // Order Id
            { wch: 25 }, // Customer Name
            { wch: 25 }, // Phone Number
            { wch: 50 }, // Address
            { wch: 20 }, // Stedfast Parcel Id
            { wch: 25 }, // Product SKU
            { wch: 25 }, // Product Price
            { wch: 25 }, // Delivery Charge
            { wch: 35 }, // Status
            { wch: 40 } // Assigned Location
        ];

        // Add autofilter
        const lastDataRow = rows.length + 1;
        ws['!autofilter'] = { ref: `A1:J${lastDataRow}` };

        // --- summary section ---
        const summaryStartRow = lastDataRow + 2;

        const summaryPairs: Array<[string, any]> = [
            ['Status Filter', orderStatus || 'All'],
            ['Total Orders', ordersData.length],
            ['Total Product Price', totalProductPrice.toLocaleString()],
            ['Total Delivery Charge', totalDeliveryCharge.toLocaleString()],
            ['Total Amount', totalAmount.toLocaleString()],
            ['Total Cancelled Orders', totalCancelledOrders],
            ['Total Cancelled Amount', totalCancelledAmount.toLocaleString()],
            ['Grand Total', grandTotal.toLocaleString()],
            [
                'Date Range',
                from && to
                    ? `${from.toLocaleDateString()} to ${to.toLocaleDateString()}`
                    : 'All Dates'
            ],
            ['Generated At', new Date().toLocaleString()]
        ];

        // Add summary
        XLSX.utils.sheet_add_aoa(ws, [['Summary']], {
            origin: `A${summaryStartRow}`
        });

        // Add summary data
        summaryPairs.forEach(([key, value], index) => {
            XLSX.utils.sheet_add_aoa(ws, [[key, value]], {
                origin: `A${summaryStartRow + index + 1}`
            });
        });

        // Merge summary title
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({
            s: { r: summaryStartRow - 1, c: 0 },
            e: { r: summaryStartRow - 1, c: 1 }
        });

        // --- finalize ---
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');

        const fileName = `orders_report_${new Date()
            .toLocaleDateString()
            .replace(/\//g, '-')}_${orderStatus || 'all'}.xlsx`;

        XLSX.writeFile(wb, fileName);
    };

    // handleDownloadExcel
    const handleDownloadExcel = () => handleDownload('excel');

    const handleSyncWithCourier = async () => {
        const res: any = await syncWithCourierApi({}).unwrap();
        if (res?.success) {
            toast.success('Sync done with courier!');
        } else {
            toast.error('Failed to sync with courier! try again.');
        }
    };

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>
                    {isAllOrdersRoute
                        ? `All Orders (${currentMeta?.total || 0})`
                        : isTodaysActivityRoute
                          ? `Sales Executive (${currentMeta?.total})`
                          : ''}
                </h1>
            </div>

            {/* search filter */}
            <div className='rounded-lg bg-background shadow-md'>
                <Accordion
                    type='single'
                    collapsible
                    value={isAccordionOpen ? 'item-1' : ''}
                    onValueChange={(value) =>
                        setIsAccordionOpen(value === 'item-1')
                    }
                >
                    <AccordionItem value='item-1'>
                        <AccordionTrigger
                            isHideChevron={true}
                            className='rounded-b-none border-b p-4 text-lg font-medium hover:cursor-pointer hover:no-underline'
                        >
                            <span className='flex items-center gap-2 text-emerald-600'>
                                <Filter className='size-5' /> Filter
                            </span>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='lg'
                                    className='w-fit gap-1'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSyncWithCourier();
                                    }}
                                    disabled={isLoadingSyncWithCourier}
                                >
                                    <>
                                        <Truck className='size-4' />
                                        {isLoadingSyncWithCourier
                                            ? 'Please wait...'
                                            : 'Sync with Courier'}
                                    </>
                                </Button>
                                <Button
                                    variant='outline'
                                    size='lg'
                                    className='w-fit gap-1'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadExcel();
                                    }}
                                    disabled={
                                        downloadState.excel ||
                                        isAllOrdersDownloadLoading
                                    }
                                >
                                    <>
                                        <FileSpreadsheet className='size-4' />
                                        {downloadState.excel ||
                                        isAllOrdersDownloadLoading
                                            ? 'Downloading...'
                                            : 'Download Excel'}
                                    </>
                                </Button>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent>
                            <div className='flex flex-wrap gap-5 px-4 pt-4'>
                                <div className='w-72 space-y-2'>
                                    <p className='text-sm font-medium'>
                                        Search
                                    </p>
                                    <Input
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder='Order id, phone, tracking code'
                                        value={searchQuery ? searchQuery : ''}
                                    />
                                </div>
                                <div className='w-72 space-y-2'>
                                    <p className='text-sm font-medium'>SKU</p>
                                    <Input
                                        onChange={(e) => setSku(e.target.value)}
                                        placeholder='521CL-5'
                                        value={sku ? sku : ''}
                                    />
                                </div>

                                {/* filter by date range */}
                                <div className='space-y-2 lg:col-span-2'>
                                    <p className='text-sm font-medium'>
                                        Date Range
                                    </p>
                                    {isAllOrdersRoute ? (
                                        <DateRangeCalendar
                                            value={dateRange}
                                            selectedOption={selectedOption}
                                            onDateChange={(newDateRange) => {
                                                if (newDateRange) {
                                                    setDateRangeAndOption({
                                                        from: newDateRange.from,
                                                        to: newDateRange.to
                                                    });
                                                }
                                            }}
                                            onOptionChange={(newOption) => {
                                                setDateRangeAndOption({
                                                    selectedOption: newOption
                                                });
                                            }}
                                            defaultOption='All Time'
                                        />
                                    ) : (
                                        <DateRangeCalendar
                                            value={dateRange}
                                            selectedOption={selectedOption}
                                            onDateChange={(newDateRange) => {
                                                if (newDateRange) {
                                                    setDateRangeAndOption({
                                                        from: newDateRange.from,
                                                        to: newDateRange.to
                                                    });
                                                }
                                            }}
                                            onOptionChange={(newOption) => {
                                                setDateRangeAndOption({
                                                    selectedOption: newOption
                                                });
                                            }}
                                            defaultOption='Today'
                                        />
                                    )}
                                </div>
                                {/* Business Location */}
                                <div className='w-72 space-y-2 pt-2'>
                                    <Label>Business Location</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setBusinessLocation(
                                                value === 'all' ? '' : value
                                            );
                                        }}
                                        defaultValue='all'
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select business location' />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {businessLocationOptions?.map(
                                                (
                                                    businessLocation: {
                                                        label: string;
                                                        value: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={
                                                            businessLocation?.value
                                                        }
                                                    >
                                                        {
                                                            businessLocation?.label
                                                        }
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* filter by Created by */}
                                <div className='w-56 space-y-2 pt-2'>
                                    <p className='text-sm font-medium'>
                                        Created By
                                    </p>
                                    <Select
                                        onValueChange={(value) => {
                                            setCreatedBy(
                                                value === 'all' ? '' : value
                                            );
                                        }}
                                        defaultValue='all'
                                        value={created_by ? created_by : 'all'}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select user' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            {staffOptions?.map(
                                                (
                                                    staff: {
                                                        name: string;
                                                        id: string;
                                                        role: string;
                                                    },
                                                    index: number
                                                ) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={staff?.id}
                                                    >
                                                        <p>{staff?.name}</p>
                                                        <Badge
                                                            variant={getRoleBadgeVariant(
                                                                staff?.role as IRoles
                                                            )}
                                                            className='rounded-sm px-1 text-[8px]'
                                                        >
                                                            {staff?.role.replace(
                                                                /_/g,
                                                                ' '
                                                            )}
                                                        </Badge>
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* filter by Called? */}
                                <div className='w-56 space-y-2 pt-2'>
                                    <p className='text-sm font-medium'>
                                        Called?
                                    </p>
                                    <Select
                                        onValueChange={(value) => {
                                            setIsCalled(
                                                value === 'all' ? '' : value
                                            );
                                        }}
                                        defaultValue='all'
                                        value={isCalled ? isCalled : 'all'}
                                    >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select called status' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='all'>
                                                All
                                            </SelectItem>
                                            <SelectItem value='true'>
                                                Called (Yes)
                                            </SelectItem>
                                            <SelectItem value='false'>
                                                Not Called (No)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className='px-4 pt-4'>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearFilter();
                                    }}
                                    className='mt-auto w-fit'
                                >
                                    Clear Filter
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <OrderTabsV2
                orderStatus={orderStatus as string}
                processingOrderStatusCounts={currentStatusCounts}
                setaAsignedBusinessLocation={setaAsignedBusinessLocation}
                setOrderStatus={setOrderStatus}
                statusCount={statusCount}
            />

            {/* table */}
            <OrdersTable
                orders={currentData}
                isLoading={isLoading}
                isFetching={isFetching}
            />

            {/* pagination */}
            <div className='rounded-lg bg-background p-2 shadow-md'>
                <Pagination
                    limit={limit}
                    setLimit={setLimit}
                    currentPage={page}
                    onPageChange={handlePageChange}
                    totalItems={currentMeta?.total}
                />
            </div>
        </section>
    );
};

const OrdersPage = () => {
    return (
        <Suspense fallback={<>Loading..</>}>
            <OrdersPageComponent />
        </Suspense>
    );
};
export default OrdersPage;
