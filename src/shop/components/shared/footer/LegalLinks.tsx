import Link from 'next/link';
import { LEGAL_LINKS } from '@/shop/config/footer_links';

/** "Privacy Policy · Terms & Conditions" at the very bottom. */
export default function LegalLinks() {
    return (
        <ul className='flex flex-wrap justify-center gap-4 text-xs tracking-wide text-gray-700 uppercase'>
            {LEGAL_LINKS.map((link) => (
                <li key={link.url}>
                    <Link href={link.url} className='hover:underline'>
                        {link.name}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
