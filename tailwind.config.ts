import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFB7C5',
        secondary: '#B5EAD7',
        accent: '#FFDAC1',
        lavender: '#C7CEEA',
        lemon: '#FFFACD',
        background: '#FFF9FB',
        'app-text': '#5C4A6E',
      },
      fontFamily: {
        baloo: ['"ZCOOL KuaiLe"', '"Baloo 2"', 'cursive'],
      },
    },
  },
  plugins: [],
}
export default config
