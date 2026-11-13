import type { Metadata } from 'next';
import { Overview } from './components';

export const metadata: Metadata = {
    title: 'Dashboard'
};

const AdminPage = () => {
    return <Overview />;
};

export default AdminPage;
