import type { Metadata } from 'next';
import { BlogSection } from '../(home)/components';

export const metadata: Metadata = {
    title: 'Blogs'
};

const BlogPage = () => {
    return <BlogSection aboveFold />;
};

export default BlogPage;
