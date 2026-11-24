import { Icons } from '@/shop/components/global/Icons';
import { SOCIAL_LINKS } from '@/shop/config/footer_links';

/** Round icon links to our social pages. Each has a name for screen readers. */
export default function SocialLinks() {
    return (
        <ul className='flex items-center gap-1'>
            {SOCIAL_LINKS.map(({ name, url, icon }) => {
                const Icon = Icons[icon];
                return (
                    <li key={name}>
                        <a
                            href={url}
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label={name}
                            className='text-primary-ink inline-flex size-11 items-center justify-center rounded-full transition hover:-translate-y-1 hover:bg-primary/10'
                        >
                            <Icon className='size-5' aria-hidden='true' />
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}
