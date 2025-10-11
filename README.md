# 住宅ローン電卓 (Loan Calculator)

住宅営業向けのローン計算アプリケーション。スマートフォンとPCの両方で使用可能なクロスプラットフォーム対応。

## 🎯 プロジェクト概要

物理電卓の持ち運びを不要にし、顧客との商談時にスマホやPCで即座に計算・提示できるツール。

**主な機能:**
- 元利均等返済 / 元金均等返済の計算
- ボーナス払い対応
- 計算履歴の保存（最大20件）
- 電卓風のUI（タップ＋キーボード入力対応）

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

### 重要ドキュメント

| ファイル | 説明 |
|---------|------|
| [requirements.md](./docs/requirements.md) | 要件定義書（機能要件・UI/UX仕様） |
| [tech-stack.md](./docs/tech-stack.md) | 技術スタック詳細・アーキテクチャ |
| [DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) | 開発計画（Phase 1-9、50+チケット） |
| [TICKETS_SUMMARY.md](./docs/TICKETS_SUMMARY.md) | 開発進捗チェックリスト |
| [CLAUDE.md](./CLAUDE.md) | Claude Code向けガイド |

### 開発の進め方

1. **Phase 1** ✅ 完了: プロジェクトセットアップ
2. **Phase 2**: ローン計算ロジック実装（サブエージェント推奨）
3. **Phase 3**: UIコンポーネント開発（並列実行推奨）
4. **Phase 4**: 状態管理とロジック統合
5. **Phase 5**: ページ統合とルーティング
6. **Phase 6**: スタイリングとUX改善
7. **Phase 7**: テストとQA
8. **Phase 8**: モバイルアプリ化（Capacitor）
9. **Phase 9**: デプロイとリリース

詳細は [DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) を参照。

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

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# Vercelへデプロイ
vercel --prod
```

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
