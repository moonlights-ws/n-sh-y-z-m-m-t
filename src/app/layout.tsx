import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthModal from '@/components/AuthModal';
import MergeDataModal from '@/components/MergeDataModal';

export const metadata: Metadata = {
  title: {
    default: '逆水寒约战记录 | 千秋岁',
    template: '%s | 逆水寒约战记录',
  },
  description:
    '逆水寒手游个人约战记录网站，记录每一场约战，见证成长历程。展示战绩数据、分享攻略、查询帮会榜单。',
  keywords: [
    '逆水寒',
    '逆水寒手游',
    '约战',
    'PVP',
    '战绩记录',
    '攻略',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-theme="default">
      <body className="min-h-screen bg-[var(--theme-bg-page)] antialiased">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <AuthModal />
            <MergeDataModal />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
