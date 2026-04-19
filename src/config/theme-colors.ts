// 职业主题色卡配置
// 每个职业对应一个主题，包含4层颜色分层

export interface ThemeColor {
  primary: string;      // 主色 - 用于主按钮、高亮文字、选中状态
  primaryLight: string; // 主色浅 - 用于卡片/输入框背景
  primaryDark: string;   // 主色深 - 用于边框、图标、次要文字
  bgLight: string;      // 页面背景 - 最浅色
  bgWarm: string;       // 备用背景色
  accent: string;       // 强调色 - 用于边框、图标
  text: string;         // 主要文字色
  textSecondary: string; // 次要文字色
  textMuted: string;     // 弱化文字色
}

export interface ClassTheme {
  name: string;         // 主题ID
  displayName: string;   // 显示名称
  colors: ThemeColor;
  classes: string[];    // 适用职业列表
}

// 默认极简主题（所有职业通用）
export const defaultTheme: ThemeColor = {
  primary: '#333333',      // 主色 - 主按钮/高亮
  primaryLight: '#F5F5F5', // 卡片/输入框背景
  primaryDark: '#666666',  // 边框/图标
  bgLight: '#FFFFFF',      // 页面背景
  bgWarm: '#F5F5F5',       // 备用背景
  accent: '#666666',       // 边框/图标
  text: '#1a1a1a',         // 主文字
  textSecondary: '#666666', // 次要文字
  textMuted: '#999999',    // 弱化文字
};

// 职业主题色卡（严格按色卡分层）
export const classThemes: ClassTheme[] = [
  {
    name: 'blue',
    displayName: '蓝岸白昼',
    colors: {
      primary: '#A6D0F1',      // ③ 主按钮/高亮文字
      primaryLight: '#FCF8E7', // ② 卡片/输入框背景
      primaryDark: '#95C2E2',  // ④ 边框/图标/重点文字
      bgLight: '#DFF2FC',      // ① 页面背景
      bgWarm: '#E8F6FC',       // 备用背景
      accent: '#95C2E2',       // 边框/图标
      text: '#1a1a1a',         // 主文字
      textSecondary: '#666666', // 次要文字
      textMuted: '#888888',    // 弱化文字
    },
    classes: ['神相', '沧澜', '碎梦', '潮光'],
  },
  {
    name: 'moon',
    displayName: '月落星沉',
    colors: {
      primary: '#FEFBB4',      // ③ 主按钮/高亮文字
      primaryLight: '#FEF98E', // ② 卡片/输入框背景
      primaryDark: '#F4D85E',  // ④ 边框/图标/重点文字
      bgLight: '#FEFFEA',      // ① 页面背景
      bgWarm: '#FFFDE0',       // 备用背景
      accent: '#F4D85E',        // 边框/图标
      text: '#1a1a1a',         // 主文字
      textSecondary: '#666666', // 次要文字
      textMuted: '#888888',    // 弱化文字
    },
    classes: ['玄机', '鸿音', '铁衣'],
  },
  {
    name: 'green',
    displayName: '竹露青提',
    colors: {
      primary: '#D1E4CA',      // ③ 主按钮/高亮文字
      primaryLight: '#E5FFDE', // ② 卡片/输入框背景
      primaryDark: '#99BF8E',  // ④ 边框/图标/重点文字
      bgLight: '#FFFEE9',      // ① 页面背景
      bgWarm: '#EEF7E8',       // 备用背景
      accent: '#99BF8E',        // 边框/图标
      text: '#1a1a1a',         // 主文字
      textSecondary: '#666666', // 次要文字
      textMuted: '#888888',    // 弱化文字
    },
    classes: ['龙吟'],
  },
  {
    name: 'pink',
    displayName: '莓莓粉荔',
    colors: {
      primary: '#FFE0DF',      // ③ 主按钮/高亮文字
      primaryLight: '#FFDDE7', // ② 卡片/输入框背景
      primaryDark: '#FFC2D1',  // ④ 边框/图标/重点文字
      bgLight: '#FFFFF2',      // ① 页面背景
      bgWarm: '#FFF0F2',       // 备用背景
      accent: '#FFC2D1',        // 边框/图标
      text: '#1a1a1a',         // 主文字
      textSecondary: '#666666', // 次要文字
      textMuted: '#888888',    // 弱化文字
    },
    classes: ['素问'],
  },
  {
    name: 'red',
    displayName: '浪漫红色',
    colors: {
      primary: '#C4192C',      // ③ 主按钮/高亮文字（深色背景上使用亮色）
      primaryLight: '#1A1A1A', // ② 卡片/输入框背景（深色）
      primaryDark: '#86040F',  // ④ 边框/图标
      bgLight: '#080808',      // ① 页面背景（最深色）
      bgWarm: '#2A1A1A',       // 备用背景
      accent: '#86040F',        // 边框/图标
      text: '#FFFFFF',         // 主文字（浅色）
      textSecondary: '#CCCCCC', // 次要文字
      textMuted: '#999999',    // 弱化文字
    },
    classes: ['血河'],
  },
  {
    name: 'purple',
    displayName: '淡雅浅紫',
    colors: {
      primary: '#A98CB5',      // ③ 主按钮/高亮文字
      primaryLight: '#F0EDF5', // ② 卡片/输入框背景
      primaryDark: '#D4C4D8',  // ④ 边框/图标/重点文字
      bgLight: '#F8F7FF',      // ① 页面背景
      bgWarm: '#F4F2F7',       // 备用背景
      accent: '#D4C4D8',        // 边框/图标
      text: '#1a1a1a',         // 主文字
      textSecondary: '#666666', // 次要文字
      textMuted: '#888888',    // 弱化文字
    },
    classes: ['九灵'],
  },
];

// 获取职业对应的主题
export function getThemeForClass(className: string): ClassTheme | undefined {
  return classThemes.find(theme => theme.classes.includes(className));
}

// 根据主题名称获取主题
export function getThemeByName(name: string): ClassTheme | undefined {
  if (name === 'default') return undefined;
  return classThemes.find(theme => theme.name === name);
}

// 获取所有主题选项（包括默认）
export function getAllThemeOptions(): { name: string; displayName: string; colors: ThemeColor }[] {
  return [
    { name: 'default', displayName: '默认极简', colors: defaultTheme },
    ...classThemes.map(theme => ({ name: theme.name, displayName: theme.displayName, colors: theme.colors })),
  ];
}

// 主题配置对象，用于 UI 展示
export type ThemeKey = 'default' | 'blue' | 'moon' | 'green' | 'pink' | 'red' | 'purple';

export const themeConfigs: Record<ThemeKey, { name: string; primary: string; primaryLight: string; bgLight: string; classes: string[] }> = {
  default: {
    name: '默认极简',
    primary: '#333333',
    primaryLight: '#F5F5F5',
    bgLight: '#FFFFFF',
    classes: ['通用'],
  },
  blue: {
    name: '蓝岸白昼',
    primary: '#A6D0F1',
    primaryLight: '#FCF8E7',
    bgLight: '#DFF2FC',
    classes: ['神相', '沧澜', '碎梦', '潮光'],
  },
  moon: {
    name: '月落星沉',
    primary: '#FEFBB4',
    primaryLight: '#FEF98E',
    bgLight: '#FEFFEA',
    classes: ['玄机', '鸿音', '铁衣'],
  },
  green: {
    name: '竹露青提',
    primary: '#D1E4CA',
    primaryLight: '#E5FFDE',
    bgLight: '#FFFEE9',
    classes: ['龙吟'],
  },
  pink: {
    name: '莓莓粉荔',
    primary: '#FFE0DF',
    primaryLight: '#FFDDE7',
    bgLight: '#FFFFF2',
    classes: ['素问'],
  },
  red: {
    name: '浪漫红色',
    primary: '#C4192C',
    primaryLight: '#1A1A1A',
    bgLight: '#080808',
    classes: ['血河'],
  },
  purple: {
    name: '淡雅浅紫',
    primary: '#A98CB5',
    primaryLight: '#F0EDF5',
    bgLight: '#F8F7FF',
    classes: ['九灵'],
  },
};
