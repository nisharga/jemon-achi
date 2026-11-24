'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Section from '../_components/Section';

export default function ReturnsExchangePage() {
    return (
        <div className='mx-auto max-w-4xl space-y-8 px-4 py-10'>
            {/* Header */}
            <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='space-y-3'
            >
                <h1 className='two-xl-medium'>Returns & Exchange</h1>
                <p className='base-semibold text-primary-ink'>
                    We want you to love every GriipBuddy product you own.
                </p>
                <p className='sm-gray'>
                    If something isn&#39;t right, we&#39;re here to make it
                    right. Our 7-day return and exchange policy is simple, fair,
                    and designed with your confidence in mind.
                </p>
            </motion.div>

            <Section title='7-Day Return Guarantee'>
                <p className='sm-gray rounded-lg border-l-4 border-primary bg-gray-50 p-4'>
                    All GriipBuddy purchases are covered by a{' '}
                    <span className='sm-semibold'>
                        7-day return and exchange guarantee
                    </span>{' '}
                    from the date of delivery.
                </p>
            </Section>

            <Section title='Defective or Faulty Items'>
                <p className='sm-gray mb-3'>
                    If your product arrives with a manufacturing defect or
                    fault, we take full responsibility:
                </p>
                <ul className='sm-gray list-none space-y-2'>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>100% free return or exchange</span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            We cover all shipping charges — at no cost to you
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            An additional{' '}
                            <span className='sm-semibold text-primary-ink'>
                                5% coupon code
                            </span>{' '}
                            will be issued as compensation for the inconvenience
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>Valid within 7 days of delivery</span>
                    </li>
                </ul>
                <p className='sm-gray mt-4 italic'>
                    We appreciate you bringing genuine issues to our attention
                    and we will always go the extra mile to make it right.
                </p>
            </Section>

            <Section title='Change of Mind Returns'>
                <p className='sm-gray mb-3'>
                    If you simply change your mind, no problem — we still
                    welcome returns and exchanges:
                </p>
                <ul className='sm-gray list-none space-y-2'>
                    <li className='flex items-start gap-2'>
                        <span className='mt-1 text-gray-600'>●</span>
                        <span>
                            Returns and exchanges accepted within 7 days of
                            delivery
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='mt-1 text-gray-600'>●</span>
                        <span>
                            Delivery charges are at the customer&#39;s expense
                            in these cases
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='mt-1 text-gray-600'>●</span>
                        <span>Original shipping fees are non-refundable</span>
                    </li>
                </ul>
            </Section>

            <Section title='Our Inspection Process'>
                <ul className='sm-gray list-none space-y-3'>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            Refunds or exchanges will only be approved after the
                            returned product has been inspected by our team
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            If the returned product is found to have any issue,
                            damage, or discrepancy that was not declared —
                            GriipBuddy reserves the right to reject the request
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            Products must be returned in their original
                            condition, unused beyond what is necessary to
                            identify the defect
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            Original packaging is preferred but not mandatory
                        </span>
                    </li>
                </ul>
            </Section>

            <Section title='Refund & Exchange Processing Time'>
                <p className='sm-gray'>
                    Once your returned product has been received and inspected,
                    all refunds and exchanges will be processed within:
                </p>
                <p className='sm-semibold text-primary-ink mt-2'>
                    Up to 7 working days from the date we receive your returned
                    item.
                </p>
                <p className='sm-gray mt-4'>
                    You will be notified via email once processed. If you have
                    not heard from us within 7 working days, reach out:
                </p>
                <p className='sm-medium'>contact@griipbuddy.com</p>
            </Section>

            <Section title='How to Request a Return or Exchange'>
                <div className='space-y-4 rounded-xl bg-gray-50 p-5'>
                    <ol className='sm-gray list-decimal space-y-2 pl-5 font-medium'>
                        <li>
                            Email us at{' '}
                            <span className='text-primary-ink underline'>
                                contact@griipbuddy.com
                            </span>{' '}
                            with your full name, order details, reason, and
                            clear photos/video
                        </li>
                        <li>
                            Our team will review your request and respond within
                            24 hours
                        </li>
                        <li>
                            Once approved, we will guide you through the next
                            steps
                        </li>
                    </ol>
                </div>
            </Section>

            <Section title='Important Notes'>
                <ul className='sm-gray list-none space-y-2'>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1 text-[10px]'>
                            ●
                        </span>
                        <span>
                            Returns requested after 7 days of delivery will not
                            be accepted under any circumstances
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1 text-[10px]'>
                            ●
                        </span>
                        <span>
                            Warranty claims are handled separately — please
                            refer to our{' '}
                            <span className='underline'>Warranty Policy</span>
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1 text-[10px]'>
                            ●
                        </span>
                        <span>
                            GriipBuddy reserves the right to make the final
                            decision following product inspection
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1 text-[10px]'>
                            ●
                        </span>
                        <span>
                            Coupon compensation is valid for website purchases
                            only
                        </span>
                    </li>
                </ul>
            </Section>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className='border-t pt-6'
            >
                <p className='xss-normal text-primary-ink'>
                    Last updated: March 2026
                </p>
            </motion.div>
        </div>
    );
}
