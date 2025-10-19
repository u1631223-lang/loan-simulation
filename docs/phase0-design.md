OpenAI Codex v0.46.0 (research preview)
--------
workdir: /Users/u1/dev/loan-simulation
model: gpt-5-codex
provider: openai
approval: never
sandbox: read-only
reasoning effort: high
reasoning summaries: auto
session id: 0199e322-d803-75d3-bcbe-4efc9d6e94b8
--------
user
loan-simulationプロジェクトのPhase 0詳細設計書を作成してください。要件定義、アーキテクチャ、データモデル、API設計を含めてください。

thinking
**Preparing design document in Japanese**
codex
**Phase 0設計方針**
- 目的: 一般ユーザーがローン条件を入力し、返済計画・総支払額を即時に可視化できるシミュレーターを構築し、将来の機能拡張（土地・住宅・車ローンなど）に備える
- スコープ: Webクライアント（React 18 + TypeScript + Vite）と軽量なBFF的APIモックに限定し、ネイティブ/CapacitorはPhase1以降
- 成果物: 要件定義、クライアントアーキテクチャ、仮API（一部ローカルモック）、データモデル定義、UIワイヤーフレーム案、検証計画（ユニット＋統合テスト方針）

**要件定義**
- 機能要件: 1) ローン条件入力フォーム（借入額・年利・返済年数・ボーナス返済有無） 2) 返済スケジュール表（毎月返済額、利息/元本内訳） 3) グラフ表示（総支払額・残高推移） 4) 条件プリセット保存/読込（ローカルストレージ） 5) 数値バリデーションとエラー表示
- 非機能要件: 1) 表示速度 < 1.5s on Lighthouse Fast4G 2) 主要ブラウザ（Chrome/Edge/Safari/Firefox最新）対応 3) パフォーマンス目標（Core Web Vitals LCP < 2.5s, INP < 200ms） 4) i18n準備（`en`, `ja`） 5) A11y（WCAG 2.1 AAフォーム入力、キーボード操作、ARIA）
- データ要件: 金利は年利固定（単利/複利切替未対応）、返済方式は元利均等のみ、通貨はJPY想定（将来多通貨対応を考慮し`currency`フィールド保持）
- 運用要件: design doc・チケット管理は`docs/`とIssueトラッカー、CIで`npm run lint`, `npm run test`, `npm run build`実行、Firebase Hosting or Vercel Preview想定
- リスク: 1) 計算精度（浮動小数）→decimal.js等検討 2) グラフ性能→Recharts vs Chart.js評価 3) i18nコスト→Phase0では文言抽出のみ

**アーキテクチャ**
- フロント: React 18 (hooks), TypeScript strict, Vite; 状態管理は軽量Context + hooks、将来的ReduxToolkit導入余地を確保
- UIレイヤ: Tailwind CSS + Headless UI; コンポーネント構造は `src/components` にAtoms/Molecules、`src/pages`にルーティング
- 計算ロジック: `@/utils/loanCalculator.ts`に純関数群（返済額計算、スケジュール生成、総支払額算出、APR換算）、テストは`tests/unit/utils/loanCalculator.test.ts`
- 状態管理: `@/contexts/LoanFormContext.tsx`でフォーム状態＋バリデーション、`@/hooks/useLoanSimulation.ts`で計算結果をキャッシュ化（`useMemo`）
- データ取得: Phase0はAPIモック（`public/mock/loan-presets.json`または`msw`）; 将来的にBFF(Node/Express/Nest)へ移行可能な抽象化 (`@/api/client.ts`)
- ルーティング: React Router v6; 主要ページ `LoanSimulatorPage`, `PresetManagerPage`, `DocsPage`（FAQ/用語集）
- エコシステム: Vitest + React Testing Library, PlaywrightをPhase1で検討; ESLint + Prettier; Huskyでpre-commit（lint+test）設定

**データモデル**
- `LoanInput`:
  - `principal: number` 借入額（円）
  - `interestRate: number` 年利（%）
  - `termYears: number` 返済年数
  - `paymentFrequency: 'monthly' | 'biweekly'` Phase0は`monthly`
  - `bonusPayment: { enabled: boolean; month: number; amount: number } | null`
  - `currency: 'JPY'`
- `LoanScheduleEntry`:
  - `periodIndex: number` 1..N
  - `paymentDate: string` ISO8601
  - `principalPaid: number`
  - `interestPaid: number`
  - `remainingPrincipal: number`
- `LoanSummary`:
  - `monthlyPayment: number`
  - `totalInterest: number`
  - `totalPayment: number`
  - `apr: number`
- `LoanPreset`:
  - `id: string` UUID v4
  - `label: string`
  - `createdAt: string`
  - `input: LoanInput`
- 永続化: ローカルストレージキー `loan-sim.presets`, `loan-sim.lastInput`; util `@/utils/storage.ts`でJSON parse/stringify + try/catch

**API設計（Phase0モック/BFF方針）**
- `GET /api/presets` → 200 `[LoanPreset]`
  - 役割: プリセット一覧取得、Phase0は`msw`がローカルストレージをラップ
- `POST /api/presets` body: `{ label: string, input: LoanInput }`
  - 201 `{ id, createdAt, input }`、バリデーションエラー 422
- `DELETE /api/presets/:id` → 204、存在しない場合404
- `POST /api/simulations/preview` body: `LoanInput`
  - 200 `{ summary: LoanSummary, schedule: LoanScheduleEntry[] }`
  - Phase0はクライアント内で計算しBFFはダミー応答、将来サーバー計算に差し替え
- 認証: Phase0では未実装（匿名）。Phase1でAuth0/NextAuth検討
- エラー方針: JSON `{ error: { code: string; message: string; details?: any } }`; UI側は`toast`とフォームエラー表示
- パフォーマンス: `POST /api/simulations/preview`は50ms以内、1秒に最大5リクエスト（Typeahead想定）→クライアント側でdebounce

**次のステップ**
- ワイヤーフレーム（Figma）と計算仕様をDocs化 (`docs/design/phase0-ui.md`, `docs/decisions/loan-calculation.md`)
- `@/utils/loanCalculator.ts`試作とユニットテスト実装
- `msw`導入とAPI境界の整備 (`tests/integration/pages/LoanSimulatorPage.test.tsx`)
- i18n基盤（`react-i18next`）のスケルトン実装
tokens used
2,790
**Phase 0設計方針**
- 目的: 一般ユーザーがローン条件を入力し、返済計画・総支払額を即時に可視化できるシミュレーターを構築し、将来の機能拡張（土地・住宅・車ローンなど）に備える
- スコープ: Webクライアント（React 18 + TypeScript + Vite）と軽量なBFF的APIモックに限定し、ネイティブ/CapacitorはPhase1以降
- 成果物: 要件定義、クライアントアーキテクチャ、仮API（一部ローカルモック）、データモデル定義、UIワイヤーフレーム案、検証計画（ユニット＋統合テスト方針）

**要件定義**
- 機能要件: 1) ローン条件入力フォーム（借入額・年利・返済年数・ボーナス返済有無） 2) 返済スケジュール表（毎月返済額、利息/元本内訳） 3) グラフ表示（総支払額・残高推移） 4) 条件プリセット保存/読込（ローカルストレージ） 5) 数値バリデーションとエラー表示
- 非機能要件: 1) 表示速度 < 1.5s on Lighthouse Fast4G 2) 主要ブラウザ（Chrome/Edge/Safari/Firefox最新）対応 3) パフォーマンス目標（Core Web Vitals LCP < 2.5s, INP < 200ms） 4) i18n準備（`en`, `ja`） 5) A11y（WCAG 2.1 AAフォーム入力、キーボード操作、ARIA）
- データ要件: 金利は年利固定（単利/複利切替未対応）、返済方式は元利均等のみ、通貨はJPY想定（将来多通貨対応を考慮し`currency`フィールド保持）
- 運用要件: design doc・チケット管理は`docs/`とIssueトラッカー、CIで`npm run lint`, `npm run test`, `npm run build`実行、Firebase Hosting or Vercel Preview想定
- リスク: 1) 計算精度（浮動小数）→decimal.js等検討 2) グラフ性能→Recharts vs Chart.js評価 3) i18nコスト→Phase0では文言抽出のみ

**アーキテクチャ**
- フロント: React 18 (hooks), TypeScript strict, Vite; 状態管理は軽量Context + hooks、将来的ReduxToolkit導入余地を確保
- UIレイヤ: Tailwind CSS + Headless UI; コンポーネント構造は `src/components` にAtoms/Molecules、`src/pages`にルーティング
- 計算ロジック: `@/utils/loanCalculator.ts`に純関数群（返済額計算、スケジュール生成、総支払額算出、APR換算）、テストは`tests/unit/utils/loanCalculator.test.ts`
- 状態管理: `@/contexts/LoanFormContext.tsx`でフォーム状態＋バリデーション、`@/hooks/useLoanSimulation.ts`で計算結果をキャッシュ化（`useMemo`）
- データ取得: Phase0はAPIモック（`public/mock/loan-presets.json`または`msw`）; 将来的にBFF(Node/Express/Nest)へ移行可能な抽象化 (`@/api/client.ts`)
- ルーティング: React Router v6; 主要ページ `LoanSimulatorPage`, `PresetManagerPage`, `DocsPage`（FAQ/用語集）
- エコシステム: Vitest + React Testing Library, PlaywrightをPhase1で検討; ESLint + Prettier; Huskyでpre-commit（lint+test）設定

**データモデル**
- `LoanInput`:
  - `principal: number` 借入額（円）
  - `interestRate: number` 年利（%）
  - `termYears: number` 返済年数
  - `paymentFrequency: 'monthly' | 'biweekly'` Phase0は`monthly`
  - `bonusPayment: { enabled: boolean; month: number; amount: number } | null`
  - `currency: 'JPY'`
- `LoanScheduleEntry`:
  - `periodIndex: number` 1..N
  - `paymentDate: string` ISO8601
  - `principalPaid: number`
  - `interestPaid: number`
  - `remainingPrincipal: number`
- `LoanSummary`:
  - `monthlyPayment: number`
  - `totalInterest: number`
  - `totalPayment: number`
  - `apr: number`
- `LoanPreset`:
  - `id: string` UUID v4
  - `label: string`
  - `createdAt: string`
  - `input: LoanInput`
- 永続化: ローカルストレージキー `loan-sim.presets`, `loan-sim.lastInput`; util `@/utils/storage.ts`でJSON parse/stringify + try/catch

**API設計（Phase0モック/BFF方針）**
- `GET /api/presets` → 200 `[LoanPreset]`
  - 役割: プリセット一覧取得、Phase0は`msw`がローカルストレージをラップ
- `POST /api/presets` body: `{ label: string, input: LoanInput }`
  - 201 `{ id, createdAt, input }`、バリデーションエラー 422
- `DELETE /api/presets/:id` → 204、存在しない場合404
- `POST /api/simulations/preview` body: `LoanInput`
  - 200 `{ summary: LoanSummary, schedule: LoanScheduleEntry[] }`
  - Phase0はクライアント内で計算しBFFはダミー応答、将来サーバー計算に差し替え
- 認証: Phase0では未実装（匿名）。Phase1でAuth0/NextAuth検討
- エラー方針: JSON `{ error: { code: string; message: string; details?: any } }`; UI側は`toast`とフォームエラー表示
- パフォーマンス: `POST /api/simulations/preview`は50ms以内、1秒に最大5リクエスト（Typeahead想定）→クライアント側でdebounce

**次のステップ**
- ワイヤーフレーム（Figma）と計算仕様をDocs化 (`docs/design/phase0-ui.md`, `docs/decisions/loan-calculation.md`)
- `@/utils/loanCalculator.ts`試作とユニットテスト実装
- `msw`導入とAPI境界の整備 (`tests/integration/pages/LoanSimulatorPage.test.tsx`)
- i18n基盤（`react-i18next`）のスケルトン実装
