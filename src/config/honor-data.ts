// 荣誉殿堂数据配置 - 剑影杯 & 盼之杯

export interface HonorTeam {
  rank: number;
  guild: string;
  server?: string;
}

// 剑影杯 S1（2024.12）
export const jianyingS1 = {
  champion: {
    曜日: { guild: '剑影荡九霄', server: '缘定三生' },
    月诸: { guild: '花港观鱼', server: '玲珑相思' },
  },
  top8: {
    月诸: [
      { rank: 1, guild: '花港观鱼', server: '玲珑相思' },
      { rank: 2, guild: '超新星' },
      { rank: 3, guild: '共乘月' },
      { rank: 4, guild: '梦游云月星' },
      { rank: 5, guild: '浮生若梦' },
      { rank: 6, guild: '夙星' },
      { rank: 7, guild: '海天浮空升明月' },
      { rank: 8, guild: '夜神' },
    ] as HonorTeam[],
    曜日: [
      { rank: 1, guild: '剑影荡九霄', server: '缘定三生' },
      { rank: 2, guild: '烟雨落' },
      { rank: 3, guild: '极夜丶梧桐枝', server: '江山如画' },
      { rank: 4, guild: '盛世丨潇潇烟雨' },
      { rank: 5, guild: '破阵子' },
      { rank: 6, guild: '沧岚' },
      { rank: 7, guild: '羊村' },
      { rank: 8, guild: '宽窄' },
    ] as HonorTeam[],
  },
};

// 剑影杯 星辉邀请赛（2025.3）
export const jianyingStar = {
  champion: { guild: '盛世丨潇潇烟雨', server: '烟雨江南' },
  runnerUp: { guild: '极夜丶梧桐枝', server: '江山如画' },
  semiFinalists: [
    { guild: '花港观鱼', server: '玲珑相思' },
    { guild: '盛世丨夜尽天明', server: '瑶光听雪' },
  ] as HonorTeam[],
};

// 剑影杯 S2（2025.5）
export const jianyingS2 = {
  champion: { guild: '花港观鱼', server: '玲珑相思' },
  runnerUp: { guild: '剑影荡九霄', server: '缘定三生' },
  semiFinalists: [
    { guild: '盛世丨潇潇烟雨', server: '烟雨江南' },
    { guild: '极夜丶梧桐枝', server: '江山如画' },
  ] as HonorTeam[],
};

// 剑影杯 S3（2025.10）
export const jianyingS3 = {
  champion: { guild: '鸣海' },
  runnerUp: { guild: '花港观鱼', server: '玲珑相思' },
  semiFinalists: [
    { guild: '极夜丶梧桐枝' },
    { guild: '剑影丨缘定' },
  ] as HonorTeam[],
};

// 第一届盼之杯（2024）
export const panzhiCup1: HonorTeam[] = [
  { rank: 1, guild: '惊梦' },
  { rank: 2, guild: '零星' },
  { rank: 3, guild: '花港观鱼', server: '玲珑相思' },
  { rank: 4, guild: '烟雨落', server: '烟雨江南' },
  { rank: 5, guild: '盛世丨潇潇烟雨', server: '烟雨江南' },
  { rank: 6, guild: '共相剑', server: '沧海月明' },
  { rank: 7, guild: '极夜丶梧桐枝', server: '江山如画' },
  { rank: 8, guild: '云川' },
];

// 第二届盼之杯（2025.5）
export const panzhiCup2: HonorTeam[] = [
  { rank: 1, guild: '盛世丨潇潇烟雨', server: '烟雨江南' },
  { rank: 2, guild: '花港观鱼', server: '玲珑相思' },
  { rank: 3, guild: '共相剑', server: '沧海月明' },
  { rank: 4, guild: '极夜丶梧桐枝', server: '江山如画' },
  { rank: 5, guild: '烟雨落', server: '烟雨江南' },
  { rank: 6, guild: '云川' },
  { rank: 7, guild: '剑影丨缘定', server: '缘定三生' },
  { rank: 8, guild: '盛世丨夜语星梦' },
];

// 第三届盼之杯（2025.10）
export const panzhiCup3: HonorTeam[] = [
  { rank: 1, guild: '鸣海' },
  { rank: 2, guild: '花港观鱼', server: '玲珑相思' },
  { rank: 3, guild: '极夜丶梧桐枝', server: '江山如画' },
  { rank: 4, guild: '剑影丨缘定', server: '缘定三生' },
  { rank: 5, guild: '星野' },
  { rank: 6, guild: '断情' },
  { rank: 7, guild: '好甜' },
  { rank: 8, guild: '天天向上' },
];
