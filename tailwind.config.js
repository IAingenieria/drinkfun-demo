/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Marca Drink Fun (DF): Tinta = negro de las letras del logo
        marino: {
          DEFAULT: '#1A2330',
          light: '#2C3A4D',
          dark: '#0E1620',
        },
        // Coral = rojo del splash del logo
        acento: {
          DEFAULT: '#F23A4A',
          light: '#F56474',
          dark: '#C2202F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(26,35,48,0.08), 0 1px 2px rgba(26,35,48,0.06)',
        soft: '0 4px 16px rgba(26,35,48,0.10)',
      },
    },
  },
  plugins: [],
}
