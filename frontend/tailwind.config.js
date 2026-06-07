/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080C14',
        surface: '#0D1321',
        card: '#111827',
        border: '#1F2937',
        accent: '#6366F1',
        'accent-light': '#818CF8',
        cyan: '#06B6D4',
        green: '#10B981',
        red: '#EF4444',
        yellow: '#F59E0B',
        muted: '#6B7280',
        subtle: '#374151',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #6366F1, 0 0 10px #6366F1' },
          '100%': { boxShadow: '0 0 10px #6366F1, 0 0 30px #6366F1, 0 0 60px #6366F1' },
        },
      },
    },
  },
  plugins: [],
}
