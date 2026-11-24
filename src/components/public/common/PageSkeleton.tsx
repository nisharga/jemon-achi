import { Container } from './container';

/**
 * Grey placeholder for a page whose content depends on the URL (a product,
 * a search…) while the server renders it. Tall enough that the footer does
 * not jump when the real content arrives.
 */
export default function PageSkeleton() {
    return (
        <Container className='min-h-screen py-8'>
            <div className='mb-6 h-8 w-48 animate-pulse rounded bg-gray-200' />
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
                {Array.from({ length: 10 }, (_, index) => (
                    <div
                        key={index}
                        className='aspect-square animate-pulse rounded-lg bg-gray-100'
                    />
                ))}
            </div>
        </Container>
    );
}
