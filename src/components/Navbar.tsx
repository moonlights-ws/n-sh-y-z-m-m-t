'use client';

import { useState } from 'react';
import { Menu, X, User, Trophy, BookOpen, Info, Crown, Calendar, LogOut, Cloud } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { id: 'profile', label: '个人信息', icon: User },
  { id: 'stats', label: '历史战绩', icon: Trophy },
  { id: 'calendar', label: '约战日历', icon: Calendar },
  { id: 'rankings', label: '帮会榜单', icon: Crown },
  { id: 'guides', label: '攻略合集', icon: BookOpen },
  { id: 'about', label: '关于我', icon: Info },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const { user, isLoading, openAuthModal, signOut, isVisitorMode } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--theme-bg-card)]/95 backdrop-blur-md border-b border-[var(--theme-accent)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 
              className="text-lg font-bold text-[var(--theme-text-primary)] cursor-pointer"
              onClick={() => scrollToSection('profile')}
            >
              约战记录
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all text-sm ${
                  activeSection === item.id
                    ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)]'
                    : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-page)]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-[var(--theme-text-secondary)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop - User Menu / Login */}
          <div className="hidden md:flex items-center">
            {isLoading ? (
              <div className="w-20 h-8 bg-[var(--theme-bg-page)] rounded-lg animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--theme-bg-page)] transition-colors"
                >
                  <Cloud className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span className="text-sm text-[var(--theme-text-secondary)] max-w-[120px] truncate">
                    {user.email}
                  </span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--theme-bg-card)] rounded-lg shadow-lg border border-[var(--theme-accent)] py-1 z-50">
                    <div className="px-3 py-2 border-b border-[var(--theme-accent)]">
                      <p className="text-xs text-[var(--theme-text-muted)]">已登录</p>
                      <p className="text-sm text-[var(--theme-text-primary)] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-page)] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>退出登录</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-4 py-1.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-dark)] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span>登录</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[var(--theme-bg-card)] border-t border-[var(--theme-accent)]">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile User Section */}
            <div className="mb-3 pb-3 border-b border-[var(--theme-accent)]">
              {isLoading ? (
                <div className="h-10 bg-[var(--theme-bg-page)] rounded-lg animate-pulse" />
              ) : user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-[var(--theme-primary)]" />
                    <span className="text-sm text-[var(--theme-text-primary)] truncate max-w-[180px]">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--theme-text-secondary)] border border-[var(--theme-accent)] rounded-lg hover:bg-[var(--theme-bg-page)]"
                  >
                    <LogOut className="w-4 h-4" />
                    退出
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-dark)] text-white font-medium rounded-lg"
                >
                  <User className="w-5 h-5" />
                  <span>登录 / 注册</span>
                </button>
              )}
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)]'
                    : 'text-[var(--theme-text-secondary)]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
