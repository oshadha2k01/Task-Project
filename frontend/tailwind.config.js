/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4F46E5', // Indigo 600
          dark: '#6366F1',  // Indigo 500
        },
        secondary: {
          light: '#10B981', // Emerald 500
          dark: '#34D399',  // Emerald 400
        },
        surface: {
          light: '#FFFFFF', // White
          dark: '#111827',  // Gray 900
        },
        background: {
          light: '#F9FAFB', // Gray 50
          dark: '#1F2937',  // Gray 800
        }
      }
    },
  },
  plugins: [],
} 