/**
 * Heading of a storefront section.
 *
 * A plain server component on purpose: it used to fade in with framer-motion,
 * which kept every section heading invisible until the JavaScript had loaded.
 */
const SectionTitle = ({ title }: { title: string }) => (
    <h2 className='section-title'>{title}</h2>
);

export default SectionTitle;
