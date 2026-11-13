import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';

interface IProps {
    label: string;
    value: string | number;
    hint?: string;
    icon: ReactNode;
    colorClass?: string;
}

const OverviewCard: FC<IProps> = ({ label, value, hint, icon, colorClass }) => {
    return (
        <Card>
            <CardContent className='flex items-center gap-4'>
                <div
                    className={cn(
                        'grid size-12 shrink-0 place-items-center rounded-lg',
                        colorClass ?? 'bg-primary-50 text-primary-800'
                    )}
                >
                    {icon}
                </div>
                <div className='min-w-0'>
                    <p className='truncate text-sm text-muted-foreground'>
                        {label}
                    </p>
                    <p className='text-2xl font-semibold'>{value}</p>
                    {hint ? (
                        <p className='text-xs text-muted-foreground'>{hint}</p>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
};

export default OverviewCard;
