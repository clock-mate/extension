const config = {
    tabWidth: 4,
    singleQuote: true,
    printWidth: 100,
    endOfLine: 'lf',

    overrides: [{ files: '*.json', options: { tabWidth: 2 } }],
    plugins: ['prettier-plugin-ejs', 'prettier-plugin-tailwindcss'],
};
export default config;
