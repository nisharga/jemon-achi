import { ReactNode } from 'react';

// Auth pages: no marketing header/footer, no dashboard shell — just a centred
// card. No Redux here on purpose (see `src/auth/login-request.ts`), so the
// login pages are fully prerendered and the form is in the first HTML.
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <section className='grid min-h-screen w-full place-items-center px-4 py-10'>
            {children}
        </section>
    );
}
