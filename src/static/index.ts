import { SOCIAL_MEDIAS } from './HomeFeaturesList';

export * from './homePage';

export const MENUS = [
    {
        id: 1,
        label: 'Connectors',
        route: '/#connectors',
        isButton: false
    },
    {
        id: 2,
        label: 'Features',
        route: '/#features',
        isButton: false
    },
    {
        id: 3,
        label: 'Pricing',
        route: '/#pricing',
        isButton: false
    },
    {
        id: 4,
        label: 'Contact Sales',
        route: '/contact-us',
        isButton: true
    }
];

export const FOOTER_SECTION = {
    title: 'Join our newsletter',
    description:
        'Stay up to date on TruUp, the automated software asset management built specifically for MSPs.',
    socialMedias: {
        heading: 'Follow Us.',
        links: SOCIAL_MEDIAS
    },
    widgets: [
        {
            heading: 'Quick Links',
            links: [
                {
                    label: 'Connectors',
                    url: '/#connectors'
                },
                {
                    label: 'Features',
                    url: '/#features'
                },
                {
                    label: 'Pricing',
                    url: '/#pricing'
                },
                {
                    label: 'Contact Sales',
                    url: '/contact-us'
                }
            ]
        }
    ]
};
