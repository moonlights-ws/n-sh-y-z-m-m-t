'use client';

import { Heart, MessageCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="bg-[var(--theme-bg-card)] border-t border-[var(--theme-accent)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-10">
          {/* Author Info */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-[var(--theme-text-primary)] mb-3">关于我</h3>
            <p className="text-[var(--theme-text-secondary)] text-sm mb-2">约战记录 · 个人展示</p>
            <p className="text-[var(--theme-text-muted)] text-xs">数据存储在本地浏览器中</p>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="py-4 border-t border-[var(--theme-accent)]">
          <div className="flex items-start space-x-3 p-3 bg-[var(--theme-bg-page)] rounded-lg">
            <AlertTriangle className="w-4 h-4 text-[var(--theme-primary)] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--theme-text-muted)]">
              本网站为个人约战记录平台，非逆水寒官方网站，所有素材均来自个人游戏记录与公开分享。
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-4 border-t border-[var(--theme-accent)] text-center">
          <p className="text-[var(--theme-text-muted)] text-xs">
            © {currentYear} 约战记录 · 
            <span className="inline-flex items-center ml-1">
              Made with <Heart className="w-3 h-3 mx-1 text-[var(--lose)] fill-current" />
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
