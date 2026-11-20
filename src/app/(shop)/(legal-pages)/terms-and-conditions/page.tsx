import Section from '../_components/Section';

export default function TermsPage() {
    return (
        <div className='mx-auto max-w-4xl space-y-8 px-4 py-10'>
            {/* Header */}
            <div className='space-y-3'>
                <h1 className='two-xl-medium'>Terms & Conditions</h1>
                <p className='sm-gray'>
                    Please read these terms carefully before using our services.
                </p>
                <p className='sm-gray'>
                    By accessing our website, placing an order, or interacting
                    with GriipBuddy, you agree to be bound by these terms.
                </p>
            </div>

            {/* Section Component */}
            <Section title='1. About GriipBuddy'>
                <p className='sm-gray'>
                    GriipBuddy is a lifestyle and product design brand operating
                    in Bangladesh, backed by a legally registered business
                    entity in China.
                </p>

                <ul className='sm-gray list-disc space-y-1 pl-5'>
                    <li>Unified Social Credit Code: 91460000MA5U0B484R</li>
                    <li>Certificate Number: 04810029</li>
                    <li>Registration Date: May 12, 2021</li>
                    <li>
                        Registered Under: Hainan Province Market Supervision
                        Administration, China
                    </li>
                    <li>Verify Online: gsxt.gov.cn</li>
                </ul>
            </Section>

            <Section title='2. Use of Our Services'>
                <ul className='sm-gray list-disc space-y-1 pl-5'>
                    <li>
                        You are at least 18 years old or under guardian
                        supervision
                    </li>
                    <li>You will provide accurate and truthful information</li>
                    <li>You will not misuse our platform or services</li>
                    <li>No fraudulent, abusive, or unlawful activity</li>
                </ul>
            </Section>

            <Section title='3. Products & Pricing'>
                <ul className='sm-gray list-disc space-y-1 pl-5'>
                    <li>Products are subject to availability</li>
                    <li>We may update or discontinue products anytime</li>
                    <li>Prices are in Bangladeshi Taka (৳)</li>
                    <li>
                        Orders may be adjusted or canceled for pricing errors
                    </li>
                </ul>
            </Section>

            <Section title='4. Orders & Payments'>
                <ul className='sm-gray list-disc space-y-1 pl-5'>
                    <li>Orders require confirmation</li>
                    <li>We may cancel orders at our discretion</li>
                    <li>Payment must be completed during checkout</li>
                    <li>Changes after confirmation may not be possible</li>
                </ul>
            </Section>

            <Section title='5. Shipping & Delivery'>
                <ul className='sm-gray list-disc space-y-1 pl-5'>
                    <li>Shipping via Steadfast Courier and CarryBee</li>
                    <li>Delivery details in Shipping Policy</li>
                    <li>Not liable for incorrect delivery info</li>
                    <li>Risk transfers after delivery</li>
                </ul>
            </Section>

            <Section title='6. Returns, Exchanges & Refunds'>
                <ul className='sm-gray list-disc space-y-1 pl-5'>
                    <li>Governed by Returns & Exchange Policy</li>
                    <li>Items are inspected before approval</li>
                    <li>Processed within 7 working days</li>
                    <li>Requests may be rejected if policy not met</li>
                </ul>
            </Section>

            <Section title='7. Warranty'>
                <ul className='sm-gray list-disc space-y-1 pl-5'>
                    <li>Covered under Warranty Policy</li>
                    <li>No warranty for phone cases & screen protectors</li>
                    <li>Electronics include official warranty</li>
                    <li>Valid only for official purchases</li>
                </ul>
            </Section>

            <Section title='8. Intellectual Property'>
                <p className='sm-gray'>
                    All content including logos, images, text, and branding are
                    owned by GriipBuddy and cannot be used without permission.
                </p>
            </Section>

            <Section title='9. Limitation of Liability'>
                <ul className='sm-gray list-disc space-y-1 pl-5'>
                    <li>No liability for indirect or consequential damages</li>
                    <li>No liability for uncontrollable events</li>
                    <li>No liability for misuse of products</li>
                </ul>
            </Section>

            <Section title='10. Privacy'>
                <p className='sm-gray'>
                    Your use of our services is also governed by our Privacy
                    Policy.
                </p>
            </Section>

            <Section title='11. Changes to These Terms'>
                <p className='sm-gray'>
                    We may update these terms anytime. Continued use means
                    acceptance.
                </p>
            </Section>

            <Section title='12. Contact & Disputes'>
                <p className='sm-gray'>For any questions or disputes:</p>
                <p className='sm-medium mt-2'>contact@griipbuddy.com</p>
            </Section>

            {/* Footer */}
            <div className='border-t pt-6'>
                <p className='xss-normal text-primary'>
                    Last updated: March 2026
                </p>
            </div>
        </div>
    );
}
