import Section from '../_components/Section';

export default function ContactSupportPage() {
    return (
        <div className='mx-auto max-w-4xl space-y-8 px-4 py-10'>
            {/* Header */}
            <div className='space-y-3'>
                <h1 className='two-xl-medium'>Contact & Support</h1>
                <p className='sm-gray'>We&#39;re here whenever you need us.</p>
                <p className='sm-gray'>
                    Have a question, need help finding the perfect product, or
                    just want to talk to a real person? The GriipBuddy team is
                    always close by. We don&#39;t believe in long waits or
                    robotic replies — just fast, friendly, and genuine support
                    every time.
                </p>
            </div>

            {/* Section Component */}
            <Section title='Get In Touch'>
                <ul className='sm-gray list-none space-y-2'>
                    <li>
                        <span className='sm-semibold'>Facebook Messenger:</span>{' '}
                        <a
                            href='https://m.me/griipbuddy'
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
            </Section>

            <Section title='A Few Things We Can Help With'>
                <ul className='sm-gray list-disc space-y-1 pl-5'>
                    <li>Order status and delivery updates</li>
                    <li>Product recommendations and sizing</li>
                    <li>
                        Purchase assistance — we&#39;ll guide you through every
                        step of finding and buying the right product for you
                    </li>
                    <li>Returns, exchanges, and warranty queries</li>
                    <li>Wholesale and bulk order enquiries</li>
                    <li>Collaborations and partnerships</li>
                </ul>
            </Section>

            <Section title='Not Satisfied With Our Support?'>
                <p className='sm-gray'>
                    We hold ourselves to a high standard — and if we ever fall
                    short, we want to know. If your concern was not addressed
                    properly or you are unhappy with the support you received,
                    please escalate directly to:
                </p>
                <p className='sm-medium mt-2'>contact@griipbuddy.com</p>
                <p className='sm-gray mt-2'>
                    Every complaint is reviewed personally. Your trust means
                    everything to us and we are committed to making it right.
                </p>
            </Section>

            <Section title='Response Times'>
                <p className='sm-gray'>
                    We pride ourselves on being genuinely fast. Most messages on
                    Messenger, Instagram DM, and WhatsApp are answered within 5
                    minutes. For email queries, we respond within 24 hours.
                </p>
                <p className='sm-gray mt-2 font-medium'>
                    Active 7 days a week, 8:00am – 12:00am (Bangladesh Standard
                    Time)
                </p>
            </Section>

            {/* Footer */}
            <div className='border-t pt-6'>
                <p className='xss-normal text-primary-ink'>
                    Last updated: March 2026
                </p>
            </div>
        </div>
    );
}
