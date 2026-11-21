'use client';

import type React from 'react';

import { Suspense, useMemo } from 'react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
import type { DateRange } from 'react-day-picker';
import { useGetAllBusinessLocationsQuery } from '@/redux/api-queries/business-location-api';
import type { IBusiness_location } from '@/types/business-location';
import { DateRangeCalendar } from '@/components/ui/date-range-calendar';
import {
    parseAsIsoDate,
    parseAsString,
    useQueryState,
    useQueryStates
} from 'nuqs';
import { Button } from '@/components/ui/admin-button';
import { Card, CardContent } from '@/components/ui/admin-card';
import { useGetBusinessReportQuery } from '@/redux/api-queries/report-api';
import {
    TrendingUp,
    RotateCcw,
    ShoppingCart,
    Package,
    DollarSign,
    Boxes,
    Users,
    AlertCircle,
    Filter
} from 'lucide-react';
import { JSX } from 'react/jsx-runtime';
import { getTodayDateRange } from '@/utils/getTodayDateRange';
import { ReportChart } from './report-chart';

// === type definitions for business report data ===
interface IBusinessReportTotals {
    sales?: {
        totalSalesAmount?: number;
        totalSalesCost?: number;
        totalProfit?: number;
        totalSubTotal?: number;
        totalDiscount?: number;
        totalPaid?: number;
        count?: number;
        total_quantity?: number;
    };
    returns?: {
        totalRefund?: number;
        totalReturnedCost?: number;
        count?: number;
        total_quantity?: number;
    };
    orders?: {
        totalOrdersAmount?: number;
        totalOrdersSubTotal?: number;
        totalOrdersDiscount?: number;
        totalPaid?: number;
        totalProfit?: number;
        totalDue?: number;
        count?: number;
        total_quantity?: number;
    };
    purchases?: {
        totalPurchasesCost?: number;
        totalSupplierPaid?: number;
        totalSupplierDue?: number;
        count?: number;
        total_quantity?: number;
    };
    derived?: {
        netSalesAmount?: number;
        netProfit?: number;
    };
}

interface IBusinessReport {
    totals?: IBusinessReportTotals;
    daily?: [];
}

// === metric card data structure ===
interface MetricCard {
    id: string;
    label: string;
    value: string | number | JSX.Element;
    icon: React.ReactNode;
    colorClass: string;
}

// === group configuration with icons and colors ===
const GROUP_CONFIG: Record<
    string,
    { icon: React.ReactNode; color: string; bg: string; gradient: string }
> = {
    'Pos Sales': {
        icon: <TrendingUp className='h-6 w-6 lg:h-7 lg:w-7' />,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',

        // Emerald → Teal → Deep Blue
        gradient:
            'linear-gradient(135deg, #10B981 0%, #0EA5E9 50%, #003BB2 100%)'
    },

    Returns: {
        icon: <RotateCcw className='h-6 w-6 lg:h-7 lg:w-7' />,
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/30',

        // Orange → Amber → Blue
        gradient:
            'linear-gradient(135deg, #F97316 0%, #F59E0B 45%, #003BB2 100%)'
    },

    'Online Orders': {
        icon: <ShoppingCart className='h-6 w-6 lg:h-7 lg:w-7' />,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',

        // Blue → Indigo → Main Theme Blue
        gradient:
            'linear-gradient(135deg, #3B82F6 0%, #4338CA 50%, #003BB2 100%)'
    },

    Purchases: {
        icon: <Package className='h-6 w-6 lg:h-7 lg:w-7' />,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900/30',

        // Purple → Violet → Deep Blue
        gradient:
            'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #003BB2 100%)'
    },

    Summary: {
        icon: <DollarSign className='h-6 w-6 lg:h-7 lg:w-7' />,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-100 dark:bg-rose-900/30',

        // Rose → Pink → Deep Blue
        gradient:
            'linear-gradient(135deg, #F43F5E 0%, #DB2777 50%, #003BB2 100%)'
    }
};

const ReportCardsComponent = () => {
    // === nuqs state for business location ===
    const [businessLocation, setBusinessLocation] =
        useQueryState('businessLocation');

    // === nuqs state for date range and selected option ===
    // const [{ from, to, selectedOption }, setDateRangeAndOption] = useQueryStates(
    //   {
    //     from: parseAsIsoDate.withDefault(startOfYear(new Date())),
    //     to: parseAsIsoDate.withDefault(endOfYear(new Date())),
    //     selectedOption: parseAsString.withDefault("Today"),
    //   },
    //   { history: "replace" }
    // );
    const [{ from, to, selectedOption }, setDateRangeAndOption] =
        useQueryStates(
            {
                from: parseAsIsoDate.withDefault(getTodayDateRange().from),
                to: parseAsIsoDate.withDefault(getTodayDateRange().to),
                selectedOption: parseAsString.withDefault('Today')
            },
            { history: 'replace' }
        );
    const dateRange: DateRange | undefined = { from, to };

    // === get all business locations ===
    const { data: businessLocationData } = useGetAllBusinessLocationsQuery({});
    const businessLocationOptions = useMemo(
        () =>
            businessLocationData?.data?.businessLocations?.map(
                (location: IBusiness_location) => ({
                    label: location?.name,
                    value: location?._id
                })
            ) || [],
        [businessLocationData?.data?.businessLocations]
    );

    // === handle clear filter ===
    const handleClearFilter = () => {
        setDateRangeAndOption(null);
        setBusinessLocation(null);
    };

    // === fetch business report data with totals only ===
    const {
        data: businessReportData,
        isLoading,
        isFetching
    } = useGetBusinessReportQuery({
        businessLocationId: businessLocation,
        startDate: dateRange?.from?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }),
        endDate: dateRange?.to?.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    });

    // === transform totals data into grid cards ===
    const groupedMetrics = useMemo((): Record<string, MetricCard[]> => {
        const report: IBusinessReport = businessReportData?.data || {};
        const totals = report?.totals;
        const groups: Record<string, MetricCard[]> = {};

        const daily = report?.daily;
        console.log('daily', daily);

        const formatAmount = (amount?: number) => (
            <span className='text-sm font-semibold md:text-[16px] lg:text-lg lg:font-bold'>
                {Math.round(amount || 0).toLocaleString('en-IN')}&nbsp;
                <span className='text-sm font-semibold md:text-[16px] lg:text-lg lg:font-bold'>
                    TK
                </span>
            </span>
        );

        // === derived metrics group ===
        if (totals?.derived) {
            groups.Summary = [
                {
                    id: 'derived-sales',
                    label: 'Net Sales Amount',
                    value: formatAmount(totals.derived.netSalesAmount),
                    icon: (
                        <TrendingUp className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'rose'
                },
                {
                    id: 'derived-profit',
                    label: 'Net Profit',
                    value: formatAmount(totals.derived.netProfit),
                    icon: (
                        <DollarSign className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'rose'
                }
            ];
        }

        // === sales group ===
        // if (totals?.sales) {
        //  groups["Pos Sales"] = [
        //   {
        //    id: "sales-amount",
        //    label: "Total Sales Amount",
        //    value: formatAmount(totals.sales.totalSalesAmount),
        //    icon: <DollarSign className='lg:w-6 lg:h-6 md:w-5 md:h-5 w-4 h-4 ' />,
        //    colorClass: "emerald",
        //   },
        //   {
        //    id: "sales-cost",
        //    label: "Total Sales Cost",
        //    value: formatAmount(totals.sales.totalSalesCost),
        //    icon: <Boxes className='lg:w-6 lg:h-6 md:w-5 md:h-5 w-4 h-4 ' />,
        //    colorClass: "emerald",
        //   },
        //   {
        //    id: "sales-profit",
        //    label: "Total Profit",
        //    value: formatAmount(totals.sales.totalProfit),
        //    icon: <TrendingUp className='lg:w-6 lg:h-6 md:w-5 md:h-5 w-4 h-4 ' />,
        //    colorClass: "emerald",
        //   },
        //   {
        //    id: "sales-discount",
        //    label: "Total Discount",
        //    value: formatAmount(totals.sales.totalDiscount),
        //    icon: <AlertCircle className='lg:w-6 lg:h-6 md:w-5 md:h-5 w-4 h-4 ' />,
        //    colorClass: "emerald",
        //   },
        //   {
        //    id: "sales-paid",
        //    label: "Total Paid",
        //    value: formatAmount(totals.sales.totalPaid),
        //    icon: <DollarSign className='lg:w-6 lg:h-6 md:w-5 md:h-5 w-4 h-4 ' />,
        //    colorClass: "emerald",
        //   },
        //   {
        //    id: "sales-quantity",
        //    label: "Quantity Sold",
        //    value: `${Math.round(totals.sales.total_quantity || 0).toLocaleString(
        //     "en-IN",
        //    )} Pcs`,
        //    icon: <Boxes className='lg:w-6 lg:h-6 md:w-5 md:h-5 w-4 h-4 ' />,
        //    colorClass: "emerald",
        //   },
        //   {
        //    id: "sales-count",
        //    label: "Transaction Count",
        //    value: (totals.sales.count || 0).toLocaleString("en-IN"),
        //    icon: <Users className='lg:w-6 lg:h-6 md:w-5 md:h-5 w-4 h-4 ' />,
        //    colorClass: "emerald",
        //   },
        //  ];
        // }

        // === orders group ===
        if (totals?.orders) {
            groups['Online Orders'] = [
                {
                    id: 'orders-amount',
                    label: 'Total Orders Amount',
                    value: formatAmount(totals.orders.totalOrdersAmount),
                    icon: (
                        <DollarSign className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'blue'
                },
                {
                    id: 'orders-discount',
                    label: 'Total Orders Discount',
                    value: formatAmount(totals.orders.totalOrdersDiscount),
                    icon: (
                        <AlertCircle className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'blue'
                },
                {
                    id: 'orders-due',
                    label: 'Total Due',
                    value: formatAmount(totals.orders.totalDue),
                    icon: (
                        <AlertCircle className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'blue'
                },
                {
                    id: 'orders-profit',
                    label: 'Total Profit',
                    value: formatAmount(totals.orders.totalProfit),
                    icon: (
                        <TrendingUp className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'blue'
                },
                {
                    id: 'orders-quantity',
                    label: 'Quantity Ordered',
                    value: `${Math.round(
                        totals.orders.total_quantity || 0
                    ).toLocaleString('en-IN')} Pcs`,
                    icon: (
                        <Boxes className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'blue'
                },
                {
                    id: 'orders-count',
                    label: 'Order Count',
                    value: (totals.orders.count || 0).toLocaleString('en-IN'),
                    icon: (
                        <Users className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'blue'
                }
            ];
        }

        // === purchases group ===
        if (totals?.purchases) {
            groups.Purchases = [
                {
                    id: 'purchases-cost',
                    label: 'Total Purchase Cost',
                    value: formatAmount(totals.purchases.totalPurchasesCost),
                    icon: (
                        <DollarSign className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'purple'
                },
                {
                    id: 'purchases-paid',
                    label: 'Total Supplier Paid',
                    value: formatAmount(totals.purchases.totalSupplierPaid),
                    icon: (
                        <DollarSign className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'purple'
                },
                {
                    id: 'purchases-due',
                    label: 'Total Supplier Due',
                    value: formatAmount(totals.purchases.totalSupplierDue),
                    icon: (
                        <AlertCircle className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'purple'
                },
                {
                    id: 'purchases-quantity',
                    label: 'Quantity Purchased',
                    value: `${Math.round(
                        totals.purchases.total_quantity || 0
                    ).toLocaleString('en-IN')} Pcs`,
                    icon: (
                        <Boxes className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'purple'
                },
                {
                    id: 'purchases-count',
                    label: 'Purchase Count',
                    value: (totals.purchases.count || 0).toLocaleString(
                        'en-IN'
                    ),
                    icon: (
                        <Users className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'purple'
                }
            ];
        }

        // === returns group ===
        if (totals?.returns) {
            groups.Returns = [
                {
                    id: 'returns-refund',
                    label: 'Total Refund',
                    value: formatAmount(totals.returns.totalRefund),
                    icon: (
                        <DollarSign className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'orange'
                },
                {
                    id: 'returns-cost',
                    label: 'Total Returned Cost',
                    value: formatAmount(totals.returns.totalReturnedCost),
                    icon: (
                        <Boxes className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'orange'
                },
                {
                    id: 'returns-quantity',
                    label: 'Quantity Returned',
                    value: `${Math.round(
                        totals.returns.total_quantity || 0
                    ).toLocaleString('en-IN')} Pcs`,
                    icon: (
                        <Boxes className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'orange'
                },
                {
                    id: 'returns-count',
                    label: 'Return Count',
                    value: (totals.returns.count || 0).toLocaleString('en-IN'),
                    icon: (
                        <Users className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    ),
                    colorClass: 'orange'
                }
            ];
        }

        return groups;
    }, [businessReportData?.data]);

    // === render metric card ===
    const renderMetricCard = (metric: MetricCard, groupName: string) => {
        const group = GROUP_CONFIG[groupName];

        return (
            <div
                key={metric?.id}
                className='relative rounded-lg shadow transition-all duration-300 ease-in-out hover:scale-100 hover:shadow-xl'
                style={{
                    background: group.gradient,
                    padding: '2px'
                }}
            >
                {/* INNER WRAPPER */}
                <div className='h-full w-full rounded-lg bg-background p-2 px-2 py-3 md:px-3 md:py-4 lg:px-4 lg:py-6'>
                    <div className='flex flex-wrap gap-3 lg:items-start'>
                        {/* Icon Box */}
                        <div
                            className={`flex items-center justify-center rounded-full p-3 ${group.bg} ${group.color}`}
                        >
                            {metric?.icon}
                        </div>

                        {/* Info */}
                        <div className='flex-1 space-y-1'>
                            <p className='text-sm font-medium text-muted-foreground'>
                                {metric?.label}
                            </p>
                            <p className='text-sm font-semibold text-foreground md:text-[16px] lg:text-lg'>
                                {metric?.value}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // === render loading skeleton ===
    const renderLoadingSkeleton = () => (
        <div className='space-y-8'>
            {Array.from({ length: 5 }).map((_, groupIdx) => (
                <div key={groupIdx}>
                    <div className='mb-4 h-7 w-32 animate-pulse rounded bg-muted' />
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {Array.from({ length: 6 }).map((_, cardIdx) => (
                            <div
                                key={cardIdx}
                                className='animate-pulse space-y-2 rounded-lg border border-border bg-muted p-4'
                            >
                                <div className='h-4 w-20 rounded bg-muted-foreground/20' />
                                <div className='h-6 w-32 rounded bg-muted-foreground/20' />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <section className='space-y-8 rounded-lg bg-muted p-2'>
            {/* ================= FILTER BAR ================= */}
            <div className='rounded-xl border bg-background p-4 shadow-sm'>
                <div className='mb-6 flex items-center gap-3'>
                    <div className='flex items-center justify-center rounded-xl border bg-white p-3 shadow-sm'>
                        <Filter className='h-4 w-4 text-[#003BB2] md:h-5 md:w-5 lg:h-6 lg:w-6' />
                    </div>

                    <h3
                        className='text-2xl font-bold text-[#003BB2] lg:text-3xl'
                        style={{ fontFamily: 'sans-serif' }}
                    >
                        Filter
                    </h3>
                </div>

                <div className='grid gap-6 md:grid-cols-3'>
                    {/* Business Location */}
                    <div className='space-y-2'>
                        <p className='text-[16px] font-medium'>
                            Business Location
                        </p>
                        <Select
                            onValueChange={(value) => {
                                setBusinessLocation(
                                    value === 'all' ? null : value
                                );
                            }}
                            value={businessLocation ?? 'all'}
                            defaultValue='all'
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select business location' />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value='all'>All</SelectItem>
                                {businessLocationOptions?.map(
                                    (
                                        location: {
                                            label: string;
                                            value: string;
                                        },
                                        index: number
                                    ) => (
                                        <SelectItem
                                            key={index}
                                            value={location?.value}
                                        >
                                            {location?.label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className='w-full space-y-2'>
                        <p className='text-[16px] font-medium'>Date Range</p>
                        <DateRangeCalendar
                            value={dateRange}
                            selectedOption={selectedOption}
                            onDateChange={(newDateRange) => {
                                if (newDateRange)
                                    setDateRangeAndOption(newDateRange);
                            }}
                            onOptionChange={(newOption) =>
                                setDateRangeAndOption({
                                    selectedOption: newOption
                                })
                            }
                        />
                    </div>

                    {/* Clear Button */}
                    <div className='flex items-end pt-2'>
                        <Button
                            variant='outline'
                            className='h-11 w-full'
                            onClick={handleClearFilter}
                        >
                            Clear Filter
                        </Button>
                    </div>
                </div>
            </div>

            {/* ================= LOADING ================= */}
            {(isLoading || isFetching) && renderLoadingSkeleton()}

            {/* ================= GROUPS ================= */}
            {!isLoading && !isFetching && (
                <div className='space-y-10'>
                    {Object.entries(groupedMetrics).map(
                        ([groupName, metrics]) => (
                            <div
                                key={groupName}
                                className='rounded-xl border bg-background p-3 shadow-sm md:p-4 lg:p-4'
                            >
                                {/* Group Header */}
                                <div className='mb-6 flex items-center gap-3'>
                                    <div
                                        className={`${GROUP_CONFIG[groupName]?.color} flex items-center justify-center rounded-xl border bg-white p-3 shadow-sm`}
                                    >
                                        {GROUP_CONFIG[groupName]?.icon}
                                    </div>
                                    <h3
                                        className='text-2xl font-bold text-[#003BB2] lg:text-3xl'
                                        style={{ fontFamily: 'sans-serif' }}
                                    >
                                        {groupName}
                                    </h3>
                                </div>

                                {/* Metric Cards Grid */}
                                <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                                    {metrics?.map((metric) =>
                                        renderMetricCard(metric, groupName)
                                    )}
                                </div>

                                {/* Chart Integration */}
                                {/* {groupName === "Pos Sales" &&
                businessReportData?.data?.daily?.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">
                      Daily Sales Trend
                    </h4>
                    <ReportChart
                      data={businessReportData?.data?.daily}
                      dataKey="sales"
                      color="#10B981"
                      gradientId="salesGradient"
                      tooltipLabel="Sales"
                    />
                  </div>
                )} */}

                                {groupName === 'Online Orders' &&
                                    businessReportData?.data?.daily?.length >
                                        0 && (
                                        <div className='mt-6 border-t pt-6'>
                                            <h4 className='mb-4 text-sm font-medium text-muted-foreground'>
                                                Daily Orders Trend
                                            </h4>
                                            <ReportChart
                                                data={
                                                    businessReportData?.data
                                                        ?.daily
                                                }
                                                dataKey='orders'
                                                color='#3B82F6'
                                                gradientId='ordersGradient'
                                                tooltipLabel='Orders'
                                            />
                                        </div>
                                    )}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* ================= EMPTY STATE ================= */}
            {!isLoading && Object.keys(groupedMetrics)?.length === 0 && (
                <Card>
                    <CardContent className='flex items-center justify-center py-12'>
                        <p className='text-muted-foreground'>
                            No data available
                        </p>
                    </CardContent>
                </Card>
            )}
        </section>
    );
};

const ReportCards = () => {
    return (
        <Suspense fallback={<>Loading..</>}>
            <ReportCardsComponent />
        </Suspense>
    );
};

export default ReportCards;
