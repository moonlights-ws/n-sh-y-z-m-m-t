'use client';

import { useState, useEffect } from 'react';
import { User, Server, Users, Edit2, Check, Swords, Palette } from 'lucide-react';
import { loadUserData, saveUserData } from '@/storage/database/cloud-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { themeConfigs, ThemeKey } from '@/config/theme-colors';

const servers = [
  '瑶光听雪',
  '万象玄机+飞花逐月+玄机喵算（三合一区）',
  '武林萌主',
  '紫禁之巅',
  '姑苏绮罗+魔都风云（合区）',
  '天下无双',
  '一蓑烟雨',
  '挑灯看剑',
  '踏月留香',
  '东京梦华',
  '沧海月明',
  '云川雪青',
  '金风玉露+江湖一梦+扶摇万里（三合一区）',
  '烟雨江南',
  '九天揽月',
  '西子湖畔',
  '浮生若梦',
  '帝都风云',
  '明月天涯',
  '天外飞仙',
  '玲珑相思',
  '天府之国',
  '绝代风华',
  '游园惊梦+佳期如梦+日月同辉（三合一区）',
  '缘定三生',
  '雪泥鸿爪+碧海问舟+燕字归时（三合一区）',
  '惊鸿照影',
  '剑胆琴心+群龙之首+九州风雷（三合一区）',
  '刀剑如梦+两广豪杰+铁马秋风（三合一区）',
  '千古风流+武林天骄+神龙九现（三合一区）',
  '白夜拂雪',
  '君心如月+千里婵娟+问鼎江湖（三合一区）',
  '仲夏绮梦',
  '应看千秋',
  '白帝霜华',
];

const classes = [
  { name: '碎梦', icon: '/class-suimeng.png' },
  { name: '龙吟', icon: '/class-longyin.png' },
  { name: '神相', icon: '/class-shenxiang.png' },
  { name: '玄机', icon: '/class-xuanji.png' },
  { name: '潮光', icon: '/class-chaoguang.png' },
  { name: '沧澜', icon: '/class-qian.png' },
  { name: '九灵', icon: '/class-jiuling.png' },
  { name: '素问', icon: '/class-suwun.png' },
  { name: '铁衣', icon: '/class-tieyi.png' },
  { name: '血河', icon: '/class-xuehe.png' },
  { name: '鸿音', icon: '/class-jiyi.png' },
];

// 古风诗句库
const ancientPoems = [
  '剑外忽传收蓟北，初闻涕泪满衣裳',
  '春风得意马蹄疾，一日看尽长安花',
  '醉卧沙场君莫笑，古来征战几人回',
  '人生自古谁无死，留取丹心照汗青',
  '三十功名尘与土，八千里路云和月',
  '莫等闲，白了少年头，空悲切',
  '壮志饥餐胡虏肉，笑谈渴饮匈奴血',
  '了却君王天下事，赢得生前身后名',
  '想当年，金戈铁马，气吞万里如虎',
  '抬望眼，仰天长啸，壮怀激烈',
  '古道西风瘦马，夕阳西下，断肠人在天涯',
  '大江东去，浪淘尽，千古风流人物',
  '明月几时有，把酒问青天',
  '但愿人长久，千里共婵娟',
  '人有悲欢离合，月有阴晴圆缺',
  '十年生死两茫茫，不思量，自难忘',
  '纵使相逢应不识，尘满面，鬓如霜',
  '相顾无言，惟有泪千行',
  '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生',
  '回首向来萧瑟处，归去，也无风雨也无晴',
];

// 获取随机诗句（仅客户端使用）
const getRandomPoem = () => {
  return ancientPoems[Math.floor(Math.random() * ancientPoems.length)];
};

export default function ProfileCard() {
  const { getCurrentUserId, user } = useAuth();
  const [gameId, setGameId] = useState('用户昵称');
  // 初始值使用固定诗句，避免 SSR/CSR 不匹配
  const [signature, setSignature] = useState(ancientPoems[0]);
  const [guild, setGuild] = useState('');
  const [selectedServer, setSelectedServer] = useState('瑶光听雪');
  const [selectedClass, setSelectedClass] = useState('龙吟');
  const [isEditingId, setIsEditingId] = useState(false);
  const [isEditingSig, setIsEditingSig] = useState(false);
  const [isEditingGuild, setIsEditingGuild] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 标记客户端渲染完成
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 加载和保存个人资料
  useEffect(() => {
    const loadDataFromCloud = async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;
      
      // 先从localStorage读取
      const savedProfile = localStorage.getItem('profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setGameId(profile.gameId || '用户昵称');
        // 如果没有保存的签名，随机选一个
        setSignature(profile.signature || getRandomPoem());
        setGuild(profile.guild || '');
        setSelectedServer(profile.server || '瑶光听雪');
        setSelectedClass(profile.class || '龙吟');
      } else {
        // 如果本地没有数据，随机选一个诗句
        setSignature(getRandomPoem());
      }
      // 再从云端同步（云端数据优先）
      const cloudData = await loadUserData<{
        gameId: string;
        signature: string;
        guild: string;
        server: string;
        class: string;
      }>(userId, 'profile');
      if (cloudData) {
        if (cloudData.gameId) setGameId(cloudData.gameId);
        if (cloudData.signature) setSignature(cloudData.signature);
        if (cloudData.guild !== undefined) setGuild(cloudData.guild);
        if (cloudData.server) setSelectedServer(cloudData.server);
        if (cloudData.class) setSelectedClass(cloudData.class);
        localStorage.setItem('profile', JSON.stringify(cloudData));
      }
    };
    loadDataFromCloud();
  }, [getCurrentUserId, user]); // 添加 user 依赖，登录后重新加载

  // 保存到本地和云端
  const saveProfile = async (profile: {
    gameId: string;
    signature: string;
    guild: string;
    server: string;
    class: string;
  }) => {
    const userId = await getCurrentUserId();
    localStorage.setItem('profile', JSON.stringify(profile));
    if (userId) {
      await saveUserData(userId, 'profile', profile);
    }
  };

  return (
    <section id="profile" className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-1">个人信息</h2>
          <p className="text-[var(--theme-text-muted)] text-sm">设置你的约战身份</p>
        </div>

        {/* Profile Card */}
        <div className="bg-[var(--theme-bg-card)] rounded-xl border border-[var(--theme-accent)] p-6 md:p-8">
          {/* Game ID */}
          <div className="mb-5">
            <label className="flex items-center text-[var(--theme-text-secondary)] text-sm mb-2">
              <User className="w-4 h-4 mr-2" />
              游戏ID
            </label>
            <div className="flex items-center gap-2">
              {isEditingId ? (
                <>
                  <input
                    type="text"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
                    placeholder="请输入游戏ID"
                  />
                  <button
                    onClick={() => {
                      setIsEditingId(false);
                      saveProfile({ gameId, signature, guild, server: selectedServer, class: selectedClass });
                    }}
                    className="p-2.5 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)]"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xl font-bold text-[var(--theme-text-primary)]">{gameId}</span>
                  <button
                    onClick={() => setIsEditingId(true)}
                    className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Server */}
          <div className="mb-5">
            <label className="flex items-center text-[var(--theme-text-secondary)] text-sm mb-2">
              <Server className="w-4 h-4 mr-2" />
              服务器
            </label>
            <select
              value={selectedServer}
              onChange={(e) => {
                setSelectedServer(e.target.value);
                saveProfile({ gameId, signature, guild, server: e.target.value, class: selectedClass });
              }}
              className="w-full px-4 py-2.5 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
            >
              {servers.map(server => (
                <option key={server} value={server}>{server}</option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div className="mb-5">
            <label className="flex items-center text-[var(--theme-text-secondary)] text-sm mb-2">
              <Swords className="w-4 h-4 mr-2" />
              职业
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  saveProfile({ gameId, signature, guild, server: selectedServer, class: e.target.value });
                }}
                className="w-full px-4 py-2.5 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)] appearance-none"
              >
                {classes.map(cls => (
                  <option key={cls.name} value={cls.name}>{cls.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <img 
                  src={classes.find(c => c.name === selectedClass)?.icon || ''} 
                  alt={selectedClass}
                  className="h-6 w-6 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Guild */}
          <div className="mb-5">
            <label className="flex items-center text-[var(--theme-text-secondary)] text-sm mb-2">
              <Users className="w-4 h-4 mr-2" />
              帮会
            </label>
            <div className="flex items-center gap-2">
              {isEditingGuild ? (
                <>
                  <input
                    type="text"
                    value={guild}
                    onChange={(e) => setGuild(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
                    placeholder="请输入帮会名称"
                  />
                  <button
                    onClick={() => {
                      setIsEditingGuild(false);
                      saveProfile({ gameId, signature, guild, server: selectedServer, class: selectedClass });
                    }}
                    className="p-2.5 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)]"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[var(--theme-text-primary)]">{guild || '未设置'}</span>
                  <button
                    onClick={() => setIsEditingGuild(true)}
                    className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Signature */}
          <div className="mb-5">
            <label className="flex items-center text-[var(--theme-text-secondary)] text-sm mb-2">
              <Edit2 className="w-4 h-4 mr-2" />
              个性签名
            </label>
            <div className="flex items-center gap-2">
              {isEditingSig ? (
                <>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[var(--theme-bg-page)] border border-[var(--theme-accent)] rounded-lg text-[var(--theme-text-primary)] focus:outline-none focus:border-[var(--theme-primary)]"
                    placeholder="请输入个性签名"
                    maxLength={30}
                  />
                  <button
                    onClick={() => {
                      setIsEditingSig(false);
                      saveProfile({ gameId, signature, guild, server: selectedServer, class: selectedClass });
                    }}
                    className="p-2.5 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-primary-dark)]"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[var(--theme-text-secondary)] italic">{signature || '点击编辑个性签名'}</span>
                  <button
                    onClick={() => setIsEditingSig(true)}
                    className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="flex items-center text-[var(--theme-text-secondary)] text-sm mb-2">
              <Palette className="w-4 h-4 mr-2" />
              主题颜色
            </label>
            <ThemeSelector />
          </div>
        </div>
      </div>
    </section>
  );
}

// Theme Selector Component
function ThemeSelector() {
  const { currentTheme, setTheme, themeName } = useTheme();
  
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(themeConfigs) as ThemeKey[]).map((key) => {
          const config = themeConfigs[key];
          const isActive = currentTheme === key;
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`
                relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300
                ${isActive 
                  ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)] shadow-sm' 
                  : 'border-[var(--theme-accent)] bg-[var(--theme-bg-card)] hover:border-[var(--theme-primary)]'
                }
              `}
              title={config.name}
            >
              <div 
                className="w-5 h-5 rounded-full shadow-sm"
                style={{ 
                  background: `linear-gradient(135deg, ${config.primary} 0%, ${config.bgLight} 100%)`,
                  boxShadow: `0 1px 2px ${config.primary}40`
                }}
              />
              <span className={`text-sm ${isActive ? 'font-medium text-[var(--theme-primary)]' : 'text-[var(--theme-text-secondary)]'}`}>
                {config.name}
              </span>
              {isActive && (
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: config.primary }}
                />
              )}
            </button>
          );
        })}
      </div>
      {currentTheme !== 'default' && (
        <div 
          className="text-xs text-[var(--theme-text-muted)] px-2 py-1 rounded"
          style={{ background: 'var(--theme-primary-light)' }}
        >
          当前主题：{themeName} — 切换主题将改变网站整体色调
        </div>
      )}
    </div>
  );
}
