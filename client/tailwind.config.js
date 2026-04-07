/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        mfg: {
          bg: '#F7F8FC',
          peach: '#FFF4E6',
          mint: '#E8F8F5',
          blush: '#FDEDEC',
          lilac: '#F4ECF7',
          sky: '#EAF2F8',
          coral: '#FF8A65',
          green: '#7ED957',
          yellow: '#FFD93D',
          blue: '#5DADE2',
        },
      },
      borderRadius: {
        playful: '20px',
        card: '24px',
      },
      boxShadow: {
        lift: '0 12px 28px -8px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
