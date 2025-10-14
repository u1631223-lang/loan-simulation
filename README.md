# 住宅ローン電卓 → FPツール統合プラットフォーム

**Phase 0 (完成)**: 住宅ローン電卓 - スマートフォンとPCの両方で使用可能
**Phase 1-3 (計画中)**: 基本FP機能 → AI統合 → エンタープライズ機能

[![Deploy Status](https://img.shields.io/badge/deploy-vercel-success)](https://loan-simulation.vercel.app)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-74%20passing-brightgreen)]()

## 🎯 プロジェクト概要

### Phase 0 (✅ 完成)
住宅営業向けの基本的なローン計算ツール。物理電卓の持ち運びを不要にし、顧客との商談時にスマホやPCで即座に計算・提示。

**主な機能:**
- ✅ 元利均等返済 / 元金均等返済の計算
- ✅ ボーナス払い対応
- ✅ 逆算機能（返済額→借入可能額）
- ✅ 計算履歴の保存（最大20件、localStorage）
- ✅ レスポンシブデザイン（PC/タブレット/スマホ）
- ✅ モバイルアプリ対応（Capacitor）

### Phase 1-3 (計画中)
FP業務をサポートする統合プラットフォームへ進化予定。詳細は [DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md) を参照。

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

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks + Context API
- **Storage**: localStorage
- **Testing**: Vitest + React Testing Library
- **Mobile**: Capacitor (Android/iOS)

## 📁 プロジェクト構造

```
loan-simulation/
├── docs/                    # 📚 ドキュメント
│   ├── requirements.md      # 要件定義書
│   ├── tech-stack.md        # 技術仕様書
│   ├── DEVELOPMENT_PLAN.md  # 開発計画（50+チケット）
│   └── TICKETS_SUMMARY.md   # 進捗管理サマリー
├── src/
│   ├── components/          # UIコンポーネント
│   │   ├── Calculator/      # 電卓UI
│   │   ├── Input/           # 入力フォーム
│   │   ├── Result/          # 結果表示
│   │   ├── History/         # 履歴
│   │   └── Layout/          # レイアウト
│   ├── contexts/            # Context API
│   ├── hooks/               # カスタムフック
│   ├── utils/               # ユーティリティ関数
│   ├── types/               # TypeScript型定義
│   └── pages/               # ページコンポーネント
├── tests/                   # テスト
│   ├── unit/
│   └── integration/
└── CLAUDE.md                # Claude Code向けガイド
```

## 📚 ドキュメント

### 📖 計画・仕様書

| ファイル | 説明 | ステータス |
|---------|------|----------|
| [DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md) | 🗺️ 全体ロードマップ（Phase 0-3） | ✅ v2.0 |
| [requirements.md](./docs/requirements.md) | 📋 要件定義書（Phase 0完了 + 1-3計画） | ✅ v2.0 |
| [tech-stack.md](./docs/tech-stack.md) | 🛠️ 技術スタック詳細・アーキテクチャ | ✅ v2.0 |
| [project.md](./docs/project.md) | 📊 プロジェクト概要・競合分析・収益計画 | ✅ v2.1 |
| [AI_API_COMPARISON.md](./docs/AI_API_COMPARISON.md) | 🤖 AI API比較分析（Gemini採用） | ✅ |

### 🎫 開発チケット

| ファイル | 説明 | ステータス |
|---------|------|----------|
| [PHASE0_ISSUES.md](./docs/issues/PHASE0_ISSUES.md) | Phase 0: デプロイ準備（5 issues） | 🟡 進行中 |
| [SUBAGENT_GUIDE.md](./docs/SUBAGENT_GUIDE.md) | サブエージェント活用ガイド | ✅ |

### 📝 その他

| ファイル | 説明 |
|---------|------|
| [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | トラブルシューティング・エラー解決策 |
| [CLAUDE.md](./CLAUDE.md) | Claude Code向けガイド |

---

## 🚦 Phase 0: デプロイ準備と初期リリース（期間: 2-3日）

### 現在の状況
- ✅ **完成**: 住宅ローン計算機（元利均等、元金均等、ボーナス、逆算、履歴）
- ✅ **ビルド**: 成功（dist/ 生成済み）
- ✅ **テスト**: 74個全パス
- ⚠️ **デプロイ**: 未実施

### 次のステップ

#### 必須タスク（Must Have）
1. **ISSUE-001**: Vercelへのデプロイ 🔴 Critical
2. **ISSUE-002**: ErrorBoundary実装 🟡 High
3. **ISSUE-004**: プライバシーポリシー・利用規約作成 🟡 High

#### 推奨タスク（Should Have）
4. **ISSUE-003**: トーストメッセージ実装 🟢 Medium
5. **ISSUE-005**: Google Analytics設定 🟢 Medium

**詳細**: [docs/issues/PHASE0_ISSUES.md](./docs/issues/PHASE0_ISSUES.md)

**並列実行戦略**:
```bash
# メイン開発者: ISSUE-001 (Vercelデプロイ) + ISSUE-004 (文書作成)
# Agent 1: ISSUE-002 (ErrorBoundary)
# Agent 2: ISSUE-003 (Toast)
# Agent 3: ISSUE-005 (Google Analytics)
```

**サブエージェント活用**: [docs/SUBAGENT_GUIDE.md](./docs/SUBAGENT_GUIDE.md)

---

## 🗺️ Phase 1-3 概要（計画中）

### Phase 1: 基本FP機能（Tier 1）- 3ヶ月
**目標**: 月額¥980のSaaSとして提供
- 顧客管理（CRUD）
- ライフイベント管理
- キャッシュフロー表（60年間）
- 教育費・老後資金シミュレーション
- PDF出力

**技術追加**: Supabase, React Query, Recharts, jsPDF

### Phase 2: AI統合（Tier 2）- 6ヶ月
**目標**: 月額¥4,980の付加価値
- AIヒアリングアシスタント（Gemini 1.5 Flash）
- 音声入力（Whisper API）
- AI分析レポート（Gemini 1.5 Pro）
- 家計簿API連携
- 顧客ポータル（PWA）

**技術追加**: Google Gemini API, OpenAI Whisper, PWA

### Phase 3: エンタープライズ機能（Tier 3）- 12ヶ月
**目標**: 月額¥50,000の法人向け
- CRM連携（Salesforce, HubSpot）
- チーム機能
- 監査ログ
- 金融商品DB
- ホワイトラベル

**技術追加**: Salesforce API, Auth0, Datadog, Sentry

**詳細**: [docs/DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md)

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

**作成日**: 2025-10-12
**バージョン**: 0.0.1
**ステータス**: Phase 1 完了
