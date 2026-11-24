import Link from 'next/link';
import type { FooterLink } from '@/configs/footer-links';

/** A titled list of links, e.g. "Quick Links". */
export default function FooterColumn({
    title,
    links
}: {
    title: string;
    links: FooterLink[];
}) {
    return (
        <nav aria-label={title} className='space-y-2 lg:space-y-4'>
            <h2 className='sm-medium text-primary-ink tracking-widest uppercase'>
                {title}
            </h2>
            <ul className='space-y-1 lg:space-y-2'>
                {links.map((link) => (
                    <li key={link.name}>
                        <Link
                            href={link.url}
                            className='hover:text-primary-ink inline-block text-[13px] text-gray-700 transition-transform hover:translate-x-1'
                        >
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
