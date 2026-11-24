'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Section from '../_components/Section';

export default function PrivacyPolicyPage() {
    return (
        <div className='mx-auto max-w-4xl space-y-8 px-4 py-10'>
            {/* Header */}
            <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='space-y-3'
            >
                <h1 className='two-xl-medium'>Privacy & Policy</h1>
                <p className='base-semibold text-primary-ink'>
                    Your privacy matters to us.
                </p>
                <p className='sm-gray'>
                    At GriipBuddy, we are committed to protecting your personal
                    information and being transparent about how we collect, use,
                    and safeguard your data. By using our website, social media
                    pages, or any of our services, you agree to the terms
                    outlined in this policy.
                </p>
            </motion.div>

            <Section title='Information We Collect'>
                <p className='sm-gray mb-3'>
                    When you interact with GriipBuddy — whether through our
                    website, social media, or direct messaging — we may collect
                    the following information:
                </p>
                <ul className='sm-gray list-none space-y-2'>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink'>●</span>
                        <span>
                            <span className='sm-semibold'>
                                Personal details
                            </span>{' '}
                            — your name, phone number, and email address
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink'>●</span>
                        <span>
                            <span className='sm-semibold'>
                                Delivery information
                            </span>{' '}
                            — your shipping address and location
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink'>●</span>
                        <span>
                            <span className='sm-semibold'>Order details</span> —
                            products purchased, order history, and transaction
                            records
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink'>●</span>
                        <span>
                            <span className='sm-semibold'>
                                Communication data
                            </span>{' '}
                            — messages, enquiries, and feedback you send us
                        </span>
                    </li>
                    <li className='flex items-start gap-2'>
                        <span className='text-primary-ink'>●</span>
                        <span>
                            <span className='sm-semibold'>
                                Device and browsing data
                            </span>{' '}
                            — IP address, browser type, and pages visited on our
                            website
                        </span>
                    </li>
                </ul>
            </Section>

            <Section title='How We Use Your Information'>
                <p className='sm-gray mb-3'>
                    We use the information we collect solely to provide you with
                    the best possible experience:
                </p>
                <ul className='sm-gray list-none space-y-2'>
                    <li className='flex items-start gap-2'>
                        <span>●</span> To process and fulfill your orders
                    </li>
                    <li className='flex items-start gap-2'>
                        <span>●</span> To communicate updates about your order
                        or delivery
                    </li>
                    <li className='flex items-start gap-2'>
                        <span>●</span> To respond to your questions, complaints,
                        or support requests
                    </li>
                    <li className='flex items-start gap-2'>
                        <span>●</span> To send you product updates, offers, or
                        news — only if you have opted in
                    </li>
                    <li className='flex items-start gap-2'>
                        <span>●</span> To improve our products, services, and
                        website experience
                    </li>
                    <li className='flex items-start gap-2'>
                        <span>●</span> To comply with legal obligations where
                        required
                    </li>
                </ul>
            </Section>

            <Section title='How We Protect Your Information'>
                <p className='sm-gray'>
                    We take the security of your personal data seriously.
                    GriipBuddy applies reasonable technical and organisational
                    measures to protect your information from unauthorised
                    access, loss, misuse, or disclosure. Your data is never
                    sold, rented, or shared with third parties for marketing
                    purposes.
                </p>
            </Section>

            <Section title='Third-Party Platforms'>
                <p className='sm-gray'>
                    GriipBuddy operates across several third-party platforms
                    including Facebook, Instagram, WhatsApp, YouTube, and
                    TikTok. When you interact with us on these platforms, their
                    own privacy policies also apply. We encourage you to review
                    the privacy policies of any platform you use.
                </p>
            </Section>

            <Section title='Cookies'>
                <p className='sm-gray'>
                    Our website may use cookies to enhance your browsing
                    experience, analyse site traffic, and remember your
                    preferences. You can choose to disable cookies through your
                    browser settings at any time, though some features of the
                    website may not function as intended.
                </p>
            </Section>

            <Section title='Data Retention'>
                <p className='sm-gray'>
                    We retain your personal information only for as long as
                    necessary to fulfill the purpose it was collected for —
                    including processing orders, resolving disputes, and meeting
                    legal requirements. Once no longer needed, your data is
                    securely deleted.
                </p>
            </Section>

            <Section title='Your Rights'>
                <p className='sm-gray mb-3'>You have the right to:</p>
                <ul className='sm-gray list-none space-y-2'>
                    <li className='flex items-start gap-2'>
                        <span>●</span> Request access to the personal data we
                        hold about you
                    </li>
                    <li className='flex items-start gap-2'>
                        <span>●</span> Request correction of any inaccurate or
                        incomplete data
                    </li>
                    <li className='flex items-start gap-2'>
                        <span>●</span> Request deletion of your personal data,
                        subject to legal obligations
                    </li>
                    <li className='flex items-start gap-2'>
                        <span>●</span> Withdraw consent for marketing
                        communications at any time
                    </li>
                </ul>
                <p className='sm-gray mt-4'>
                    To exercise any of these rights, please email us at:
                </p>
                <p className='sm-medium'>contact@griipbuddy.com</p>
            </Section>

            <Section title='Changes to This Policy'>
                <p className='sm-gray'>
                    GriipBuddy reserves the right to update this Privacy &
                    Policy at any time. Any changes will be posted on this page
                    with a revised effective date. We encourage you to review
                    this policy periodically to stay informed.
                </p>
            </Section>

            <Section title='Contact & Questions'>
                <p className='sm-gray'>
                    If you have any questions, concerns, or requests regarding
                    this Privacy & Policy, please email us at:
                </p>
                <p className='sm-medium mt-1'>contact@griipbuddy.com</p>
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
