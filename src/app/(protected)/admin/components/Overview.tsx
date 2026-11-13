import { OVERVIEW_CARDS } from '../static';
import OverviewCard from './OverviewCard';

const Overview = () => {
    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>Overview</h1>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {OVERVIEW_CARDS.map(({ id, ...card }) => (
                    <OverviewCard key={id} {...card} />
                ))}
            </div>
        </section>
    );
};

export default Overview;
