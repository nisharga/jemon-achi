import { Container } from '@/components/public/common/container';
import ScrollUp from '@/components/public/common/ScrollUp';
import {
    COMPANY_LINKS,
    QUICK_LINKS,
    SHOP_LINKS,
    STYLE_LINKS
} from '@/configs/footer-links';
import FooterColumn from './FooterColumn';
import LegalLinks from './LegalLinks';
import SocialLinks from './SocialLinks';

/** Site footer: link columns, then legal links and social icons. */
export default function Footer() {
    return (
        <footer className='mt-4 bg-white pt-8 pb-8 shadow-sm sm:mt-8 lg:pt-16'>
            <Container className='px-2 sm:px-6 md:px-10'>
                <div className='mb-4 grid grid-cols-2 gap-4 sm:mb-16 md:grid-cols-4 lg:gap-10'>
                    <FooterColumn title='Quick Links' links={QUICK_LINKS} />
                    <FooterColumn title='Shop' links={SHOP_LINKS} />
                    <FooterColumn title='Company' links={COMPANY_LINKS} />
                    <FooterColumn title='Shop By Style' links={STYLE_LINKS} />
                </div>

                <div className='flex flex-col items-center justify-between gap-2 border-t border-primary/20 pt-4 pb-12 sm:pt-8 md:flex-row lg:pb-0'>
                    <LegalLinks />
                    <SocialLinks />
                </div>
            </Container>

            <ScrollUp />
        </footer>
    );
}
