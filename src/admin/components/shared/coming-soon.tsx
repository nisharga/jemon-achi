import { CalendarClock, Clock } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/admin/components/ui/card';
import Container from './container';

interface ComingSoonProps {
    title?: string;
    description?: string;
    estimatedDate?: string;
}

export function ComingSoon({
    title = 'Feature Coming Soon',
    description = "We'll inform you when this feature becomes available to use.",
    estimatedDate
}: ComingSoonProps) {
    return (
        <Container className='flex min-h-[70vh] items-center justify-center'>
            <div className='flex h-full w-full items-center justify-center p-4 md:p-6'>
                <Card className='animate-fadeIn w-full overflow-hidden border-none p-0 text-center shadow-none transition-all duration-300'>
                    <div className='relative'>
                        <CardHeader className='p-0 pb-2'>
                            <div className='mx-auto mb-2 flex size-10 animate-pulse items-center justify-center rounded-full bg-[#6D70FC] shadow-md sm:mb-4 md:size-16'>
                                <Clock className='size-5 text-white md:size-8' />
                            </div>
                            <CardTitle className='text-lg font-bold text-[#6D70FC] md:text-2xl'>
                                {title}
                            </CardTitle>
                            {description && (
                                <CardDescription className='mt-2 text-sm sm:mt-3 md:text-base'>
                                    {description}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className='p-0 pb-6'>
                            {estimatedDate && (
                                <div className='mt-4 flex items-center justify-center gap-2 rounded-full bg-[#6D70FC]/15 px-4 py-2 text-sm font-medium text-[#6D70FC]'>
                                    <CalendarClock className='h-4 w-4 animate-bounce' />
                                    <span>
                                        Estimated availability: {estimatedDate}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </div>
                </Card>
            </div>
        </Container>
    );
}
