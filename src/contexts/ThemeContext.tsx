'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { defaultTheme, getThemeByName, ClassTheme, ThemeColor, classThemes } from '@/config/theme-colors';

export type ThemeName = 'default' | string;

// 默认主题值
const defaultThemeColors: ThemeColor = defaultTheme;

interface ThemeContextType {
  currentTheme: string;
  themeName: ThemeName;
  themeColors: ThemeColor;
  setTheme: (name: ThemeName) => void;
  isCustomTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'default',
  themeName: 'default',
  themeColors: defaultThemeColors,
  setTheme: () => {},
  isCustomTheme: false,
});

const THEME_STORAGE_KEY = 'nishuihan_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [themeName, setThemeName] = useState<ThemeName>('default');
  const [themeColors, setThemeColors] = useState<ThemeColor>(defaultThemeColors);
  const [isClient, setIsClient] = useState(false);

  // 应用主题到 CSS 变量
  const applyThemeToCSS = useCallback((colors: ThemeColor) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    // 设置 data-theme 属性
    root.setAttribute('data-theme', currentTheme === 'default' ? 'default' : themeName);
    
    // 核心主题变量（4层分层）
    root.style.setProperty('--theme-bg-page', colors.bgLight);      // ① 页面背景
    root.style.setProperty('--theme-bg-card', colors.primaryLight);  // ② 卡片背景
    root.style.setProperty('--theme-primary', colors.primary);        // ③ 主按钮/高亮
    root.style.setProperty('--theme-primary-light', colors.primaryLight);
    root.style.setProperty('--theme-primary-dark', colors.primaryDark);
    root.style.setProperty('--theme-accent', colors.accent);         // ④ 边框/图标
    root.style.setProperty('--theme-text-primary', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    
    // 同时更新 Tailwind 的变量
    root.style.setProperty('--background', colors.bgLight);
    root.style.setProperty('--foreground', colors.text);
    root.style.setProperty('--card', colors.primaryLight);
    root.style.setProperty('--card-foreground', colors.text);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.primaryLight);
    root.style.setProperty('--accent-foreground', colors.primary);
    root.style.setProperty('--ring', colors.primary);
    root.style.setProperty('--gold', colors.primary);
    root.style.setProperty('--border', colors.accent);
    root.style.setProperty('--input', colors.primaryLight);
    root.style.setProperty('--muted', colors.bgWarm);
    root.style.setProperty('--muted-foreground', colors.textMuted);
  }, [currentTheme, themeName]);

  // 在客户端加载保存的主题
  useEffect(() => {
    setIsClient(true);
    
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'default';
    const theme = savedTheme === 'default' ? undefined : getThemeByName(savedTheme);
    if (theme) {
      setCurrentTheme(savedTheme);
      setThemeName(savedTheme);
      setThemeColors(theme.colors);
      applyThemeToCSS(theme.colors);
    } else {
      setCurrentTheme('default');
      setThemeName('default');
      setThemeColors(defaultTheme);
      applyThemeToCSS(defaultTheme);
    }
  }, [applyThemeToCSS]);

  // 设置主题
  const setTheme = useCallback((name: ThemeName) => {
    setCurrentTheme(name);
    setThemeName(name);
    
    if (name === 'default') {
      setThemeColors(defaultTheme);
      applyThemeToCSS(defaultTheme);
      localStorage.setItem(THEME_STORAGE_KEY, 'default');
    } else {
      const theme = getThemeByName(name);
      if (theme) {
        setThemeColors(theme.colors);
        applyThemeToCSS(theme.colors);
        localStorage.setItem(THEME_STORAGE_KEY, name);
      }
    }
  }, [applyThemeToCSS]);

  // 根据职业自动设置主题
  const setThemeByClass = useCallback((className: string) => {
    const theme = classThemes.find(t => t.classes.includes(className));
    if (theme) {
      setTheme(theme.name);
    }
  }, [setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeName,
        themeColors,
        setTheme,
        isCustomTheme: themeName !== 'default',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}

// 辅助函数：根据职业获取主题
export function getThemeForClass(className: string): ClassTheme | undefined {
  return classThemes.find(theme => theme.classes.includes(className));
}
