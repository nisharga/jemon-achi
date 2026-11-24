import { Button } from '@/components/core';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';

// Unmatched URLs anywhere on the site. With two root layouts ((site) and (public))
// there is no single layout to render a 404 in, so this page brings its own
// <html>, styles and font.

// Same font as the marketing site, but NOT preloaded: Next.js preloads this
// file's fonts on every route of the app, so a preloaded font here made each
// shop page download five font files it never uses.
const notFoundFont = Be_Vietnam_Pro({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-be-vietnam-pro',
    weight: ['400', '600'],
    preload: false
});
export const metadata: Metadata = {
    title: '404 - Page Not Found',
    robots: { index: false }
};

const NotFoundPage = () => {
    return (
        <html lang='en' className={notFoundFont.variable}>
            <body>
                <section className='flex min-h-screen items-center justify-center bg-hero-pattern bg-cover bg-center bg-no-repeat dark:bg-linear-to-t dark:from-gray-950 dark:to-gray-950'>
                    <div className='container'>
                        <div className='text-center'>
                            <h1 className='mb-4 text-center text-4xl leading-tight! text-gray-800 capitalize md:text-6xl dark:text-gray-100'>
                                Oops!{' '}
                                <span className='text-purple-700'>Nothing</span>{' '}
                                Here <br />
                                Page not found!
                            </h1>

                            <p className='mx-auto mb-10 sm:w-2/5'>
                                We&apos;r sorry, the page you are requested
                                could not be found. Please go back to the home
                                page.
                            </p>

                            <Button color='primary' href='/'>
                                Back To Home
                            </Button>
                        </div>
                    </div>
                </section>
            </body>
        </html>
    );
};

export default NotFoundPage;
