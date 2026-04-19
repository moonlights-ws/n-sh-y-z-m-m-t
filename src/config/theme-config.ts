// 职业主题配置
export type ThemeId = 'default' | 'blue' | 'moon' | 'green' | 'pink' | 'red' | 'purple';

// 主题配置
export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  jobs: string[]; // 适用职业
  // CSS 变量值
  variables: {
    '--theme-bg-page': string;
    '--theme-bg-card': string;
    '--theme-primary': string;
    '--theme-primary-light': string;
    '--theme-primary-dark': string;
    '--theme-accent': string;
    '--theme-text-primary': string;
    '--theme-text-secondary': string;
    '--theme-text-muted': string;
  };
}

export const themes: Record<ThemeId, ThemeConfig> = {
  default: {
    id: 'default',
    name: '默认极简',
    description: '所有职业通用',
    jobs: ['通用'],
    variables: {
      '--theme-bg-page': '#FFFFFF',
      '--theme-bg-card': '#F5F5F5',
      '--theme-primary': '#333333',
      '--theme-primary-light': '#F5F5F5',
      '--theme-primary-dark': '#1a1a1a',
      '--theme-accent': '#666666',
      '--theme-text-primary': '#1a1a1a',
      '--theme-text-secondary': '#666666',
      '--theme-text-muted': '#999999',
    },
  },
  blue: {
    id: 'blue',
    name: '蓝岸白昼',
    description: '清凉如水，宁静致远',
    jobs: ['神相', '沧澜', '碎梦', '潮光'],
    variables: {
      '--theme-bg-page': '#DFF2FC',
      '--theme-bg-card': '#FCF8E7',
      '--theme-primary': '#A6D0F1',
      '--theme-primary-light': '#E8F6FC',
      '--theme-primary-dark': '#7AB8E0',
      '--theme-accent': '#95C2E2',
      '--theme-text-primary': '#1a1a1a',
      '--theme-text-secondary': '#666666',
      '--theme-text-muted': '#888888',
    },
  },
  moon: {
    id: 'moon',
    name: '月落星沉',
    description: '星辰璀璨，光华流转',
    jobs: ['玄机', '鸿音', '铁衣'],
    variables: {
      '--theme-bg-page': '#FEFFEA',
      '--theme-bg-card': '#FEF98E',
      '--theme-primary': '#FEFBB4',
      '--theme-primary-light': '#FFFDE0',
      '--theme-primary-dark': '#E8D580',
      '--theme-accent': '#F4D85E',
      '--theme-text-primary': '#1a1a1a',
      '--theme-text-secondary': '#666666',
      '--theme-text-muted': '#888888',
    },
  },
  green: {
    id: 'green',
    name: '竹露青提',
    description: '清新自然，生机盎然',
    jobs: ['龙吟'],
    variables: {
      '--theme-bg-page': '#FFFEE9',
      '--theme-bg-card': '#E5FFDE',
      '--theme-primary': '#D1E4CA',
      '--theme-primary-light': '#EEF7E8',
      '--theme-primary-dark': '#8AAA78',
      '--theme-accent': '#99BF8E',
      '--theme-text-primary': '#1a1a1a',
      '--theme-text-secondary': '#666666',
      '--theme-text-muted': '#888888',
    },
  },
  pink: {
    id: 'pink',
    name: '莓莓粉荔',
    description: '甜美可爱，温柔动人',
    jobs: ['素问'],
    variables: {
      '--theme-bg-page': '#FFFFF2',
      '--theme-bg-card': '#FFDDE7',
      '--theme-primary': '#FFE0DF',
      '--theme-primary-light': '#FFF0F2',
      '--theme-primary-dark': '#E8A8A8',
      '--theme-accent': '#FFC2D1',
      '--theme-text-primary': '#1a1a1a',
      '--theme-text-secondary': '#666666',
      '--theme-text-muted': '#888888',
    },
  },
  red: {
    id: 'red',
    name: '浪漫红色',
    description: '热血激情，战斗之魂',
    jobs: ['血河'],
    variables: {
      '--theme-bg-page': '#080808',
      '--theme-bg-card': '#1A1A1A',
      '--theme-primary': '#C4192C',
      '--theme-primary-light': '#2A1A1A',
      '--theme-primary-dark': '#8B1A1A',
      '--theme-accent': '#86040F',
      '--theme-text-primary': '#FFFFFF',
      '--theme-text-secondary': '#CCCCCC',
      '--theme-text-muted': '#999999',
    },
  },
  purple: {
    id: 'purple',
    name: '淡雅浅紫',
    description: '神秘优雅，别具一格',
    jobs: ['九灵'],
    variables: {
      '--theme-bg-page': '#F8F7FF',
      '--theme-bg-card': '#F0EDF5',
      '--theme-primary': '#A98CB5',
      '--theme-primary-light': '#F4F2F7',
      '--theme-primary-dark': '#8B6E99',
      '--theme-accent': '#D4C4D8',
      '--theme-text-primary': '#1a1a1a',
      '--theme-text-secondary': '#666666',
      '--theme-text-muted': '#888888',
    },
  },
};

// 根据职业获取默认主题
export function getThemeByJob(job: string): ThemeId {
  for (const [id, config] of Object.entries(themes)) {
    if (config.jobs.includes(job)) {
      return id as ThemeId;
    }
  }
  return 'default';
}

// 根据职业列表获取推荐主题
export function getRecommendedThemes(jobs: string[]): ThemeId[] {
  const recommended: ThemeId[] = [];
  for (const job of jobs) {
    const themeId = getThemeByJob(job);
    if (!recommended.includes(themeId)) {
      recommended.push(themeId);
    }
  }
  return recommended;
}

// 应用主题到 document
export function applyTheme(themeId: ThemeId): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeId);
    const config = themes[themeId];
    if (config) {
      Object.entries(config.variables).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }
}

// 主题存储键名
export const THEME_STORAGE_KEY = 'nishuihan_theme';

// 获取存储的主题
export function getStoredTheme(): ThemeId | null {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && stored in themes) {
      return stored as ThemeId;
    }
  }
  return null;
}

// 保存主题
export function saveTheme(themeId: ThemeId): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }
}
