import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Storefront (griipbuddy-frontend) and admin (griipbuddy-admin-new) code
    // imported as-is: relaxed until it is cleaned up. The rest of the app keeps
    // the strict rules.
    {
        files: [
            'src/components/public/**',
            'src/redux/public/**',
            'src/types/public/**',
            'src/hooks/{use-click-outside,use-debounced-value,use-user,useProductOffer,public-use-debounce}.ts',
            'src/lib/{category-image,cookies,customer-session,get-media-url,logout,meta-pixel,offerHelper,user-store,public-utils}.ts',
            'src/lib/data/**',
            'src/providers/public-store-provider.tsx',
            'src/app/(public)/**',
            // admin code (moved out of src/admin into the shared src/ folders)
            'src/constants/**',
            'src/providers/admin-store-provider.tsx',
            'src/redux/admin/**',
            'src/schema/**',
            'src/components/{form-items,tiptap,shared,skeletons}/**',
            'src/components/app-{header,sidebar}.tsx',
            'src/auth/admin-*.ts',
            'src/lib/admin-utils.ts',
            'src/components/ui/{admin-sidebar,date-picker,date-range-calendar,product-short-videos-upload}.tsx',
            'src/hooks/{admin-use-mobile,use-loggedin-user,useStaffByRoles}.ts',
            'src/types/admin/**',
            'src/utils/{excel-generator,get-media-url,pdf-generator,pdf-summary-generator}.ts',
            'src/app/(admin)/**',
            'src/app/api/fraud-check/**'
        ],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            // React Compiler skips these components (safe), so warn only.
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/immutability': 'warn',
            'react-hooks/static-components': 'warn',
            'react-hooks/purity': 'warn',
            'react-hooks/preserve-manual-memoization': 'warn'
        }
    },
    // Must come last: disables formatting rules that conflict with Prettier.
    prettier,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        // Read-only reference projects, not part of this app.
        'starter/**',
        'readme/**'
    ])
]);

export default eslintConfig;
