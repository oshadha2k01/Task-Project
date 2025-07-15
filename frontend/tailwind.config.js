/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#4F46E5',
          dark: '#6366F1', 
        },
        secondary: {
          light: '#10B981', 
          dark: '#34D399',  
        },
        surface: {
          light: '#FFFFFF', 
          dark: '#111827',  
        },
        background: {
          light: '#F9FAFB', 
          dark: '#1F2937',  
        }
      }
    },
  },
  plugins: [],
} 