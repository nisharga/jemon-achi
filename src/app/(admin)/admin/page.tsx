import { redirect } from 'next/navigation';

// The dashboard home is the overview page.
export default function AdminIndexPage() {
    redirect('/admin/overview');
}
