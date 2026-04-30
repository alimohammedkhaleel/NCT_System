/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          primary: '#b36eff',
          light: '#d8a8ff',
          dark: '#6b1fa8',
          deep: '#4a0080',
          'very-dark': '#2a0050',
        },
        cyan: {
          primary: '#4ecdc4',
          light: '#7ed8d0',
          dark: '#2eb0a0',
        },
      },
      variables: {
        DEFAULT: {
          '--purple-primary': '#b36eff',
          '--purple-light': '#d8a8ff',
          '--purple-dark': '#6b1fa8',
          '--purple-deep': '#4a0080',
          '--purple-very-dark': '#2a0050',
          '--cyan-primary': '#4ecdc4',
          '--glow-purple': 'rgba(179, 110, 255, 0.5)',
        },
      },
    },
  },
  plugins: [],
}
