import React, { ReactNode, useState } from 'react';
import FAQPage from './Faq';
import ReviewsSection from './ReviewsSection';

const SingleProductDetails = ({ id, slug, productDetails }: any) => {
    const [activeTab, setActiveTab] = useState('details');
    // const { details } = product;
    const dynamicSpec = productDetails?.dynamic_specs ?? [];
    return (
        <div>
            {/* Tab Headers */}
            <div className='mb-8 flex justify-center border-b border-primary'>
                {[
                    'Product Details',
                    'Frequently Asked Questions',
                    'Reviews'
                ].map((tab) => {
                    const id = tab.toLowerCase().includes('details')
                        ? 'details'
                        : tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(id)}
                            className={`base-medium cursor-pointer px-4 py-2 transition-all duration-200 lg:px-8 lg:py-4 ${
                                activeTab === id
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content - Product Details */}
            {activeTab === 'details' && (
                <div className='animate-fadeIn grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16'>
                    {/* Left Column: Description & Features */}
                    <div>
                        <section className='mb-8'>
                            <h3 className='two-xl-medium mb-4'>Description</h3>

                            <div
                                className='base-medium prose prose-sm max-w-none leading-relaxed font-normal'
                                dangerouslySetInnerHTML={{
                                    __html: productDetails?.description || ''
                                }}
                            />
                        </section>
                    </div>

                    {/* Right Column: Tech Specs Table */}
                    <section className='border-t md:border-t-0'>
                        {(dynamicSpec?.length ?? 0) !== 0 && (
                            <h3 className='two-xl-medium mb-4'>
                                Specification
                            </h3>
                        )}
                        {dynamicSpec?.map?.((spec: any, index: number) => {
                            //  const optionsString = spec?.options
                            //   ?.map?.((opt: any, i: any) => `${opt}`)
                            //   ?.join(", ");
                            //  const displayContent = spec?.description
                            //   ? `${spec.description} ${optionsString ? `(${optionsString})` : ""}`
                            //   : optionsString || "N/A";
                            return (
                                <ProductDetailsBox
                                    key={index}
                                    title={spec?.title}
                                    content={spec?.description}
                                    options={spec?.options}
                                    isBorder={
                                        index !== (dynamicSpec?.length ?? 0) - 1
                                    }
                                />
                            );
                        })}
                    </section>
                </div>
            )}

            {activeTab === 'Frequently Asked Questions' && (
                <FAQPage productId={id} slug={slug} />
            )}

            {activeTab === 'Reviews' && <ReviewsSection slug={slug} />}
        </div>
    );
};

export default SingleProductDetails;

const ProductDetailsBox = ({
    title,
    content,
    options,
    isBorder = true
}: {
    title: string;
    content: string;
    options?: string[];
    isBorder?: boolean;
}) => {
    return (
        <div
            className={`grid grid-cols-2 items-start gap-4 py-4 ${
                isBorder ? 'border-b border-primary' : 'border-none'
            }`}
        >
            <span className='text-sm font-medium text-gray-900'>{title}</span>
            <span className='text-xs text-black md:text-sm'>
                {content}
                {options && options?.length > 0 && (
                    <ul className='mt-1 space-y-1'>
                        {options.map((opt, i) => (
                            <li key={i} className='text-black'>
                                • {opt}
                            </li>
                        ))}
                    </ul>
                )}
            </span>
        </div>
    );
};
