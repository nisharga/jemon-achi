const lintStagedConfig = {
    // Type check the whole project whenever any TS file is staged
    'src/**/*.{ts,tsx}': () => 'tsc --noEmit',

    // Format and lint staged JS/TS files
    'src/**/*.{js,jsx,ts,tsx,mjs}': ['prettier --write', 'eslint --fix'],

    // Format everything else
    'src/**/*.{css,json}': ['prettier --write'],
    '*.{js,mjs,json,md}': ['prettier --write']
};

export default lintStagedConfig;
