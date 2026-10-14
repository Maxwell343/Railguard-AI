/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FAF9F6',
          100: '#F4F2EC', // Primary background
          200: '#EBE7DD',
          300: '#DFD9CB',
          400: '#CDC5B3',
        },
        charcoal: {
          950: '#171A19',
          900: '#252A28', // Primary text and dark technical panels
          800: '#343B38',
          700: '#47514D',
          600: '#5F6C67',
          500: '#7B8883',
          400: '#9BA6A1',
        },
        signal: {
          orange: '#D9653B', // Restrained signal orange
          'orange-hover': '#C5542C',
          'orange-subtle': '#FAF0EC',
          'orange-border': '#E8A389',
        },
        sage: {
          100: '#EDF1EC',
          200: '#DDE4DB', // Muted sage for positive states
          300: '#C2CFC0',
          700: '#4A5B48',
          800: '#354334',
        },
        rail: {
          border: '#DCD8CE',
          'border-strong': '#CCC7BA',
          surface: '#FAF8F4',
          subtle: '#EAE6DC',
        },
        defect: {
          spalling: '#D9653B', // Signal orange
          wheelburn: '#C88528', // Industrial amber/ochre
          squat: '#B83227', // Deep railway red
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
        display: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        technical: '0.04em',
        wide: '0.08em',
      },
    },
  },
  plugins: [],
}
