import Link from 'next/link';

/** "View all" style link shown next to a section heading. */
const SectionLink = ({ label, url }: { label: string; url: string }) => (
    <Link href={url} className='base-normal tracking-tight underline'>
        {label}
    </Link>
);

export default SectionLink;
