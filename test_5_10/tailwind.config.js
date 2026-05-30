/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', '"SF Pro Display"', '-apple-system', 'sans-serif'],
        mono: ['"DM Mono"', '"JetBrains Mono"', 'monospace']
      },
      colors: {
        ff: {
          bg: 'var(--bg-primary)',
          'bg-secondary': 'var(--bg-secondary)',
          surface: 'var(--bg-surface)',
          text: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent-primary)',
          'accent-secondary': 'var(--accent-secondary)',
          border: 'var(--border)',
          danger: 'var(--danger)',
          success: 'var(--success)'
        }
      },
      borderRadius: {
        widget: '8px',
        card: '12px',
        panel: '16px'
      },
      transitionDuration: {
        fast: '200ms',
        normal: '300ms'
      }
    }
  },
  plugins: []
}
