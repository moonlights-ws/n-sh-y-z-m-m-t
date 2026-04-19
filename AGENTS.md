# 逆水寒约战记录网站

## 项目概述

一款面向逆水寒手游约战爱好者的个人向展示类网站，核心功能是记录个人约战历史、展示对战数据、分享约战攻略。采用极简浅色系设计风格。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui + Tailwind CSS 4
- **图表**: recharts
- **样式**: 极简浅色主题

## 功能模块

### 1. 顶部导航栏 (Navbar)
- 固定在页面顶部
- 导航菜单：个人信息、历史战绩、攻略合集、关于我
- 响应式移动端菜单

### 2. 个人信息卡片 (ProfileCard)
- 游戏ID（可编辑）
- 服务器选择（20+服务器）
- 帮会名称（可编辑）
- 个性签名（可编辑）

### 3. 战绩总览面板 (StatsOverview)
- 核心数据卡片：总场次、胜场、负场、胜率
- 近期战绩趋势图
- 支持编辑战绩数据
- 数据存储在本地localStorage

### 4. 历史战绩列表 (MatchHistory)
- 用户可添加/编辑/删除战绩记录
- 支持按模式（1v1/3v3/6v6）筛选
- 支持按结果（胜利/失败）筛选
- 可填写：日期、模式、结果、强度、我方帮会、对方帮会、塔伤、重伤、录屏链接、复盘
- 数据存储在本地localStorage

### 5. 攻略合集区 (GuidesSection)
- 用户可添加攻略链接
- 支持B站、抖音、小红书等平台
- 支持跳转查看
- 支持小红书口令格式（xhslink.com等）
- 数据存储在本地localStorage

### 6. 页脚 (Footer)
- 关于信息
- 联系方式
- 免责声明

### 7. 帮会榜单 (GuildRankings)
- 诸神榜单：天地玄黄四榜分级，展示历届赛事荣誉
- 万刃争锋：赛事合集展示
- 荣誉殿堂：历届冠军团队展示
- 顶部帮会查询框：同时查询甲一帮会数据库和赛事数据库
- 数据来源：Supabase 云端存储（guilds、guild_events 表）

## 设计规范

### 主题配色（浅色系）
- 背景：#fafafa
- 卡片：#ffffff
- 文字：#1a1a1a / #666666 / #999999
- 金色高亮：#d4af37
- 胜利：#22c55e
- 失败：#ef4444

### 组件开发
- 使用 'use client' 指令标记客户端组件
- 使用 Tailwind CSS 进行样式开发
- 数据持久化使用 localStorage

## 目录结构

```
src/
├── app/
│   ├── api/fetch-document/route.ts  # 文档获取API
│   ├── globals.css                   # 全局样式（浅色主题）
│   ├── layout.tsx                    # 根布局
│   └── page.tsx                      # 主页面
└── components/
    ├── Navbar.tsx                     # 导航栏
    ├── ProfileCard.tsx                # 个人信息卡片
    ├── StatsOverview.tsx              # 战绩总览
    ├── MatchHistory.tsx               # 历史战绩
    ├── GuidesSection.tsx              # 攻略合集
    └── Footer.tsx                     # 页脚
```

## 数据存储

所有用户数据（战绩、攻略）存储在浏览器localStorage中，包括：
- matchStats: 战绩统计数据
- matchRecords: 战绩记录列表
- guides: 攻略链接列表

## 命令

- 开发：`pnpm dev`
- 构建：`pnpm build`
- 生产：`pnpm start`
