/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],      // 48px
        'title': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],     // 32px
        'heading': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }], // 24px
        'subheading': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }], // 20px
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],                  // 18px
        'body': ['1rem', { lineHeight: '1.6' }],                         // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],                  // 14px
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }], // 12px
      },
      borderRadius: {
        'sm': '6px',   // Pequeno
        'md': '8px',   // Médio (botões)
        'lg': '8px',   // Médio (botões)
        'xl': '12px',  // Médio (cards)
        '2xl': '16px', // Grande (modais)
        'full': '9999px',
      },
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        secondary: {
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)',
        },
        accent: {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
        },
        // Sunny Yellow to Orange
        sunny: {
          400: 'var(--color-sunny-400)',
          500: 'var(--color-sunny-500)',
          600: 'var(--color-sunny-600)',
        },
        warm: {
          500: 'var(--color-warm-500)',
          600: 'var(--color-warm-600)',
        },
        // Lime Green
        lime: {
          400: 'var(--color-lime-400)',
          500: 'var(--color-lime-500)',
          600: 'var(--color-lime-600)',
        },
        // Sobrescrever cores gray para usar variáveis do tema
        gray: {
          50: 'var(--bg-main)',
          100: 'var(--bg-secondary)',
          200: 'var(--border-color)',
          300: 'var(--border-color)',
          400: 'var(--text-secondary)',
          500: 'var(--text-secondary)',
          600: 'var(--text-secondary)',
          700: 'var(--text-secondary)',
          800: 'var(--text-primary)',
          900: 'var(--text-primary)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
        'inner-glow': 'inset 0 2px 20px rgba(255, 255, 255, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-pink-coral': 'var(--gradient-pink-coral)',
        'gradient-turquoise-lime': 'var(--gradient-turquoise-lime)',
        'gradient-yellow-orange': 'var(--gradient-yellow-orange)',
        'gradient-pink-coral-orange': 'var(--gradient-pink-coral-orange)',
        'gradient-bg-main': 'var(--gradient-bg-main)',
      },
    },
  },
  plugins: [],
};
