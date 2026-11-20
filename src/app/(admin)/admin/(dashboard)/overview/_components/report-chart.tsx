'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface ReportChartProps {
    data: any[];
    dataKey: string;
    color: string;
    gradientId: string;
    tooltipLabel?: string;
    height?: number;
}

export const ReportChart = ({
    data,
    dataKey,
    color,
    gradientId,
    tooltipLabel,
    height = 300
}: ReportChartProps) => {
    return (
        <div className='mt-4 w-full' style={{ height }}>
            <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1='0'
                            y1='0'
                            x2='0'
                            y2='1'
                        >
                            <stop
                                offset='5%'
                                stopColor={color}
                                stopOpacity={0.3}
                            />
                            <stop
                                offset='95%'
                                stopColor={color}
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray='3 3'
                        vertical={false}
                        opacity={0.3}
                    />
                    <XAxis
                        dataKey='date'
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            });
                        }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                            new Intl.NumberFormat('en-US', {
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(value)
                        }
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none' }}
                        labelFormatter={(label) =>
                            new Date(String(label)).toLocaleDateString(
                                'en-US',
                                {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }
                            )
                        }
                        formatter={(value) => [
                            new Intl.NumberFormat('en-US').format(
                                Number(value)
                            ),
                            tooltipLabel || dataKey
                        ]}
                    />
                    <Area
                        type='monotone'
                        dataKey={dataKey}
                        stroke={color}
                        fill={`url(#${gradientId})`}
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
