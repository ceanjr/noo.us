import React, { createContext, useContext, useEffect } from 'react';

export const themes = {
  light: {
    name: 'Modo Claro',
    description: 'Visual limpo e moderno',
    icon: '☀️',
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    accent: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    backgrounds: {
      main: '#ffffff',
      surface: '#f9fafb',
      hover: '#f3f4f6',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#06b6d4',
  },
};

const defaultContextValue = {
  currentTheme: 'light',
  theme: themes.light,
  changeTheme: () => {},
  themes,
};

const ThemeContext = createContext(defaultContextValue);

const applyThemeVariables = (theme) => {
  const root = document.documentElement;

  Object.entries(theme.primary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });
  Object.entries(theme.secondary).forEach(([shade, color]) => {
    root.style.setProperty(`--color-secondary-${shade}`, color);
  });
  Object.entries(theme.accent).forEach(([shade, color]) => {
    root.style.setProperty(`--color-accent-${shade}`, color);
  });

  root.style.setProperty('--bg-main', theme.backgrounds.main);
  root.style.setProperty('--bg-surface', theme.backgrounds.surface);
  root.style.setProperty('--bg-secondary', theme.backgrounds.surface);
  root.style.setProperty('--bg-hover', theme.backgrounds.hover);

  root.style.setProperty('--text-primary', theme.text.primary);
  root.style.setProperty('--text-secondary', theme.text.secondary || theme.text.primary);

  root.style.setProperty('--border-color', theme.border);
  root.style.setProperty('--error-color', theme.error);
  root.style.setProperty('--success-color', theme.success);
  root.style.setProperty('--warning-color', theme.warning);
  root.style.setProperty('--info-color', theme.info);

  document.body.style.backgroundColor = theme.backgrounds.main;
  document.body.style.color = theme.text.primary;
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

  root.setAttribute('data-theme', 'light');
};

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    applyThemeVariables(themes.light);
  }, []);

  return (
    <ThemeContext.Provider value={defaultContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

