import { SectionHeading } from '@/app/(public)/components';
import { BLOG_SECTION } from '@/static';
import BlogPostCard from './BlogPostCard';

const { heading, posts } = BLOG_SECTION;

interface IProps {
    /**
     * Set when the section is the first thing on the page: skips the
     * scroll fade-in and loads the card images straight away (LCP).
     */
    aboveFold?: boolean;
}

const BlogSection = ({ aboveFold = false }: IProps) => {
    return (
        <section data-aos={aboveFold ? undefined : 'fade-up'} className='py-16'>
            <div className='container'>
                <SectionHeading {...heading} className='mb-16 lg:w-3/5' />
                <div className='grid gap-6 xs:grid-cols-2 md:grid-cols-3 lg:gap-10'>
                    {(posts ?? []).map(({ slug, ...posts }, index) => (
                        <BlogPostCard
                            key={slug}
                            eager={aboveFold}
                            preload={aboveFold && index === 0}
                            {...posts}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
