import { AlertTriangle, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import React from 'react';

const FraudChecker = ({
    loading,
    fraudData
}: {
    loading: boolean;
    fraudData: any;
}) => {
    const getStatusIcon = () => {
        if (loading)
            return (
                <div className='h-2.5 w-2.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
            );
        if (fraudData?.error)
            return <XCircleIcon className='h-2.5 w-2.5 text-red-500' />;
        if (!fraudData)
            return <AlertTriangle className='h-2.5 w-2.5 text-gray-500' />;

        const successRate = fraudData?.successRate || 0;
        if (successRate >= 80)
            return <CheckCircleIcon className='h-3 w-3 text-green-500' />;
        if (successRate >= 50)
            return <AlertTriangle className='h-3 w-3 text-yellow-500' />;
        return <AlertTriangle className='h-3 w-3 text-red-500' />;
    };

    const getStatusColor = () => {
        if (loading) return 'text-blue-600';
        if (fraudData?.error) return 'text-red-600';
        if (!fraudData) return 'text-gray-600';

        const successRate = fraudData.successRate || 0;
        if (successRate >= 80) return 'text-green-600';
        if (successRate >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    //   fetching
    const delivered = fraudData?.totalDelivered || 0;
    const orders = fraudData?.totalOrders || 0;

    return (
        <>
            <div className='flex items-center space-x-1'>
                <p className={`text-xs font-medium ${getStatusColor()}`}>
                    Fraud Check
                </p>
                {getStatusIcon()}
            </div>
            <div className='text-xs text-muted-foreground'>
                {loading ? (
                    'Checking...'
                ) : fraudData?.error ? (
                    'Error loading data'
                ) : fraudData ? (
                    <span>
                        {fraudData.statusTag || 'No status'} •{' '}
                        <span
                            className={`text-xs font-medium ${getStatusColor()}`}
                        >
                            {fraudData.successRate || 0}% ({delivered}/{orders})
                        </span>
                    </span>
                ) : (
                    'No data available'
                )}
            </div>
        </>
    );
};

export default FraudChecker;
