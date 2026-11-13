import { SectionHeading } from '@/app/(public)/components';
import { BLOG_SECTION } from '@/static';
import BlogPostCard from './BlogPostCard';

const { heading, posts } = BLOG_SECTION;

const BlogSection = () => {
    return (
        <section data-aos='fade-up' className='py-16'>
            <div className='container'>
                <SectionHeading {...heading} className='mb-16 lg:w-3/5' />
                <div className='grid gap-6 xs:grid-cols-2 md:grid-cols-3 lg:gap-10'>
                    {(posts ?? []).map(({ slug, ...posts }) => (
                        <BlogPostCard key={slug} {...posts} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
