'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Section from '../_components/Section';

export default function WarrantyPolicyPage() {
    return (
        <div className='mx-auto max-w-4xl space-y-8 px-4 py-10'>
            {/* Header */}
            <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='space-y-3'
            >
                <h1 className='two-xl-medium'>Warranty Policy</h1>
                <p className='base-semibold text-primary-ink'>
                    We stand behind every product we sell.
                </p>
                <p className='sm-gray'>
                    At GriipBuddy, we believe in the quality of what we offer.
                    Our warranty policy is designed to be straightforward and
                    honest — so you always know exactly what is covered before
                    you buy.
                </p>
            </motion.div>

            {/* No Warranty Section */}
            <Section title='Products Without Warranty'>
                <p className='sm-gray mb-3'>
                    The following product categories are not covered under any
                    warranty:
                </p>
                <ul className='sm-gray list-none space-y-2'>
                    <li className='flex items-start gap-2'>
                        <span className='mt-1 text-gray-600'>●</span>
                        <span className='sm-semibold'>Phone Cases</span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='mt-1 text-gray-600'>●</span>
                        <span className='sm-semibold'>
                            Glass Screen Protectors
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='mt-1 text-gray-600'>●</span>
                        <span className='sm-semibold'>
                            Any other protective accessories of similar nature
                        </span>
                    </li>
                </ul>
                <p className='sm-gray mt-4 italic'>
                    These products are consumable by nature — subject to
                    everyday wear, handling, and personal use. While we ensure
                    the highest quality standards in their design and
                    production, we are unable to offer warranty coverage on
                    these items.
                </p>
            </Section>

            {/* Official Warranty Section */}
            <Section title='Products With Official Warranty'>
                <p className='sm-gray mb-3'>
                    The following product categories come with official warranty
                    support from GriipBuddy:
                </p>
                <ul className='sm-gray list-none space-y-2'>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span className='sm-semibold'>
                            Headphones & Earphones
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span className='sm-semibold'>Phone Coolers</span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span className='sm-semibold'>Phone Chargers</span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span className='sm-semibold'>
                            Any other electronic gadgets sold under the
                            GriipBuddy brand
                        </span>
                    </li>
                </ul>
                <p className='sm-gray mt-4'>
                    These products are covered against manufacturing defects and
                    functional failures under normal use conditions.
                </p>
            </Section>

            {/* Terms & Conditions */}
            <Section title='Warranty Terms & Conditions'>
                <ul className='sm-gray list-none space-y-3'>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            Warranty is only valid for products purchased
                            directly through official GriipBuddy channels
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            Warranty does not cover physical damage, water
                            damage, or damage caused by misuse, negligence, or
                            unauthorised modification
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            Warranty does not cover normal wear and tear
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            Proof of purchase is required for all warranty
                            claims
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink mt-1'>●</span>
                        <span>
                            GriipBuddy reserves the right to repair, replace, or
                            offer store credit for any valid warranty claim at
                            our discretion
                        </span>
                    </li>
                </ul>
            </Section>

            {/* How to Claim */}
            <Section title='How to Claim Warranty'>
                <p className='sm-gray mb-4'>
                    If you believe your product has a manufacturing defect or
                    functional issue covered under warranty, please contact us
                    via email with the following details:
                </p>
                <div className='mb-4 space-y-4 rounded-xl bg-gray-50 p-5'>
                    <ol className='sm-gray list-decimal space-y-1 pl-5 font-medium'>
                        <li>Your full name and order details</li>
                        <li>A clear description of the issue</li>
                        <li>
                            Photos or a short video showing the defect or
                            problem
                        </li>
                    </ol>
                    <p className='sm-medium text-primary-ink'>
                        contact@griipbuddy.com
                    </p>
                </div>
                <p className='xss-normal text-gray-600'>
                    Our team will review your claim and respond within 48 hours.
                </p>
            </Section>

            {/* Support Links */}
            <Section title='Questions About Warranty?'>
                <p className='sm-gray mb-3'>
                    If you are unsure whether your product is covered, feel free
                    to reach out:
                </p>
                <ul className='sm-gray list-none space-y-1'>
                    <li>
                        <span className='sm-semibold'>Facebook Messenger:</span>{' '}
                        facebook.com/griipbuddy
                    </li>
                    <li>
                        <span className='sm-semibold'>Instagram DM:</span>{' '}
                        instagram.com/griipbuddy
                    </li>
                    <li>
                        <span className='sm-semibold'>WhatsApp:</span> +880
                        1871-087090
                    </li>
                    <li>
                        <span className='sm-semibold'>Email:</span>{' '}
                        contact@griipbuddy.com
                    </li>
                </ul>
                <p className='sm-gray mt-4 font-medium'>
                    Active 7 days a week, 8:00am – 12:00am (BST)
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
