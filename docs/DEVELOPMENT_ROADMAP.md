# 開発ロードマップ - Development Roadmap

**作成日**: 2025-10-13
**バージョン**: 2.0
**目的**: 段階的な開発計画により、リスクを最小化しながら着実に機能拡張

---

## 📋 目次

1. [現状分析](#1-現状分析)
2. [Phase 0: デプロイ準備と初期リリース](#2-phase-0-デプロイ準備と初期リリース期間-2-3日)
3. [Phase 1: 基本FP機能（Tier 1）](#3-phase-1-基本fp機能tier-1期間-3ヶ月)
4. [Phase 2: AI統合（Tier 2）](#4-phase-2-ai統合tier-2期間-6ヶ月)
5. [Phase 3: エンタープライズ機能（Tier 3）](#5-phase-3-エンタープライズ機能tier-3期間-12ヶ月)
6. [開発原則](#6-開発原則)
7. [サブエージェント活用戦略](#7-サブエージェント活用戦略)

---

## 1. 現状分析

### 1.1 完成済み機能 ✅

**Phase 0 (住宅ローン電卓)**:
- ✅ 元利均等/元金均等返済計算
- ✅ ボーナス払い機能
- ✅ 逆算機能（返済額→借入可能額）
- ✅ 履歴管理（localStorage、最大20件）
- ✅ レスポンシブデザイン（PC/タブレット/スマホ）
- ✅ Capacitor統合（Android/iOS対応）
- ✅ 74個のユニットテスト（全パス）
- ✅ Vercel設定ファイル

**技術スタック**:
- React 18 + TypeScript + Vite
- Tailwind CSS
- Context API (状態管理)
- localStorage (永続化)
- Capacitor (モバイル)

**ビルド状況**:
```bash
✓ built in 2.62s
dist/index.html                   0.45 kB
dist/assets/index-D7VY1fN5.css   20.38 kB
dist/assets/index-BGXLrj14.js   218.20 kB
```

### 1.2 未完成・改善が必要な部分

**UI/UX**:
- ⚠️ エラーメッセージの統一
- ⚠️ ローディング状態の表示
- ⚠️ トーストメッセージ（成功/失敗通知）
- ⚠️ 印刷スタイルシート

**機能**:
- ⚠️ 結果のシェア機能
- ⚠️ PDF/画像エクスポート
- ⚠️ よくある質問（FAQ）ページ

**インフラ**:
- ⚠️ 本番環境デプロイ（Vercel）
- ⚠️ カスタムドメイン設定
- ⚠️ Google Analytics 設定
- ⚠️ エラートラッキング（Sentry）

**モバイルアプリ**:
- ⚠️ Google Play ストア申請準備
- ⚠️ App Store 申請準備
- ⚠️ プライバシーポリシー作成
- ⚠️ 利用規約作成

---

## 2. Phase 0: デプロイ準備と初期リリース（期間: 2-3日）

### 🎯 目標
**住宅ローン電卓を本番環境にデプロイし、初期ユーザーからフィードバックを得る**

### 2.1 タスク一覧

#### ISSUE-001: Vercelへのデプロイ 🔴 Critical
**担当**: メイン開発者
**期間**: 0.5日
**内容**:
```bash
# 1. Vercelアカウント作成
# 2. プロジェクトをGitHubにプッシュ
# 3. Vercel連携
vercel login
vercel --prod

# 4. カスタムドメイン設定（オプション）
# 例: loan-calculator.yourdomain.com
```

**完了条件**:
- [ ] https://loan-simulation.vercel.app でアクセス可能
- [ ] ビルドが成功
- [ ] 全機能が正常に動作

---

#### ISSUE-002: エラーハンドリング強化 🟡 High
**担当**: サブエージェント
**期間**: 0.5日
**内容**:
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Sentryに送信
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              エラーが発生しました
            </h1>
            <p className="text-gray-700 mb-4">
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**タスク**:
1. ErrorBoundaryコンポーネント作成
2. App.tsxで全体をラップ
3. 計算エラー時のフォールバック表示
4. ネットワークエラー時の処理

**完了条件**:
- [ ] エラー発生時に適切なUIを表示
- [ ] ユーザーが復旧できる手段を提供
- [ ] エラー情報をコンソールに出力

---

#### ISSUE-003: トーストメッセージ実装 🟢 Medium
**担当**: サブエージェント
**期間**: 0.5日
**内容**:
```typescript
// src/components/Toast.tsx
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-xl leading-none">×</button>
    </div>
  );
}

// src/contexts/ToastContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
```

**使用例**:
```typescript
// 計算成功時
const { showToast } = useToast();
showToast('計算が完了しました', 'success');

// 履歴保存時
showToast('履歴に保存しました', 'info');

// エラー時
showToast('入力値が正しくありません', 'error');
```

**完了条件**:
- [ ] トーストコンポーネント実装
- [ ] 主要な操作（計算、履歴保存、削除）でトースト表示
- [ ] 3秒後に自動で消える
- [ ] スライドインアニメーション

---

#### ISSUE-004: プライバシーポリシー・利用規約作成 🟡 High
**担当**: メイン開発者
**期間**: 0.5日
**内容**:

**ファイル構成**:
```
public/
├── privacy-policy.html
└── terms-of-service.html
```

**プライバシーポリシーのポイント**:
- 収集する情報: なし（ローカルストレージのみ）
- 外部送信: なし
- Cookie使用: Google Analytics のみ（オプトアウト可能）
- 問い合わせ先

**利用規約のポイント**:
- 無保証条項（計算結果の正確性について）
- 免責事項（損害賠償責任の制限）
- 禁止事項
- 変更の通知方法

**完了条件**:
- [ ] privacy-policy.html 作成
- [ ] terms-of-service.html 作成
- [ ] Footerにリンク追加
- [ ] モバイルアプリ申請に必要な内容を含む

---

#### ISSUE-005: Google Analytics 設定 🟢 Medium
**担当**: サブエージェント
**期間**: 0.25日
**内容**:
```bash
npm install @analytics/google-analytics
```

```typescript
// src/lib/analytics.ts
import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';

export const analytics = Analytics({
  app: 'loan-calculator',
  plugins: [
    googleAnalytics({
      measurementIds: [import.meta.env.VITE_GA_MEASUREMENT_ID],
    }),
  ],
});

// イベント送信例
export const trackCalculation = (params: {
  principal: number;
  years: number;
  rate: number;
  type: string;
}) => {
  analytics.track('calculation', {
    category: 'Loan',
    ...params,
  });
};
```

**トラッキングイベント**:
- ページビュー（自動）
- 計算実行
- 履歴保存
- PDF出力（将来）
- エラー発生

**完了条件**:
- [ ] Google Analytics アカウント作成
- [ ] 測定ID取得
- [ ] analytics.ts 実装
- [ ] 主要イベントにトラッキング追加
- [ ] Real-time レポートで動作確認

---

### 2.2 Phase 0 完了チェックリスト

- [ ] **ISSUE-001**: Vercelデプロイ完了
- [ ] **ISSUE-002**: エラーハンドリング実装
- [ ] **ISSUE-003**: トーストメッセージ実装
- [ ] **ISSUE-004**: プライバシーポリシー・利用規約作成
- [ ] **ISSUE-005**: Google Analytics 設定
- [ ] 全機能がプロダクションで正常動作
- [ ] 初期ユーザー（5-10名）にテスト依頼
- [ ] フィードバック収集シート準備

### 2.3 Phase 0 の成功指標

**定量指標**:
- デプロイ成功率: 100%
- ページロード時間: < 2秒
- ビルドサイズ: < 250KB（gzip）
- テストカバレッジ: > 80%

**定性指標**:
- ユーザーがエラーなく計算できる
- モバイルでも快適に操作できる
- 履歴が正しく保存される

---

## 3. Phase 1: 基本FP機能（Tier 1）（期間: 3ヶ月）

### 🎯 目標
**月額¥980のSaaSとして提供できる基本的なFP機能を実装**

### 3.1 アーキテクチャ変更

**Phase 0 → Phase 1 の主な変更**:

| 項目 | Phase 0 | Phase 1 |
|------|---------|---------|
| **バックエンド** | なし | Supabase |
| **認証** | なし | Supabase Auth |
| **データ保存** | localStorage | PostgreSQL |
| **状態管理** | Context API | Context API + React Query |
| **API通信** | なし | Supabase Client |

### 3.2 開発順序（細分化）

#### Week 1-2: Supabase セットアップ
- **ISSUE-101**: Supabaseプロジェクト作成
- **ISSUE-102**: データベーススキーマ設計
- **ISSUE-103**: Row Level Security (RLS) 設定
- **ISSUE-104**: Supabase Client実装

#### Week 3-4: 認証機能
- **ISSUE-111**: メール/パスワード認証
- **ISSUE-112**: Google OAuth
- **ISSUE-113**: ログイン/サインアップUI
- **ISSUE-114**: 認証状態管理

#### Week 5-6: 顧客管理
- **ISSUE-121**: 顧客CRUD機能
- **ISSUE-122**: 顧客一覧・詳細画面
- **ISSUE-123**: 検索・フィルタ機能

#### Week 7-8: ライフイベント管理
- **ISSUE-131**: ライフイベントCRUD
- **ISSUE-132**: イベント種別（住宅購入、教育、結婚、車購入等）
- **ISSUE-133**: タイムライン表示

#### Week 9-10: キャッシュフロー表
- **ISSUE-141**: キャッシュフロー計算エンジン
- **ISSUE-142**: 60年間のCF表生成
- **ISSUE-143**: Rechartsでグラフ表示
- **ISSUE-144**: 年別・月別切り替え

#### Week 11-12: 教育費・老後資金シミュレーション
- **ISSUE-151**: 教育費計算ロジック
- **ISSUE-152**: 老後資金計算ロジック
- **ISSUE-153**: 結果表示UI
- **ISSUE-154**: 複数パターン比較機能

#### Week 13-14: PDF出力機能
- **ISSUE-161**: jsPDF + html2canvas統合
- **ISSUE-162**: レポートテンプレート作成
- **ISSUE-163**: カスタマイズ機能（ロゴ、メッセージ等）

#### Week 15: テスト・バグ修正
- **ISSUE-171**: E2Eテスト作成
- **ISSUE-172**: パフォーマンステスト
- **ISSUE-173**: バグ修正

#### Week 16: リリース準備
- **ISSUE-181**: Stripeサブスク統合
- **ISSUE-182**: 価格設定（¥980/月）
- **ISSUE-183**: ランディングページ作成

### 3.3 サブエージェント活用

**並列実行可能なタスク**:
```
Week 5-6:
├─ Agent 1: ISSUE-121 (顧客CRUD API)
├─ Agent 2: ISSUE-122 (顧客一覧UI)
└─ Agent 3: ISSUE-123 (検索機能)

Week 9-10:
├─ Agent 1: ISSUE-141 (CF計算エンジン)
├─ Agent 2: ISSUE-143 (グラフUI)
└─ Agent 3: ISSUE-144 (切り替え機能)
```

**効果**: 開発期間を30-40%短縮可能

---

## 4. Phase 2: AI統合（Tier 2）（期間: 6ヶ月）

### 🎯 目標
**月額¥4,980の付加価値を提供するAI機能を実装**

### 4.1 主要機能

#### 4.1.1 AIヒアリングアシスタント
**技術**: Google Gemini 1.5 Flash
**機能**:
- 自然な会話で顧客情報を収集
- 構造化データへの自動変換
- 質問の最適化（1回に1-2個）

**ISSUE**:
- ISSUE-201: Gemini API統合
- ISSUE-202: チャットUI実装
- ISSUE-203: 会話履歴管理
- ISSUE-204: データ抽出ロジック

#### 4.1.2 音声入力
**技術**: OpenAI Whisper API
**機能**:
- 音声でのヒアリング記録
- 議事録自動生成

**ISSUE**:
- ISSUE-211: Whisper API統合
- ISSUE-212: 音声録音UI
- ISSUE-213: テキスト変換

#### 4.1.3 AI分析レポート
**技術**: Google Gemini 1.5 Pro
**機能**:
- CF表の総合分析
- リスクの特定と提案
- アクションプラン生成

**ISSUE**:
- ISSUE-221: 分析プロンプト設計
- ISSUE-222: レポート生成エンジン
- ISSUE-223: カスタマイズ機能

#### 4.1.4 家計簿API連携
**技術**: MoneyForward ME / Moneytree API
**機能**:
- 家計簿データ自動取得
- 支出カテゴリ分析
- CF表への反映

**ISSUE**:
- ISSUE-231: OAuth連携
- ISSUE-232: データ同期
- ISSUE-233: カテゴリマッピング

#### 4.1.5 顧客ポータル（PWA）
**技術**: Vite PWA Plugin
**機能**:
- 顧客が自分のCF表を閲覧
- オフライン対応
- プッシュ通知

**ISSUE**:
- ISSUE-241: PWA化
- ISSUE-242: 顧客ログイン
- ISSUE-243: プッシュ通知

### 4.2 開発順序

**Month 1-2**: AIヒアリング（ISSUE-201〜204）
**Month 3**: 音声入力（ISSUE-211〜213）
**Month 4**: AI分析レポート（ISSUE-221〜223）
**Month 5**: 家計簿連携（ISSUE-231〜233）
**Month 6**: 顧客ポータル（ISSUE-241〜243）

---

## 5. Phase 3: エンタープライズ機能（Tier 3）（期間: 12ヶ月）

### 🎯 目標
**月額¥50,000の法人向け機能を実装**

### 5.1 主要機能

- **CRM連携**: Salesforce, HubSpot
- **チーム機能**: 複数FPでの顧客管理
- **監査ログ**: 全操作の記録
- **金融商品DB**: 保険・投資信託の提案
- **ホワイトラベル**: 企業ロゴ・ブランディング

### 5.2 開発順序

**Quarter 1**: CRM連携
**Quarter 2**: チーム機能・監査ログ
**Quarter 3**: 金融商品DB
**Quarter 4**: ホワイトラベル・エンタープライズ機能

---

## 6. 開発原則

### 6.1 段階的リリース

**原則**: 各Phaseを小さく分割し、2週間ごとにリリース

**メリット**:
- ユーザーフィードバックを早期に反映
- リスクの最小化
- モチベーション維持

### 6.2 品質基準

**すべてのISSUEで満たすべき基準**:

1. **テストカバレッジ**: 新規コードの80%以上
2. **TypeScript**: 型エラーゼロ
3. **ESLint**: 警告ゼロ
4. **レスポンシブ**: PC/タブレット/スマホで動作確認
5. **パフォーマンス**: Lighthouse スコア90以上

### 6.3 ドキュメント

**各ISSUEで更新すべきドキュメント**:
- `TROUBLESHOOTING.md`: 新たなエラーと解決策
- `CLAUDE.md`: 新機能の使い方
- `README.md`: セットアップ手順

---

## 7. サブエージェント活用戦略

### 7.1 サブエージェントに任せるべきタスク

**✅ 適している**:
- 独立したコンポーネントの実装
- テストコードの作成
- ユーティリティ関数の実装
- ドキュメントの作成

**❌ 適していない**:
- アーキテクチャ設計
- 複数ファイルにまたがる統合作業
- 重要な意思決定

### 7.2 並列実行の例

**Phase 1 Week 5-6の並列実行**:
```
Single message with 3 Task tool calls:

Agent 1 (ISSUE-121):
- Task: 顧客CRUD API実装
- Files: src/services/customerService.ts
- Dependencies: None

Agent 2 (ISSUE-122):
- Task: 顧客一覧UI実装
- Files: src/pages/Customers.tsx, src/components/CustomerList.tsx
- Dependencies: None (モックデータ使用)

Agent 3 (ISSUE-123):
- Task: 検索機能実装
- Files: src/hooks/useCustomerSearch.ts
- Dependencies: None
```

**効果**: 3日 → 1日に短縮（理想的には）

### 7.3 サブエージェントへの指示テンプレート

```
あなたはReact + TypeScriptの専門家です。
以下のタスクを実装してください。

【タスク】
{ISSUE番号}: {タスク名}

【要件】
- {要件1}
- {要件2}
- {要件3}

【制約】
- TypeScript strictモード準拠
- ESLint警告ゼロ
- Tailwind CSSでスタイリング
- テストカバレッジ80%以上

【ファイル】
- 作成: {新規ファイルリスト}
- 編集: {既存ファイルリスト}

【完了条件】
- [ ] 機能が正常に動作する
- [ ] テストがパスする
- [ ] 型エラーがない
- [ ] レスポンシブ対応

【参考】
- 既存コード: {参考ファイルパス}
- 技術スタック: React 18, TypeScript 5, Tailwind CSS 3

【最終成果物】
実装コードとテストコードを提供してください。
```

---

## 8. リスク管理

### 8.1 技術リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| Supabaseの学習曲線 | 中 | 事前に小規模プロトタイプで検証 |
| Gemini APIの精度不足 | 高 | Claudeへのフォールバック実装 |
| React Queryの複雑さ | 中 | 段階的導入、まずは1機能のみ |
| モバイルアプリ審査落ち | 低 | プライバシーポリシー・規約を事前準備 |

### 8.2 スケジュールリスク

**Phase 0が遅れた場合**:
- Phase 1の開始を遅らせる
- Phase 1のスコープを縮小（PDF出力を後回し等）

**Phase 1が遅れた場合**:
- Tier 2の一部機能を延期
- ユーザーフィードバックを優先

---

## 9. 次のアクション

### Phase 0 開始準備（今すぐ）

1. **ISSUE-001のチケット作成**:
   ```bash
   # GitHub Issues または Notion で管理
   Title: [Phase 0] Vercelへのデプロイ
   Priority: 🔴 Critical
   Assignee: メイン開発者
   Labels: deployment, phase-0
   ```

2. **サブエージェントへの依頼準備**:
   - ISSUE-002: ErrorBoundary実装
   - ISSUE-003: トーストメッセージ実装
   - ISSUE-005: Google Analytics設定

3. **並列実行**:
   ```
   メイン: ISSUE-001, ISSUE-004
   Agent 1: ISSUE-002
   Agent 2: ISSUE-003
   Agent 3: ISSUE-005
   ```

4. **完了目標**: 3日以内

---

## 付録A: Phase別の予算見積もり

| Phase | 期間 | 開発コスト | インフラコスト | 合計 |
|-------|------|-----------|---------------|------|
| Phase 0 | 3日 | ¥0 | ¥0 | ¥0 |
| Phase 1 | 3ヶ月 | ¥0 (自己開発) | ¥2,000/月 | ¥6,000 |
| Phase 2 | 6ヶ月 | ¥0 (自己開発) | ¥5,000/月 | ¥30,000 |
| Phase 3 | 12ヶ月 | ¥0 (自己開発) | ¥20,000/月 | ¥240,000 |

**インフラ内訳**:
- Supabase: ¥0〜¥2,000/月
- Vercel: ¥0/月（無料プラン）
- Gemini API: ¥50〜¥500/月
- Whisper API: ¥100〜¥1,000/月
- Domain: ¥1,500/年

---

## 付録B: KPI追跡シート

### Phase 0 KPI
- [ ] デプロイ成功
- [ ] 初期ユーザー10名獲得
- [ ] 平均セッション時間 > 5分
- [ ] バウンス率 < 50%

### Phase 1 KPI
- [ ] 有料ユーザー50名獲得
- [ ] MRR ¥49,000達成
- [ ] チャーンレート < 5%
- [ ] NPS > 40

### Phase 2 KPI
- [ ] 有料ユーザー500名
- [ ] MRR ¥2,490,000達成
- [ ] AIヒアリング利用率 > 60%
- [ ] NPS > 50

---

**最終更新**: 2025-10-13
**次回レビュー**: Phase 0完了時（2025-10-16予定）
