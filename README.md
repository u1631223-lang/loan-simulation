# 住宅ローン電卓 → FPツール統合プラットフォーム

不動産営業やファイナンシャルプランナー向けの、住宅ローン計算から総合的なFP業務までをサポートするWebアプリケーション。

**無料版（Phase 1-9）**: ✅ **本番稼働中** - 住宅ローン計算・簡易電卓・NISA複利計算
**有料版（Phase 10-18）**: 🔜 **開発開始** - FP機能・認証・サブスクリプション（月額¥980）

[![Deploy Status](https://img.shields.io/badge/deploy-vercel-success)](https://loan-simulation-eight.vercel.app)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-74%20passing-brightgreen)]()
[![Production](https://img.shields.io/badge/production-live-brightgreen)](https://loan-simulation-eight.vercel.app)
[![License](https://img.shields.io/badge/license-Private-blue)]()


## 🎯 プロジェクト概要

### 無料版（Phase 1-9）✅ 本番稼働中

住宅営業向けの基本的なローン計算ツール。物理電卓の持ち運びを不要にし、顧客との商談時にスマホやPCで即座に計算・提示。

**主な機能:**
- ✅ 住宅ローン計算（元利均等・元金均等・ボーナス払い）
- ✅ 逆算機能（返済額→借入可能額）
- ✅ 簡易電卓（メモリ機能付き）
- ✅ NISA複利計算ツール
- ✅ 計算履歴管理（最大20件、localStorage）
- ✅ レスポンシブデザイン（PC/タブレット/スマホ）
- ✅ モバイルアプリ対応（Capacitor）

**🚀 本番URL**: https://loan-simulation-eight.vercel.app

---

### 有料版（Phase 10-18）🔜 開発開始

**月額 ¥980** のサブスクリプション制で、FP業務をフルサポート。

#### FP機能（Phase 13-16）
- **ライフプランシミュレーション** - ライフイベント管理・キャッシュフロー表
- **家計収支シミュレーション** - 月次・年次の収支分析
- **資産運用シミュレーション** - 複利計算・ポートフォリオ分析
- **保険設計シミュレーション** - 必要保障額計算

#### 追加機能（Phase 17）
- **繰上返済シミュレーション** - 期間短縮 vs 返済額軽減
- **複数ローン比較** - 最大5件の条件を並べて比較
- **PDF出力・印刷** - 提案書として保存・印刷

#### インフラ（Phase 11-12, 18）
- **Supabase認証** - Email + Social Login（Google, Apple, LINE）
- **Stripe決済** - サブスクリプション管理
- **クラウド同期** - PostgreSQL + Row Level Security
- **モバイルアプリ完成** - Android/iOS配信

**詳細**: [docs/TICKETS_FP.md](./docs/TICKETS_FP.md)

## 🚀 クイックスタート

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:5173

# プロダクションビルド
npm run build

# テスト実行
npm run test
```

## 🛠️ 技術スタック

### 無料版（Phase 1-9）✅

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context API
- **Storage**: localStorage (client-side only)
- **Charts**: Recharts (NISA複利計算)
- **Testing**: Vitest + React Testing Library (74 tests)
- **Mobile**: Capacitor (Android/iOS)
- **Deployment**: Vercel

### 有料版（Phase 10-18）🔜

**Backend & Auth:**
- **Supabase** - PostgreSQL database, Auth, Row Level Security, Storage
- **Stripe** - Subscription management (月額 ¥980)

**Additional Libraries:**
- **React Query** - Server state management
- **React Hook Form + Zod** - Form validation
- **jsPDF + html2canvas** - PDF generation
- **Google Gemini API** - AI features (future enhancement)

## 📁 プロジェクト構造

### 現在（無料版）

```
loan-simulation/
├── docs/                     # 📚 ドキュメント
│   ├── USER_GUIDE.md         # ユーザーガイド（無料版・有料版）
│   ├── FAQ.md                # よくある質問
│   ├── requirements.md       # 要件定義書
│   ├── tech-stack.md         # 技術仕様書
│   ├── DEVELOPMENT_PLAN.md   # 開発計画（Phase 1-18）
│   ├── TICKETS_FP.md         # Phase 10-18チケット（37件）
│   ├── TICKETS_NISA.md       # Phase 9.5チケット（18件）
│   └── TICKETS_SUMMARY.md    # Phase 1-9進捗サマリー
├── src/
│   ├── components/           # UIコンポーネント
│   │   ├── Calculator/       # SimpleCalculator（メモリ機能付き）
│   │   ├── Input/            # LoanForm, ReverseLoanForm, BonusSettings
│   │   ├── Result/           # Summary, Schedule
│   │   ├── History/          # HistoryList
│   │   ├── Investment/       # InvestmentCalculator（NISA）
│   │   └── Layout/           # Header, Footer, Container
│   ├── contexts/             # LoanContext
│   ├── hooks/                # useCalculator, useHistory, useKeyboard
│   ├── utils/                # loanCalculator, investmentCalculator, storage
│   ├── types/                # loan.ts, investment.ts
│   └── pages/                # Home, History
├── tests/                    # 74 tests passing
│   ├── unit/                 # loanCalculator.test.ts, etc.
│   └── integration/
└── CLAUDE.md                 # Claude Code向けガイド
```

### 有料版で追加される構成（Phase 10-18）

```
src/
├── components/
│   ├── Auth/                 # 🆕 Login, SignUp, Account
│   ├── Subscription/         # 🆕 Paywall, SubscriptionManagement
│   ├── FP/                   # 🆕 FP機能コンポーネント
│   │   ├── LifeEvent/        # ライフイベント入力
│   │   ├── CashFlow/         # キャッシュフロー表
│   │   ├── HouseholdBudget/  # 家計収支シミュレーション
│   │   ├── AssetPlan/        # 資産運用シミュレーション
│   │   ├── Insurance/        # 保険設計
│   │   ├── Prepayment/       # 繰上返済シミュレーション
│   │   └── LoanComparison/   # 複数ローン比較
│   └── Export/               # 🆕 PDF出力
├── contexts/
│   ├── AuthContext.tsx       # 🆕 認証状態管理
│   ├── SubscriptionContext.tsx # 🆕 サブスク状態管理
│   └── LifePlanContext.tsx   # 🆕 ライフプラン管理
├── hooks/
│   ├── useAuth.ts            # 🆕 Supabase Auth
│   └── useSubscription.ts    # 🆕 Stripe連携
├── services/
│   ├── supabase.ts           # 🆕 Supabase client
│   └── stripe.ts             # 🆕 Stripe client
├── utils/
│   ├── lifePlanCalculator.ts # 🆕 CF計算ロジック
│   ├── householdCalculator.ts # 🆕 家計収支計算
│   ├── assetCalculator.ts    # 🆕 資産運用計算
│   ├── insuranceCalculator.ts # 🆕 保険設計計算
│   └── pdfGenerator.ts       # 🆕 PDF生成
└── types/
    ├── auth.ts               # 🆕 認証型定義
    ├── subscription.ts       # 🆕 サブスク型定義
    └── lifePlan.ts           # 🆕 FP型定義
```

## 📚 ドキュメント

### 👥 ユーザー向け（Phase 10で追加）

| ファイル | 説明 | ステータス |
|---------|------|----------|
| [USER_GUIDE.md](./docs/USER_GUIDE.md) | 📘 ユーザーガイド（無料版・有料版の使い方） | ✅ Phase 10 |
| [FAQ.md](./docs/FAQ.md) | ❓ よくある質問（30問） | ✅ Phase 10 |

### 📖 開発者向け - 計画・仕様書

| ファイル | 説明 | ステータス |
|---------|------|----------|
| [DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) | 🗺️ 開発計画（Phase 1-18） | ✅ |
| [requirements.md](./docs/requirements.md) | 📋 要件定義書 | ✅ |
| [tech-stack.md](./docs/tech-stack.md) | 🛠️ 技術スタック詳細 | ✅ |
| [TICKETS_FP.md](./docs/TICKETS_FP.md) | 🎫 Phase 10-18チケット（37件） | ✅ |
| [TICKETS_NISA.md](./docs/TICKETS_NISA.md) | 🎫 Phase 9.5チケット（18件） | ✅ |
| [TICKETS_SUMMARY.md](./docs/TICKETS_SUMMARY.md) | 📊 Phase 1-9進捗サマリー | ✅ |

### 📝 その他

| ファイル | 説明 |
|---------|------|
| [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | トラブルシューティング・エラー解決策 |
| [CLAUDE.md](./CLAUDE.md) | Claude Code向け開発ガイド |

---

## 🎯 現在の開発状況

### Phase 1-9（無料版）✅ 完了・本番稼働中

| Phase | 説明 | 進捗 | ステータス |
|-------|------|------|----------|
| Phase 1 | プロジェクトセットアップ | 4/4 | ✅ 完了 |
| Phase 2 | ローン計算ロジック | 5/5 | ✅ 完了 |
| Phase 3 | UIコンポーネント | 8/9 | ✅ 完了 |
| Phase 4 | 状態管理 | 4/4 | ✅ 完了 |
| Phase 5 | ページ統合 | 3/3 | ✅ 完了 |
| Phase 6 | スタイリング・UX | 0/3 | ⬜ スキップ |
| Phase 7 | テスト・QA | 0/3 | ⬜ スキップ |
| Phase 8 | モバイルアプリ | 3/3 | ✅ 完了 |
| Phase 9 | デプロイ | 3/3 | ✅ 完了 |

**総チケット数**: 27/50完了（54%）
**実質完了**: Phase 1,2,3,4,5,8,9 ✅

**🚀 本番URL**: https://loan-simulation-eight.vercel.app

---

### Phase 9.5（NISA複利計算ツール）🔧 開発中（Codexが担当）

無料版機能拡張として、NISA複利計算ツールを追加中。

**チケット数**: 18件
**見積時間**: 約7.5時間
**担当**: Codex

**詳細**: [docs/TICKETS_NISA.md](./docs/TICKETS_NISA.md)

---

### Phase 10-18（有料版FP機能）🚀 Phase 10開始

**月額 ¥980** のサブスクリプション制による有料版開発。

| Phase | 説明 | チケット数 | 見積時間 | ステータス |
|-------|------|-----------|---------|----------|
| **Phase 10** | **ドキュメント整備** | **3** | **4h** | **🟢 進行中** |
| Phase 11 | バックエンド構築（Supabase + Stripe） | 5 | 30-35h | ⬜ 未着手 |
| Phase 12 | 認証UI実装 | 5 | 18-22h | ⬜ 未着手 |
| Phase 13 | ライフプランシミュレーション | 5 | 36-42h | ⬜ 未着手 |
| Phase 14 | 家計収支シミュレーション | 4 | 24-30h | ⬜ 未着手 |
| Phase 15 | 資産運用シミュレーション | 4 | 30-36h | ⬜ 未着手 |
| Phase 16 | 保険設計シミュレーション | 4 | 24-30h | ⬜ 未着手 |
| Phase 17 | 追加機能（繰上返済・PDF出力） | 4 | 36-42h | ⬜ 未着手 |
| Phase 18 | モバイルアプリ完成 | 4 | 36-42h | ⬜ 未着手 |

**総チケット数**: 37件
**総見積時間**: 238-283時間（10-12週間）
**並列実行可能**: 28/37チケット（76%）

**詳細**: [docs/TICKETS_FP.md](./docs/TICKETS_FP.md)

#### Phase 10の進捗（現在）

| チケット | タスク | 見積時間 | ステータス |
|---------|--------|---------|----------|
| TICKET-1001 | USER_GUIDE.md作成 | 2h | ✅ 完了 |
| TICKET-1002 | FAQ.md作成 | 1h | ✅ 完了 |
| TICKET-1003 | README.md更新 | 1h | 🟢 進行中 |

## 🧮 計算式

### 元利均等返済（Equal Payment）

```
PMT = P × (r × (1 + r)^n) / ((1 + r)^n - 1)

P: 借入金額
r: 月利（年利 / 12 / 100）
n: 返済月数
```

### 元金均等返済（Equal Principal）

```
月次返済額 = (P / n) + (残高 × r)
```

## 🎨 デザイン仕様

- **Primary**: `#1E40AF` (ブルー - 信頼感)
- **Secondary**: `#10B981` (グリーン - 計算ボタン)
- **Accent**: `#F59E0B` (オレンジ)
- **タッチ領域**: 最小 44x44px

## 📱 モバイルアプリ化

```bash
# Capacitorセットアップ
npm run build
npx cap sync

# Android
npx cap open android

# iOS
npx cap open ios
```

## 🧪 テスト

```bash
# 全テスト実行
npm run test

# UIモードでテスト
npm run test:ui

# 型チェック
npm run type-check
```

## 📦 ビルドとデプロイ

### クイックデプロイ

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# Vercelへデプロイ
vercel --prod
```

### デプロイ準備完了 ✅

Phase 9（デプロイメント準備）が完了しました：

- ✅ Production build 成功（dist/ 生成済み）
- ✅ TypeScript 型チェック通過
- ✅ ESLint 静的解析通過
- ✅ 全テスト通過（74 tests passing）
- ✅ Preview build 動作確認済み
- ✅ Vercel 設定完了（vercel.json）
- ✅ Capacitor 設定完了（Android/iOS ready）

**ビルドサイズ:**
- HTML: 0.45 KB
- CSS: 35.14 KB (gzip: 6.22 KB)
- JS: 238.53 KB (gzip: 74.25 KB)

**詳細なデプロイ手順は [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) を参照してください。**

## 🤝 開発ガイドライン

### コーディング規約

- TypeScript厳格モード使用
- ESLint + Prettierで自動フォーマット
- コンポーネントは関数コンポーネントで統一
- 状態管理はHooks優先

### コミットメッセージ

```
<type>: <subject>

例:
feat: 元利均等返済計算機能を実装
fix: 金利0%時の計算エラーを修正
docs: README.mdを更新
```

## 📄 ライセンス

Private

## 👨‍💻 開発者向け

Claude Codeで開発する場合は [CLAUDE.md](./CLAUDE.md) を参照してください。

---

## 📞 サポート・フィードバック

### ユーザー向け

- **GitHub Issues**: https://github.com/anthropics/claude-code/issues
- **Email**: support@loan-calculator.example.com
- **営業時間**: 平日 9:00-18:00（日本時間）

### 開発者向け

- **Claude Code向けガイド**: [CLAUDE.md](./CLAUDE.md)
- **トラブルシューティング**: [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- **開発計画**: [docs/DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md)

---

**作成日**: 2025-10-12
**最終更新**: 2025-10-21
**バージョン**: 1.1.0
**ステータス**: Phase 10 進行中（Phase 9 本番稼働中） 🚀
**本番URL**: https://loan-simulation-eight.vercel.app
