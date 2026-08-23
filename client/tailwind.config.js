/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        navText: 'var(--nav-text)',
        pillDark: 'var(--pill-dark)',
        signInText: 'var(--sign-in-text)',
        trustBg: 'var(--trust-bg)',
        trustBorder: 'var(--trust-border)',
        trustText: 'var(--trust-text)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      boxShadow: {
        'nav': 'var(--nav-shadow)',
      },
    },
  },
  plugins: [],
}
