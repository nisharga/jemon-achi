import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

const OutletsSkeleton = () => {
    return (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className='h-[280px]'>
                    <CardHeader>
                        <Skeleton className='h-6 w-32' />
                        <Skeleton className='h-4 w-24' />
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            <Skeleton className='h-4 w-full' />
                            <Skeleton className='h-4 w-3/4' />
                            <Skeleton className='h-4 w-1/2' />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className='h-10 w-full' />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default OutletsSkeleton;
