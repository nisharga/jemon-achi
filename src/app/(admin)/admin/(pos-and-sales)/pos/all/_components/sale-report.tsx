import React from 'react';
import {
    Activity,
    BadgeMinus,
    BadgePercent,
    BarChart3,
    Clock,
    TrendingUp
} from 'lucide-react';

type SaleReportProps = {
    posSalesReport: any;
    isLoading: boolean;
    isFetching: boolean;
};

const SaleReport = ({
    posSalesReport,
    isLoading,
    isFetching
}: SaleReportProps) => {
    const items = [
        {
            title: 'Total Sales Value',
            value: Math.round(posSalesReport?.totalSales).toLocaleString(),
            icon: Activity,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20'
        },
        {
            title: 'Total Profit Value',
            value: Math.round(posSalesReport?.totalProfit).toLocaleString(),
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20'
        },
        {
            title: 'Total Purchase Value',
            value: Math.round(posSalesReport?.totalCost).toLocaleString(),
            icon: BadgeMinus,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20'
        },
        {
            title: 'Total Discount Given',
            value: Math.round(posSalesReport?.totalDiscount).toLocaleString(),
            icon: BadgePercent,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950/20'
        },
        {
            title: 'Amount Due',
            value: posSalesReport?.totalDue?.toFixed(0).toLocaleString(),
            icon: Clock,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/20'
        },
        // {
        //   title: "Total Tax",
        //   value: posSalesReport?.totalTax,
        //   icon: Receipt,
        //   color: "text-indigo-600",
        //   bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
        // },
        {
            title: 'Number of Sales',
            value: posSalesReport?.numberOfSales?.toLocaleString(),
            icon: BarChart3,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50 dark:bg-teal-950/20'
        }
    ];

    return (
        <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
            {(!isLoading || !isFetching) &&
                items?.length > 0 &&
                items?.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className='rounded-md bg-background p-4 shadow-md transition-shadow duration-200 hover:shadow-lg'
                        >
                            <div className='flex items-center justify-between'>
                                <p className='text-xs font-medium text-muted-foreground uppercase'>
                                    {card?.title}
                                </p>
                                <div
                                    className={`grid size-7 place-items-center rounded-lg ${card.bgColor}`}
                                >
                                    <Icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </div>

                            <div className='text-xl font-bold text-foreground'>
                                {index !== items?.length - 1 && <>৳</>}{' '}
                                {card?.value}
                            </div>
                        </div>
                    );
                })}

            {(isLoading || isFetching) &&
                Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className='animate-skeleton h-20 rounded-lg bg-background p-4'
                    />
                ))}
        </div>
    );
};

export default SaleReport;
