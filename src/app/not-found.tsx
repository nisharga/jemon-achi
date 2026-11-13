import { Button } from '@/components/core';

const NotFoundPage = () => {
    return (
        <section className='flex min-h-screen items-center justify-center bg-hero-pattern bg-cover bg-center bg-no-repeat dark:bg-linear-to-t dark:from-gray-950 dark:to-gray-950'>
            <div className='container'>
                <div className='text-center'>
                    <h1 className='mb-4 text-center text-4xl leading-tight! text-gray-800 capitalize md:text-6xl dark:text-gray-100'>
                        Oops! <span className='text-purple-700'>Nothing</span>{' '}
                        Here <br />
                        Page not found!
                    </h1>

                    <p className='mx-auto mb-10 sm:w-2/5'>
                        We&apos;r sorry, the page you are requested could not be
                        found. Please go back to the home page.
                    </p>

                    <Button color='primary' href='/'>
                        Back To Home
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default NotFoundPage;
