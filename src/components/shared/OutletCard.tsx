import React, { FC } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '../ui/admin-card';
import { Building2, Calendar, Edit, MapPin, Package } from 'lucide-react';
import { Badge } from '../ui/admin-badge';
import { Button } from '../ui/admin-button';
import { TOutlet } from '@/types/product';

type TProps = {
    data: TOutlet;
    handleViewInventory: (data: TOutlet) => void;
    handleUpdateInventory: (data: TOutlet) => void;
};

const OutletCard: FC<TProps> = ({
    data,
    handleViewInventory,
    handleUpdateInventory
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    return (
        <Card
            key={data._id}
            className='border-l-4 border-l-[#023344] transition-shadow duration-200 hover:shadow-lg'
        >
            <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold text-[#023344]'>
                    <Building2 className='h-5 w-5 text-[#EFBB29]' />
                    {data.name}
                </CardTitle>
                <Badge variant='outline' className='w-fit text-xs'>
                    ID: {data.slug}
                </Badge>
            </CardHeader>

            <CardContent className='space-y-3'>
                {/* Address Information */}
                <div className='space-y-2'>
                    <div className='flex items-start gap-2'>
                        <MapPin className='mt-0.5 h-4 w-4 flex-shrink-0 text-[#EFBB29]' />
                        <div className='text-sm text-gray-700'>
                            <p className='font-medium'>
                                {data.address.local_address}
                            </p>
                            <p className='text-gray-500'>
                                {data.address.thana}, {data.address.district}
                            </p>
                            <p className='text-gray-500'>
                                {data.address.division}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Location Coordinates */}
                <div className='rounded-md bg-gray-50 p-2'>
                    <p className='text-xs text-gray-600'>
                        <span className='font-medium'>Coordinates:</span>
                        {data.location.latitude.toFixed(4)},{' '}
                        {data.location.longitude.toFixed(4)}
                    </p>
                </div>

                {/* Created Date */}
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                    <Calendar className='h-3 w-3' />
                    <span>Created: {formatDate(data.createdAt)}</span>
                </div>
            </CardContent>

            <CardFooter className='grid gap-2 pt-3 sm:grid-cols-2'>
                <Button
                    onClick={() => handleViewInventory(data)}
                    className='grow bg-[#023344] text-white hover:bg-[#023344]/90'
                >
                    <Package className='h-4 w-4' />
                    View Inventory
                </Button>
                <Button
                    variant={'outline'}
                    onClick={() => handleUpdateInventory(data)}
                    className=''
                >
                    <Edit className='h-4 w-4' />
                    Update Inventory
                </Button>
            </CardFooter>
        </Card>
    );
};

export default OutletCard;
