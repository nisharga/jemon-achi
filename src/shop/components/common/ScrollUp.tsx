'use client';
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/shop/lib/utils';

const ScrollUp = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Distance from the bottom of the page
            const distanceFromBottom =
                documentHeight - (scrollY + windowHeight);

            // Condition: More than 1000px from top AND more than 400px from bottom
            if (scrollY > 1000 && distanceFromBottom > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                'fixed right-2 bottom-20 z-[99] cursor-pointer rounded-full border border-gray-300 bg-white p-2 text-gray-700 shadow-lg transition-all duration-300 ease-in-out hover:border-primary hover:bg-[#1A1A1A] hover:text-white active:scale-90 lg:right-5 lg:p-3',
                isVisible
                    ? 'translate-y-0 scale-100 opacity-100'
                    : 'pointer-events-none translate-y-10 scale-50 opacity-0'
            )}
            aria-label='Scroll to top'
        >
            <ArrowUp size={24} strokeWidth={1.5} />
        </button>
    );
};

export default ScrollUp;
