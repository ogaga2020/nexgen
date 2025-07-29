import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Open Sans', 'sans-serif'],
                ui: ['Inter', 'sans-serif'],
            },
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: 'var(--primary)',
                accent: 'var(--accent)',
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
                graybase: 'var(--gray-base)',
            },
        },
    },
    plugins: [],
};
export default config;
