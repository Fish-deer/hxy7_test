import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        muted: '#64748b'
      }
    }
  },
  plugins: []
} satisfies Config;
