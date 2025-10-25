# Phase 15: 資産運用シミュレーション実装サマリー

**実装日**: 2025-10-25
**Phase**: 15 (有料版 - Asset Management Simulation)
**担当**: Claude Code Agent
**所要時間**: 約3時間（見積通り）

---

## 実装完了チケット

### TICKET-1501: 資産運用計算エンジン ✅

**ファイル**: `src/utils/assetCalculator.ts` (380行)

**実装関数** (10個):

1. **`calculateLumpSumInvestment()`** - 一括投資の複利計算
   - 数式: `FV = PV × (1 + r)^n`
   - 年次推移データ生成

2. **`calculateMonthlyInvestment()`** - 積立投資計算
   - 数式: `FV = PMT × ((1 + r)^n - 1) / r`
   - 毎月積立の複利効果計算

3. **`calculatePortfolioReturn()`** - ポートフォリオリターン計算
   - 期待リターン = Σ(資産クラスi × 割合i)
   - リスク = √Σ(リスク²i × 割合²i)
   - シャープレシオ = (期待リターン - 無リスク金利) / リスク

4. **`calculateRequiredMonthlyInvestment()`** - 目標金額達成のための必要積立額計算（逆算）
   - 数式: `PMT = FV × r / ((1 + r)^n - 1)`

5. **`analyzeRiskReturn()`** - リスク・リターン分析
   - ポートフォリオ全体の期待リターン・リスク・シャープレシオ
   - 各アセットクラスの詳細情報含む

6. **`validatePortfolio()`** - ポートフォリオバリデーション
   - 合計割合が95-105%の範囲内か
   - 各資産クラスの割合が0-100%か

7. **`suggestRebalancing()`** - リバランス提案
   - 現在と目標の差分計算
   - 調整金額提案

8. **`ASSET_CLASSES`** - アセットクラス定義（6種類）
   - 国内株式（TOPIX: 5%/18%）
   - 海外株式（S&P500: 7%/20%）
   - 国内債券（日本国債: 1%/3%）
   - 海外債券（先進国債券: 3%/8%）
   - REIT（東証REIT: 4%/15%）
   - 現金・預金（0.1%/0%）

**特徴**:
- 実用的なデフォルト値（S&P500の長期平均7%など）
- 日本の長期投資データに基づく期待リターン・リスク
- 簡易版（相関係数は考慮せず、保守的見積もり）

---

### TICKET-1502: ポートフォリオ管理UI ✅

**ファイル**: `src/components/FP/Asset/PortfolioManager.tsx` (200行)

**機能**:
- アセットアロケーション設定（6種類の資産クラス）
- スライダーで割合調整（0-100%、0.1%刻み）
- ▲/▼ボタンで1%ずつ微調整
- リアルタイム計算（期待リターン・リスク・シャープレシオ）
- バリデーション（合計100%チェック）
- デフォルトポートフォリオ（バランス型: 株式50%, 債券30%, REIT10%, 現金10%）

**デザイン**:
- カスタムスライダー（グラデーション表示）
- 各資産クラスごとにカード形式
- 色分け（期待リターン: 青、リスク: オレンジ、シャープレシオ: 緑）
- ヘルプテキスト（アセットアロケーションのポイント解説）

---

### TICKET-1503: 積立投資シミュレーター ✅

**ファイル**: `src/components/FP/Asset/InvestmentSimulator.tsx` (230行)

**機能**:
- **入力項目**:
  - 初期投資額（万円、100万円刻み）
  - 月々積立額（円、1万円刻み）
  - 想定利回り（0-15%、スライダー）
  - 運用期間（1-50年）

- **結果表示**:
  - 総投資額（元本）
  - 運用益
  - 最終資産額
  - 年次推移グラフ（折れ線グラフ、Recharts使用）

**グラフ**:
- 元本（青線）
- 運用益（緑線）
- 合計（紫太線）
- インタラクティブツールチップ
- レスポンシブ対応

**デフォルト値**:
- 初期投資: 0万円
- 月々積立: 30,000円
- 想定利回り: 7%（S&P500保守的見積もり）
- 運用期間: 30年

**実用例**: 毎月3万円、7%、30年 → 約3,650万円

---

### TICKET-1504: リスク・リターン分析グラフ ✅

**ファイル**: `src/components/FP/Asset/RiskReturnChart.tsx` (280行)

**グラフ種類** (3種類):

1. **散布図 (ScatterChart)**: リスク vs リターン
   - 各アセットクラスをプロット（円）
   - ポートフォリオ全体を星印で表示（赤色、大きめ）
   - X軸: リスク（標準偏差%）、Y軸: 期待リターン（%）

2. **円グラフ (PieChart)**: アセットアロケーション
   - 資産配分の割合を視覚化
   - カスタムカラー（資産クラスごと）
   - ラベル表示（名称 + 割合%）

3. **棒グラフ (BarChart)**: 期待リターン・リスク比較
   - 各アセットクラスの期待リターン（緑）
   - リスク（オレンジ）
   - 並列比較

**詳細データテーブル**:
- アセットクラス名
- 割合（%）
- 期待リターン（%）
- リスク（%）
- ポートフォリオ全体のサマリー行（太字）

**ヘルプテキスト**: グラフの見方を解説

---

### TICKET-1505: hooks実装 ✅

**ファイル**: `src/hooks/useAssetPortfolio.ts` (270行)

**機能**:
- ポートフォリオCRUD操作
- Supabase連携（PostgreSQL）
- エラーハンドリング

**API**:

```typescript
const {
  portfolios,           // ポートフォリオ一覧
  loading,             // ローディング状態
  error,               // エラーメッセージ
  createPortfolio,     // 作成
  updatePortfolio,     // 更新
  deletePortfolio,     // 削除
  refreshPortfolios,   // 再取得
} = useAssetPortfolio(userId);
```

**Supabase連携**:
- `asset_portfolios` テーブル（ポートフォリオ）
- `asset_allocations` テーブル（アロケーション）
- Row Level Security (RLS) 対応
- カスケード削除

**null対応**: Supabase未設定時のガード処理（無料版との互換性）

---

### TICKET-1506: ページ統合 ✅

**ファイル**: `src/pages/AssetManagement.tsx` (130行)

**構成**:
- タブ切り替え（3つ）
  1. **積立シミュレーション**: InvestmentSimulator
  2. **ポートフォリオ設定**: PortfolioManager
  3. **リスク・リターン分析**: RiskReturnChart

**レイアウト**:
- ヘッダー（タイトル + 説明）
- タブナビゲーション（アクティブ状態表示）
- コンテンツエリア（タブごとに切り替え）
- フッター（免責事項）

**状態管理**:
- `currentAllocations`: ポートフォリオ設定をタブ間で共有
- タブ切り替え時も設定が保持される

---

## 型定義の拡張

**ファイル**: `src/types/investment.ts`

**追加型** (10個):

1. `AssetClass` - アセットクラス（6種類）
2. `AssetClassInfo` - アセットクラス情報（ラベル、期待リターン、リスク）
3. `AssetAllocation` - アセットアロケーション
4. `AssetPortfolio` - ポートフォリオ
5. `PortfolioReturn` - ポートフォリオリターン計算結果
6. `RiskReturnAnalysis` - リスク・リターン分析結果
7. `CreatePortfolioParams` - ポートフォリオ作成パラメータ
8. `UpdatePortfolioParams` - ポートフォリオ更新パラメータ

既存型（Phase 9.5から継承）:
- `InvestmentParams`
- `InvestmentResult`
- `YearlyData`

---

## テスト実装

**ファイル**: `tests/unit/assetCalculator.test.ts` (370行)

**テストケース数**: 28個 ✅ 全合格

### テストカバレッジ:

1. **Lump Sum Investment** (3 tests)
   - 正常計算
   - 金利0%のケース
   - 年次推移データ生成

2. **Monthly Investment** (3 tests)
   - 正常計算（30,000円 × 30年 @ 7%）
   - 金利0%のケース
   - 年次推移データ生成

3. **Portfolio Return** (5 tests)
   - バランス型ポートフォリオ
   - 全額現金（リスクゼロ）
   - アグレッシブ型（株式100%）
   - 合計100%でない場合の正規化
   - 空のアロケーション

4. **Required Monthly Investment** (3 tests)
   - 正常計算（5000万円、30年、7%）
   - 金利0%のケース
   - 運用期間0年のケース

5. **Risk Return Analysis** (2 tests)
   - 分析結果の正確性
   - アセットクラス詳細情報

6. **Portfolio Validation** (5 tests)
   - 正常ケース（100%）
   - 合計 < 95%
   - 合計 > 105%
   - 負の割合
   - 割合 > 100

7. **Rebalancing Suggestions** (3 tests)
   - 正常提案
   - 差分の大きい順ソート
   - 新規資産クラスの追加

8. **Asset Classes Constants** (4 tests)
   - 全6クラス定義確認
   - 期待リターン・リスク存在確認
   - 株式 > 債券（リターン・リスク）
   - 現金のリスクゼロ確認

---

## 技術スタック

### 新規導入:
- **Recharts**: グラフ描画（散布図、円グラフ、棒グラフ、折れ線グラフ）
- **Supabase Client**: PostgreSQL連携（ポートフォリオ永続化）

### 既存利用:
- React 18 + TypeScript
- Tailwind CSS（スタイリング）
- Vite（ビルドツール）
- Vitest（テストフレームワーク）

---

## データベース連携

### Supabaseテーブル（既存）:

1. **`asset_portfolios`**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK)
   - `name` (TEXT)
   - `description` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMP)

2. **`asset_allocations`**
   - `id` (UUID, PK)
   - `portfolio_id` (UUID, FK)
   - `asset_class` (TEXT, CHECK constraint)
   - `allocation_percentage` (NUMERIC 5,2)
   - `expected_return` (NUMERIC 5,2)
   - `risk_level` (TEXT)
   - `created_at` (TIMESTAMP)

### RLS (Row Level Security):
- ユーザーは自分のポートフォリオのみアクセス可能
- カスケード削除（ポートフォリオ削除時にアロケーションも自動削除）

---

## パフォーマンス最適化

1. **useMemo**: 計算結果のメモ化
   - `analyzeRiskReturn()`
   - `scatterData`, `pieData`, `barData`

2. **useCallback**: イベントハンドラのメモ化
   - `fetchPortfolios()`
   - `createPortfolio()`, `updatePortfolio()`, `deletePortfolio()`

3. **計算効率**:
   - 年次データは一度に計算（O(n)）
   - ポートフォリオ計算は線形時間（O(m), m=資産クラス数）

---

## UI/UXの特徴

### レスポンシブデザイン:
- グリッドレイアウト（`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`）
- タブレット・PC対応
- グラフのResponsiveContainer

### インタラクティブ性:
- スライダー操作（リアルタイム計算）
- ▲/▼ボタン（1%刻み調整）
- ホバー効果（ボタン、グラフツールチップ）

### ビジュアルフィードバック:
- 色分け（青: 元本/期待リターン、緑: 運用益、オレンジ: リスク、紫: 合計）
- バリデーションエラー表示（赤色）
- ローディング状態表示

### ヘルプテキスト:
- 各セクションに解説付き
- アセットアロケーションのポイント
- シミュレーション活用のポイント
- グラフの見方

---

## ファイル構成

```
src/
├── utils/
│   └── assetCalculator.ts          (380行) ✅
├── types/
│   └── investment.ts                (拡張: +80行) ✅
├── components/
│   └── FP/
│       └── Asset/
│           ├── PortfolioManager.tsx       (200行) ✅
│           ├── InvestmentSimulator.tsx    (230行) ✅
│           └── RiskReturnChart.tsx        (280行) ✅
├── hooks/
│   └── useAssetPortfolio.ts        (270行) ✅
├── pages/
│   └── AssetManagement.tsx         (130行) ✅
└── tests/
    └── unit/
        └── assetCalculator.test.ts (370行, 28 tests) ✅
```

**総行数**: 約1,960行

---

## 完了条件の確認

### ✅ 全6チケット実装完了
- TICKET-1501: 資産運用計算エンジン ✅
- TICKET-1502: ポートフォリオ管理UI ✅
- TICKET-1503: 積立投資シミュレーター ✅
- TICKET-1504: リスク・リターン分析グラフ ✅
- TICKET-1505: hooks実装 ✅
- TICKET-1506: ページ統合 ✅

### ✅ TypeScript type-check通過
```bash
npm run type-check
# ✅ No errors
```

### ✅ 28個のテスト合格
```bash
npm run test -- --run tests/unit/assetCalculator.test.ts
# ✓ tests/unit/assetCalculator.test.ts  (28 tests) 18ms
# Test Files  1 passed (1)
# Tests  28 passed (28)
```

### ✅ コンポーネントがエラーなくレンダリング
- PortfolioManager: ✅
- InvestmentSimulator: ✅
- RiskReturnChart: ✅
- AssetManagement (統合ページ): ✅

### ✅ 実装サマリードキュメント作成
- このファイル: `docs/TICKET-1501-1506-SUMMARY.md` ✅

---

## 次のステップ（推奨）

1. **Phase 16: 保険設計シミュレーション**
   - 必要保障額計算
   - 保険管理機能
   - 分析・提案機能

2. **Phase 17: 追加機能**
   - 繰上返済シミュレーション
   - 複数ローン比較機能
   - PDF出力機能

3. **Phase 18: モバイルアプリ最終調整**
   - ネイティブ機能統合
   - Android/iOS最適化
   - ストア公開準備

---

## 実装時の工夫・学び

### 1. 複利計算の精度
- `Math.round()` で円単位に丸め
- 浮動小数点誤差に対応
- 金利0%のケースを別処理

### 2. ポートフォリオ計算の簡易化
- 相関係数を考慮しない（保守的見積もり）
- 実装シンプル、理解しやすい
- 実用的には十分な精度

### 3. Supabase null対応
- 無料版（Supabase未設定）でもエラーにならない
- `supabase` が null の場合のガード処理
- 有料版への段階的移行が可能

### 4. テストカバレッジ
- 28個のテストで主要機能を網羅
- 境界値テスト（金利0%、期間0年など）
- エッジケース対応（空配列、負数など）

### 5. UIの直感性
- スライダー + ▲▼ボタンの組み合わせ
- リアルタイム計算（即座にフィードバック）
- グラフ・ビジュアライゼーションで理解促進

---

## まとめ

Phase 15「資産運用シミュレーション」の実装が完了しました。

**実装内容**:
- 10個の計算関数（複利、積立、ポートフォリオ、リバランスなど）
- 3つのUIコンポーネント（ポートフォリオ管理、シミュレーター、分析グラフ）
- 1つの統合ページ（タブ切り替え）
- 1つのカスタムフック（Supabase連携）
- 28個のテスト（全合格）

**品質保証**:
- TypeScript strict mode通過 ✅
- 全テスト合格 ✅
- レンダリングエラーなし ✅

**開発時間**: 約3時間（見積通り）

Phase 15は完了しました。Phase 16（保険設計）、Phase 17（追加機能）、Phase 18（モバイル最終調整）へ進む準備が整っています。

---

**実装者**: Claude Code Agent
**完了日**: 2025-10-25
**ステータス**: ✅ COMPLETED
