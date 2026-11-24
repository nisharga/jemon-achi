import type { ReactNode } from 'react';

/**
 * One titled section of a policy page.
 *
 * Plain markup on purpose: it used to fade in with framer-motion, which kept
 * the page text invisible until the JavaScript had loaded.
 */
const Section = ({
    title,
    children
}: {
    title: string;
    children: ReactNode;
}) => (
    <section className='space-y-3'>
        <h2 className='base-semibold'>{title}</h2>
        <div>{children}</div>
    </section>
);

export default Section;
