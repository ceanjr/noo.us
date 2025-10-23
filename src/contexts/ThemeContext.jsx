import { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Definição dos 2 temas seguindo o Design System
export const themes = {
  light: {
    name: 'Modo Claro',
    description: 'Visual limpo e moderno',
    icon: '☀️',
    // Primary: Roxo Vibrante (violet-600)
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed', // Cor principal
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    // Secondary: Coral Suave (orange-400)
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c', // Cor principal
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    // Accent: Azul Elétrico (blue-500)
    accent: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Cor principal
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    backgrounds: {
      main: '#ffffff',
      surface: '#f9fafb', // gray-50
      hover: '#f3f4f6',
    },
    text: {
      primary: '#111827', // gray-900
      secondary: '#6b7280', // gray-500
    },
    border: '#e5e7eb', // gray-200
    error: '#ef4444', // red-500
    success: '#10b981', // green-500
    warning: '#f59e0b', // amber-500
    info: '#06b6d4', // cyan-500
  },
  dark: {
    name: 'Modo Escuro',
    description: 'Elegante e confortável',
    icon: '🌙',
    // Primary: Roxo Claro (violet-400)
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa', // Cor principal
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    // Secondary: Coral Vibrante (orange-300)
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74', // Cor principal
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    // Accent: Azul Brilhante (blue-400)
    accent: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa', // Cor principal
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    backgrounds: {
      main: '#0f172a', // slate-900
      surface: '#1e293b', // slate-800
      hover: '#334155', // slate-700
    },
    text: {
      primary: '#f1f5f9', // slate-100
      secondary: '#94a3b8', // slate-400
    },
    border: '#334155', // slate-700
    error: '#f87171', // red-400
    success: '#34d399', // green-400
    warning: '#fbbf24', // amber-400
    info: '#22d3ee', // cyan-400
  },
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Inicializar com o tema salvo do localStorage ou padrão
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme && themes[savedTheme]) ? savedTheme : 'light';
  });

  // Carregar tema do usuário ao montar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists() && userDoc.data().theme) {
            const firestoreTheme = userDoc.data().theme;
            // Só atualizar se for diferente do atual
            if (firestoreTheme !== currentTheme && themes[firestoreTheme]) {
              setCurrentTheme(firestoreTheme);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      }
    };

    loadTheme();
  }, []);

  // Aplicar tema ao documento
  useEffect(() => {
    const theme = themes[currentTheme];
    if (!theme) {
      console.error('Tema não encontrado:', currentTheme);
      return;
    }

    console.log('Aplicando tema:', currentTheme, theme);
    const root = document.documentElement;

    // Forçar transição suave
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

    // Aplicar variáveis CSS de cores
    Object.entries(theme.primary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });
    Object.entries(theme.secondary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-secondary-${shade}`, color);
    });
    Object.entries(theme.accent).forEach(([shade, color]) => {
      root.style.setProperty(`--color-accent-${shade}`, color);
    });

    // Aplicar backgrounds
    root.style.setProperty('--bg-main', theme.backgrounds.main);
    root.style.setProperty('--bg-surface', theme.backgrounds.surface);
    root.style.setProperty('--bg-secondary', theme.backgrounds.surface); // Alias para compatibilidade
    root.style.setProperty('--bg-hover', theme.backgrounds.hover);

    // Aplicar cores de texto
    root.style.setProperty('--text-primary', theme.text.primary);
    root.style.setProperty('--text-secondary', theme.text.secondary);
    root.style.setProperty('--text-tertiary', theme.text.tertiary);

    // Aplicar borda, erro e sucesso
    root.style.setProperty('--border-color', theme.border);
    root.style.setProperty('--error-color', theme.error);
    root.style.setProperty('--success-color', theme.success);

    // Aplicar background e cor no body diretamente
    document.body.style.backgroundColor = theme.backgrounds.main;
    document.body.style.color = theme.text.primary;

    // Aplicar tema no atributo data para CSS selectors
    root.setAttribute('data-theme', currentTheme);

    // Salvar no localStorage
    localStorage.setItem('theme', currentTheme);

    console.log('CSS Variables aplicadas. Verifique:', {
      '--bg-main': root.style.getPropertyValue('--bg-main'),
      '--text-primary': root.style.getPropertyValue('--text-primary'),
      'body.backgroundColor': document.body.style.backgroundColor,
      'body.color': document.body.style.color,
    });
  }, [currentTheme]);

  const changeTheme = async (newTheme) => {
    console.log('Mudando tema para:', newTheme);
    setCurrentTheme(newTheme);

    // Salvar no perfil do usuário
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        console.log('Salvando tema no Firestore para usuário:', userId);
        await updateDoc(doc(db, 'users', userId), {
          theme: newTheme,
        });
        console.log('Tema salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    changeTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
