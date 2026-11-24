import { useCreateFAQMutation, useGetFAQsQuery } from '@/redux/public/api/faqs';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ErrorState, { NoData } from '@/components/public/global/ErrorState';

const FAQPage = ({ productId, slug }: { productId: string; slug: string }) => {
    const { data, isLoading, isError, error, refetch } = useGetFAQsQuery({
        slug: slug
    });
    const faqs = data?.data?.faqs ?? [];
    const [createFAQ, { isLoading: isSubmitting }] = useCreateFAQMutation();

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        question: '',
        nickname: '',
        email: '',
        agreed: false
    });

    const handlePost = async (e: any) => {
        e.preventDefault();
        try {
            const payload = {
                question: formData?.question,
                createdBy: formData?.nickname, // optional
                email: formData?.email, // optional
                product: productId // required
            };
            const res: any = await createFAQ({ productId, payload });

            if (res?.data?.success) {
                toast.success('Faq created successfully!');
                setShowForm(false);
            } else {
                toast.error(res?.error?.data?.message);
            }
        } catch (error) {
            console.error('CREATE USER ERROR: ', error);
            toast.error('Something went wrong!');
            setShowForm(false);
        }
    };

    /* if (error) {
    return (
      <div className="max-w-5xl mx-auto p-20 text-center">
        <h2 className="text-red-500 text-xl font-bold">Failed to load FAQs</h2>
        <p className="text-gray-600">
          {error?.data?.message || "Something went wrong. Please try again later."}
        </p>
        <button onClick={() => refetch()} className="underline mt-2">
          Try again
        </button>
      </div>
    );
  } */

    return (
        <div className='mx-auto max-w-5xl p-2 font-sans lg:p-6'>
            {/* FAQ List Content */}
            <div className='mb-16 space-y-12'>
                {isError ? (
                    <ErrorState isError={isError} onRetry={refetch} />
                ) : isLoading ? (
                    <FAQSkeleton />
                ) : !faqs || (faqs?.length ?? 0) === 0 ? (
                    <NoData message='No FAQs found for this product.' />
                ) : (
                    faqs?.map?.((faq: any) => (
                        <div key={faq?._id} className='border-b pb-8'>
                            <div className='mb-2 flex justify-between'>
                                <p className='text-sm font-normal'>
                                    {faq?.createdBy}{' '}
                                    <span className='font-normal text-gray-600'>
                                        ·{' '}
                                        {faq?.createdAt &&
                                            new Date(
                                                faq.createdAt
                                            ).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                    </span>
                                </p>
                            </div>
                            <h3 className='mb-4 text-base font-medium lg:text-lg'>
                                {faq?.question}
                            </h3>
                            {faq?.answer && (
                                <div className='ml-4 border-l-4 border-gray-200 bg-gray-50 p-4'>
                                    <p className='text-sm font-medium'>
                                        {'Griipbuddy Admin'}{' '}
                                        <span className='font-normal text-gray-600'>
                                            ·
                                            {faq?.updatedAt &&
                                                new Date(
                                                    faq?.updatedAt
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                        </span>
                                    </p>
                                    <p className='mt-2 text-gray-700'>
                                        {faq?.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Button and Form Logic */}
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className='cursor-pointer bg-primary px-4 py-2 font-medium tracking-tighter text-primary-foreground lg:uppercase'
                >
                    Submit a question to be added to FAQ
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ amount: 0.2 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for a "snappy" feel
                    }}
                    className='animate-fadeIn rounded-sm border border-gray-200 bg-gray-50 p-4 lg:p-8'
                >
                    <div className='mb-4 flex items-center justify-between'>
                        <h2 className='text-xl font-semibold lg:text-2xl'>
                            Submit a question to be added to FAQ
                        </h2>
                        <button
                            onClick={() => setShowForm(false)}
                            className='text-3xl text-gray-600 hover:text-black'
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handlePost} className='space-y-6'>
                        <div>
                            <label className='mb-1 block font-bold'>
                                Question*{' '}
                                <span className='text-xs font-normal text-gray-600'>
                                    Maximum of 255 characters.
                                </span>
                            </label>
                            <textarea
                                required
                                className='h-32 w-full border p-3 outline-none focus:border-black'
                                placeholder='Ask a question...'
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        question: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div>
                                <label className='mb-1 block font-bold'>
                                    Your Nickname*
                                </label>
                                <input
                                    required
                                    type='text'
                                    className='w-full border p-3'
                                    placeholder='Example: jackie27'
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nickname: e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className='mb-1 block font-bold'>
                                    Email*
                                </label>
                                <input
                                    required
                                    type='email'
                                    className='w-full border p-3'
                                    placeholder='Example: youremail@example.com'
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <label className='flex cursor-pointer items-start gap-3'>
                            <input
                                type='checkbox'
                                required
                                className='mt-1'
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        agreed: e.target.checked
                                    })
                                }
                            />
                            <span className='text-sm text-gray-600 italic'>
                                I agree to the terms of use and confirm I am
                                over 16 years old.
                            </span>
                        </label>

                        <button
                            disabled={isSubmitting}
                            type='submit'
                            className='cursor-pointer rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground uppercase disabled:bg-gray-400 lg:px-8 lg:py-3'
                        >
                            {isSubmitting ? 'Posting...' : 'Post Question'}
                        </button>
                    </form>
                </motion.div>
            )}
        </div>
    );
};

export default FAQPage;

const FAQSkeleton = () => (
    <div className='animate-pulse space-y-10'>
        {[1, 2].map((i) => (
            <div key={i} className='border-b pb-8'>
                <div className='mb-4 flex items-start justify-between'>
                    <div className='h-4 w-1/4 rounded bg-gray-200'></div>{' '}
                    {/* User info */}
                    <div className='h-14 w-14 bg-gray-200'></div>{' '}
                    {/* Answer box */}
                </div>
                <div className='mb-6 h-6 w-3/4 rounded bg-gray-200'></div>{' '}
                {/* Question text */}
                <div className='ml-4 space-y-3 border-l-4 border-gray-100 pl-4'>
                    <div className='h-4 w-1/3 rounded bg-gray-100'></div>{' '}
                    {/* Admin info */}
                    <div className='h-4 w-full rounded bg-gray-100'></div>{' '}
                    {/* Answer line 1 */}
                    <div className='h-4 w-5/6 rounded bg-gray-100'></div>{' '}
                    {/* Answer line 2 */}
                </div>
            </div>
        ))}
    </div>
);
