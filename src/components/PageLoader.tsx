import { Loader } from 'lucide-react';

/** Full-height centred spinner used as a Suspense fallback. */
const PageLoader = () => {
    return (
        <div className='grid min-h-screen w-full place-items-center'>
            <Loader className='size-6 animate-spin text-muted-foreground' />
        </div>
    );
};

export default PageLoader;
