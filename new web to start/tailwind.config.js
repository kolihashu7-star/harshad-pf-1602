/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#e94560',
        success: '#00d9a5',
        warning: '#ffc93c',
        error: '#ff6b6b',
        background: '#0f0f1a',
        surface: '#1f1f35',
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0b0',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'hover': '0 8px 30px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}

