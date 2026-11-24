import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Input } from '@/shop/components/ui/input';

interface FormShape {
    value?: string | null;
}

interface AnimatedInputProps {
    /** Matches the `htmlFor` of the field's <Label>. */
    id?: string;
    form?: FormShape;
    value?: string;
    setField?: (field: string, value: string) => void;
    onChange?: (value: string) => void;
    placeholder?: string;
}

const AnimatedInput = ({
    id,
    form,
    value,
    setField,
    onChange,
    placeholder = ''
}: AnimatedInputProps) => {
    const text = String(placeholder || '');
    const letters = Array.from(text);

    // Container variants with 3s total duration logic
    const container: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: letters.length ? 3 / letters.length : 0.05 // Spreads letters over ~3 seconds
            }
        }
    };

    const child: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            display: 'inline-block'
        },
        hidden: {
            opacity: 0,
            y: 10,
            display: 'inline-block'
        }
    };

    const cursorVariants: Variants = {
        blinking: {
            opacity: [0, 1, 0],
            transition: { duration: 0.8, repeat: Infinity, ease: 'linear' }
        }
    };

    // derive current value from either form or standalone prop
    const currentValue = (form && (form.value ?? '')) ?? value ?? '';

    const handleChange = (val: string) => {
        if (typeof setField === 'function') setField('value', val);
        if (typeof onChange === 'function') onChange(val);
    };

    return (
        <div className='relative w-full'>
            {/* 1. The Animated Overlay (Hidden when user types) */}
            {!currentValue && (
                <motion.div
                    className='sm-normal-gray pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center'
                    variants={container}
                    initial='hidden'
                    animate='visible'
                >
                    {letters.map((letter, index) => (
                        <motion.span key={index} variants={child}>
                            {letter === ' ' ? '\u00A0' : letter}
                        </motion.span>
                    ))}

                    {/* The Moving Cursor */}
                    {/* <motion.span
            variants={cursorVariants}
            animate="blinking"
            className="ml-0.5 inline-block w-[2px] h-4 bg-[#ff5c00]"
          /> */}
                </motion.div>
            )}

            {/* 2. The Actual Input */}
            <Input
                id={id}
                className='h-12 rounded-lg bg-transparent text-sm focus-visible:ring-[#ff5c00]'
                value={currentValue}
                onChange={(e) => handleChange(e.target.value)}
                required
            />
        </div>
    );
};

export default AnimatedInput;
