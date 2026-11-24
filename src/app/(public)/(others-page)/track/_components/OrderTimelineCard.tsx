import React from 'react';
import { Package, SeparatorHorizontal } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/public/ui/card';
import { Separator } from '@/components/public/ui/separator';
import WhatsAppChat from '@/components/public/common/WhatsApp';

interface OrderStep {
    id: string;
    title: string;
    description: string;
    date: string;
    completed: boolean;
    active?: boolean;
    icon: React.ElementType;
}

interface OrderTimelineCardProps {
    orderSteps: OrderStep[];
    orderId: string | number;
    whatsappNumber: string;
}

const OrderTimelineCard: React.FC<OrderTimelineCardProps> = ({
    orderSteps,
    orderId,
    whatsappNumber
}) => {
    return (
        <Card className='h-full border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
            <CardHeader className='pb-4'>
                <CardTitle className='base-normal flex items-center gap-2'>
                    <Package className='h-5 w-5' />
                    Order Progress
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 sm:space-y-6'>
                {orderSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div key={step.id} className='relative'>
                            {/* Connecting Line */}
                            {index < orderSteps.length - 1 && (
                                <div
                                    className={`absolute top-12 left-6 h-16 w-0.5 ${
                                        step.completed
                                            ? 'bg-primary'
                                            : 'bg-slate-200'
                                    }`}
                                />
                            )}

                            <div className='flex items-start gap-4'>
                                {/* Icon Circle */}
                                <div
                                    className={`base-normal flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                        step.completed
                                            ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                                            : step.active
                                              ? 'text-primary-ink animate-pulse border-primary bg-white shadow-md'
                                              : 'border-slate-300 bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    <Icon className='h-5 w-5' />
                                </div>

                                {/* Text Content */}
                                <div className='min-w-0 flex-1'>
                                    <h3
                                        className={`base-normal ${
                                            step.completed || step.active
                                                ? 'text-slate-900'
                                                : 'text-slate-500'
                                        }`}
                                    >
                                        {step?.title}
                                    </h3>
                                    <p className='base-normal mt-1'>
                                        {step?.description}
                                    </p>
                                    <p className='base-normal mt-2 font-medium text-slate-500'>
                                        {step?.date || 'Coming soon'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <Separator className='my-6' />

                {/* Cancellation Section */}
                <div className='flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4'>
                    <div className='space-y-1 text-center'>
                        <h4 className='sm-semibold text-red-900'>
                            Do you need any help?
                        </h4>
                        <p className='sm-normal-primary leading-relaxed text-red-600/80'>
                            We’re here to help if you need anything 😊
                        </p>
                    </div>

                    <WhatsAppChat
                        phoneNumber={whatsappNumber}
                        message={`Hi! I want to cancel this order. Order ID: #${orderId}`}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderTimelineCard;
