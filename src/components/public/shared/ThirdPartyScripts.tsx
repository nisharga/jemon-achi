'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import {
    GA_ID,
    GTM_ID,
    META_PIXEL_ID,
    PLAUSIBLE_DOMAIN,
    TRUSTPILOT_KEY
} from '@/configs/storefront';

/** Events that mean a real person is using the page. */
const INTERACTION_EVENTS = [
    'pointerdown',
    'pointermove',
    'keydown',
    'scroll',
    'touchstart'
] as const;

/** Load anyway after this long, for visitors who only look. */
const FALLBACK_DELAY_MS = 10_000;

/**
 * Analytics and marketing scripts for the storefront (~850 KB of JavaScript:
 * Google Tag Manager, Google Analytics, Meta Pixel, Trustpilot, Plausible).
 *
 * They are added on the visitor's first interaction (or after 10 seconds),
 * not while the page is loading. Loading them earlier made every storefront
 * page fight these scripts for bandwidth and CPU on phones, which pushed the
 * Lighthouse performance score down to the 40s–70s.
 */
export default function ThirdPartyScripts() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const load = () => setShouldLoad(true);
        const timer = setTimeout(load, FALLBACK_DELAY_MS);
        INTERACTION_EVENTS.forEach((event) =>
            window.addEventListener(event, load, { once: true, passive: true })
        );
        return () => {
            clearTimeout(timer);
            INTERACTION_EVENTS.forEach((event) =>
                window.removeEventListener(event, load)
            );
        };
    }, []);

    if (!shouldLoad) return null;

    return (
        <>
            {/* Plausible */}
            <Script
                src='https://plausible.innovgig.com/js/script.js'
                data-domain={PLAUSIBLE_DOMAIN}
                strategy='afterInteractive'
            />

            {/* Google Tag Manager */}
            <Script id='google-tag-manager' strategy='afterInteractive'>
                {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>

            {/* Google Analytics */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy='afterInteractive'
            />
            <Script id='google-analytics' strategy='afterInteractive'>
                {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>

            {/* Meta (Facebook) Pixel */}
            <Script id='meta-pixel' strategy='afterInteractive'>
                {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}', { em: 'email@email.com', ph: '1234567890' });
fbq('track', 'PageView');`}
            </Script>

            {/* Trustpilot review invitations */}
            <Script id='trustpilot' strategy='afterInteractive'>
                {`(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
f.parentNode.insertBefore(a,f)})(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
tp('register', '${TRUSTPILOT_KEY}');`}
            </Script>
        </>
    );
}
