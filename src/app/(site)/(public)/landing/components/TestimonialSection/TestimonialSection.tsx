'use client';
import { SectionHeading } from '@/app/(site)/(public)/components';
import { Icons } from '@/components/Icons';
import { TESTIMONIAL_SECTION } from '@/static';
import { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import TestimmonialCard from './TestimmonialCard';
const { heading, details, reviews } = TESTIMONIAL_SECTION;

const settings = {
    className: 'slick-container',
    centerMode: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerPadding: '0',
    dots: false,
    arrows: false,
    swipe: false,
    autoPlay: true,
    responsive: [
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
};

const TestimonialSection = () => {
    const sliderRef = useRef<Slider | null>(null); // type: Slider | null

    const nextSlide = () => {
        if (sliderRef.current) {
            sliderRef.current.slickNext();
        }
    };

    const prevSlide = () => {
        if (sliderRef.current) {
            sliderRef.current.slickPrev();
        }
    };
    return (
        <section className='py-16'>
            <div className='container'>
                <div className='grid-cols-2 gap-16 md:grid'>
                    <div data-aos='fade-up' className=''>
                        <SectionHeading {...heading} className='mb-6' />
                        <p className='mb-10 md:mb-0'>{details}</p>
                    </div>
                    <div className='w-full'>
                        <div className='mb-8'>
                            <Slider ref={sliderRef} {...settings}>
                                {(reviews ?? []).map((review) => (
                                    <div
                                        key={review.id}
                                        className='px-4'
                                        data-aos='fade-down'
                                    >
                                        <TestimmonialCard {...review} />
                                    </div>
                                ))}
                            </Slider>
                        </div>
                        <div className='flex items-center justify-center gap-4'>
                            <Icons.LongArrow
                                className='rotate-180 cursor-pointer hover:fill-gray-700'
                                onClick={prevSlide}
                            />
                            <Icons.LongArrow
                                className='cursor-pointer hover:fill-gray-700'
                                onClick={nextSlide}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
