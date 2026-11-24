'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Section from '../_components/Section';

export default function ShippingProcedurePage() {
    return (
        <div className='mx-auto max-w-4xl space-y-8 px-4 py-10'>
            {/* Header */}
            <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='space-y-3'
            >
                <h1 className='two-xl-medium'>Shipping Procedure</h1>
                <p className='base-semibold text-primary-ink'>
                    Fast, reliable delivery — right to your door.
                </p>
                <p className='sm-gray'>
                    At GriipBuddy, we want your order to reach you as quickly
                    and safely as possible. Here&#39;s everything you need to
                    know about how we ship inside Bangladesh.
                </p>
            </motion.div>

            <Section title='Our Delivery Partners'>
                <p className='sm-gray mb-3'>
                    We ship all orders within Bangladesh through two trusted
                    courier partners:
                </p>
                <div className='mb-4 flex gap-4'>
                    <span className='sm-semibold rounded-lg border border-gray-200 px-4 py-2'>
                        Steadfast Courier
                    </span>
                    <span className='sm-semibold rounded-lg border border-gray-200 px-4 py-2'>
                        CarryBee
                    </span>
                </div>
                <p className='sm-gray italic'>
                    All orders are processed as home delivery by default. If you
                    prefer, we also offer hub delivery through Steadfast —
                    simply mention it when placing your order.
                </p>
            </Section>

            <Section title='Delivery Timeframe'>
                <div className='overflow-x-auto'>
                    <table className='sm-gray w-full border-collapse text-left'>
                        <thead>
                            <tr className='border-b border-gray-100'>
                                <th className='sm-semibold py-2'>Location</th>
                                <th className='sm-semibold py-2'>
                                    Estimated Delivery Time
                                </th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-50'>
                            <tr>
                                <td className='py-3'>Inside Dhaka</td>
                                <td className='text-primary-ink py-3 font-medium'>
                                    1 – 2 business days
                                </td>
                            </tr>
                            <tr>
                                <td className='py-3'>
                                    Sub-urban & all over Bangladesh
                                </td>
                                <td className='text-primary-ink py-3 font-medium'>
                                    2 – 3 business days
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section title='Delivery Charges'>
                <div className='overflow-x-auto'>
                    <table className='sm-gray w-full border-collapse text-left'>
                        <thead>
                            <tr className='border-b border-gray-100'>
                                <th className='sm-semibold py-2'>Location</th>
                                <th className='sm-semibold py-2'>
                                    Delivery Charge
                                </th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-50'>
                            <tr>
                                <td className='py-3'>Inside Dhaka</td>
                                <td className='py-3'>৳80</td>
                            </tr>
                            <tr>
                                <td className='py-3'>All over Bangladesh</td>
                                <td className='py-3'>৳120</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section title='Delays & Disruptions'>
                <p className='sm-gray'>
                    We always aim to deliver within the timeframes above.
                    However, during peak seasons, public holidays, or unforeseen
                    circumstances, deliveries may experience an additional delay
                    of 24 – 48 hours. We appreciate your patience during such
                    times.
                </p>
            </Section>

            <Section title='Our Delivery Guarantee'>
                <div className='space-y-3 rounded-xl bg-gray-50 p-5'>
                    <p className='sm-gray'>
                        We stand behind our delivery commitments. If we fail to
                        deliver your order within the stated timeframe — for
                        reasons on our end — we will compensate you with a
                        <span className='sm-semibold text-primary-ink'>
                            {' '}
                            5% discount coupon{' '}
                        </span>
                        for your next purchase on our website, for every single
                        day the delivery is delayed beyond the promised date.
                    </p>
                    <p className='xss-normal text-gray-600 italic'>
                        Please note: This compensation is only applicable if the
                        delay is caused by GriipBuddy or our courier partners.
                        If our delivery agent attempted to contact you but was
                        unable to complete the delivery due to your
                        unavailability or delayed response, the compensation
                        will not apply.
                    </p>
                </div>
            </Section>

            <Section title='Important Notes'>
                <ul className='sm-gray list-none space-y-2'>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            Delivery timeframes are counted from the day your
                            order is dispatched, not the day it is placed
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            Please ensure your delivery address and contact
                            number are correct at the time of ordering
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            For hub delivery via Steadfast, please clearly
                            mention your preferred hub location when placing
                            your order
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            GriipBuddy is not responsible for delays caused by
                            incorrect address or contact information provided by
                            the customer
                        </span>
                    </li>
                </ul>
            </Section>

            <Section title='Questions About Your Delivery?'>
                <p className='sm-gray mb-3'>
                    If you have any concerns about your shipment, our team is
                    available to help:
                </p>
                <ul className='sm-gray list-none space-y-1'>
                    <li>
                        <span className='sm-semibold'>Facebook Messenger:</span>{' '}
                        <a
                            href='https://facebook.com/griipbuddy'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:underline'
                        >
                            facebook.com/griipbuddy
                        </a>
                    </li>

                    <li>
                        <span className='sm-semibold'>Instagram DM:</span>{' '}
                        <a
                            href='https://instagram.com/griipbuddy'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:underline'
                        >
                            instagram.com/griipbuddy
                        </a>
                    </li>

                    <li>
                        <span className='sm-semibold'>WhatsApp:</span>{' '}
                        <a
                            href='https://wa.me/8801871087090'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:underline'
                        >
                            +880 1871-087090
                        </a>
                    </li>

                    <li>
                        <span className='sm-semibold'>Email:</span>{' '}
                        <a
                            href='mailto:contact@griipbuddy.com'
                            className='hover:underline'
                        >
                            contact@griipbuddy.com
                        </a>
                    </li>
                </ul>
                <p className='sm-gray mt-4 font-medium'>
                    Active 7 days a week, 8:00am – 12:00am (Bangladesh Standard
                    Time)
                </p>
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
