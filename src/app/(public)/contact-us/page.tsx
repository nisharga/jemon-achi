'use client';

import { useMounted } from '@/hooks';
import { ContactForm } from './components';

const ContactUsPage = () => {
    const isMounted = useMounted();

    return (
        <section className='py-10'>
            <div className='container'>
                <div className='mb-14 text-center'>
                    <h1 className='mb-2 flex items-center justify-center gap-2 text-4xl'>
                        Contact Us
                    </h1>
                    <p>Speak to our team and get all your questions answered</p>
                </div>
                <div className='flex grid-cols-2 flex-col gap-10 md:grid'>
                    <div>
                        <ContactForm />
                    </div>
                    <div className='relative min-h-[400px] overflow-hidden rounded-lg border border-purple-100'>
                        <p className='absolute top-20 left-1/2 -translate-x-1/2 dark:text-gray-300'>
                            Calendar is loading...
                        </p>
                        {isMounted ? (
                            <div>
                                <div
                                    className='calendly-inline-widget h-[800px]'
                                    data-url='https://calendly.com/truup/book-for-free-consultation'
                                ></div>
                                <script
                                    type='text/javascript'
                                    src='https://assets.calendly.com/assets/external/widget.js'
                                    async
                                ></script>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactUsPage;
