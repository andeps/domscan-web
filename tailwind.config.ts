import type { Config } from 'tailwindcss'
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { brand: '#f97316', navy: '#102a43' } } }, plugins: [] } satisfies Config
