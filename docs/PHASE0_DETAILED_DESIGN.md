# Phase 0 仕上げタスク詳細設計書

## 実装優先順位
- 1️⃣ ErrorBoundary実装（High）: 予期しない障害時のUXと監視体制を強化する基盤タスク。
- 2️⃣ プライバシーポリシー・利用規約（High）: コンプライアンス観点で必須。公開済みアプリの信頼性確保。
- 3️⃣ Toast通知実装（Medium）: 計算フローのフィードバック改善。UX向上に直結。
- 4️⃣ Google Analytics設定（Medium）: ユーザー行動可視化。上記実装から発火するイベント整備が前提。

## タスク依存関係
- ErrorBoundaryのエラーログはGAイベント計測（タスク4）と連携するため、先行して実装。
- Toast通知はLoanContextや計算フローの成功/失敗ハンドリングと結合するため、ErrorBoundary後に行い、計測イベント（タスク4）のトリガーにもなる。
- プライバシーポリシー・利用規約はGA設定の同意メッセージや脚注と内容を同期させる必要があるが、UI側の変更が中心で独立して進行可能。
- GA設定は他タスクで発火するイベントハンドラが出揃ってから最終的に結線する。

## Codex並列実行戦略
- **フェーズ1（ErrorBoundary + プライバシーページ）**: 共通レイアウトを扱うため、同一エージェントで逐次対応。ErrorBoundary完了後にリーガルページの文章更新を着手。
- **フェーズ2（Toast通知）**: 状態管理・UIの結合タスクとして単独エージェントで実装。LoanContextとフォーム周辺のテストも同時に。
- **フェーズ3（Google Analytics）**: ReactGA周りのモック整備とイベント発火ロジックを担当するエージェントを起用。Toast実装から提供されるハンドラを利用しつつイベント発火箇所を洗い出す。
- 各フェーズ完了ごとに`npm run lint`→`npm run type-check`→対象テストを実行するガードタスクを配置し、並列で走る変更の衝突を防止。

## 統合テスト計画
- 単体テスト: `tests/unit/components/ErrorBoundary.test.tsx`、`tests/unit/contexts/ToastContext.test.tsx`、`tests/unit/utils/logger.test.ts`を追加。`npm run test -- --runTestsByPath`で対象ファイルのみ先行確認。
- 統合テスト: `tests/integration/app/ErrorHandling.test.tsx`でErrorBoundaryとToastの組み合わせを検証。`tests/integration/analytics/Events.test.tsx`でGAイベントの呼び出し順序を確認。
- 回帰テスト: 仕上げ後に`npm run test`、`npm run lint`、`npm run build`を実行し、既存74テストの合格を担保。
- 本番計測前チェック: `node scripts/check-dev-server.js`で開発サーバーの健全性、`npm run preview`でビルド後挙動を最終確認。

---

## 1. ErrorBoundary実装（High Priority）

### 1.1 概要と目的
- React ErrorBoundaryを強化し、致命的エラー発生時でもユーザーが復帰できるフォールバックUIを提供。
- 発生した例外をログ出力・永続化し、運用監視（GAイベント含む）に活用。
- 再試行やサポート導線をフォールバックに含め、ユーザービリティを高める。

### 1.2 技術仕様
- 主要ファイル: `src/components/ErrorBoundary.tsx`（ロジック拡張）、`src/utils/logger.ts`（新規）、`src/utils/index.ts`（エクスポート追加）、`src/main.tsx`（エラー境界によるラップ構成見直し）。
- 既存のクラスベースErrorBoundaryを拡張し、`fallbackRender`プロップでUIを差し替え可能にする。
- `logger.ts`で`logError`を定義し、`console.error`・`trackEvent('Error', ...)`・`localStorage`バックアップの3段ロギングを統合。
- フォールバックUIでは再読み込みボタン＋エラーレポートリンク（GitHub Issues）を表示。Tailwindで視認性を担保。

### 1.3 実装手順
1. `src/utils/logger.ts`を作成し、`logError(error: Error, errorInfo?: ErrorInfo)`と`logInfo`などのヘルパーを定義。GA計測は`trackEvent`を内部で呼び出し（GA未設定時はno-op）。
2. `src/utils/index.ts`に`export * from './logger';`を追加してフラットインポートを可能にする。
3. `ErrorBoundary`に`fallbackRender`プロップと`onReset`コールバックを追加し、`state`リセットを可能にする。`componentDidCatch`で`logError`を呼び出す。
4. フォールバックUIを`ErrorBoundaryFallback`コンポーネントとして`src/components/ErrorBoundaryFallback.tsx`（新規）に分離し、翻訳テキスト・アクションボタン・エラー詳細トグルを整理。
5. `src/main.tsx`で`React.StrictMode`内に`<ErrorBoundary fallbackRender={ErrorBoundaryFallback}>`を配置し、`resetKeys`に`[location.pathname]`を渡せるよう`MemoryRouter`から`BrowserRouter`ラップ構成を`App`側で吸収。
6. 逆算計算や履歴読み込みなど例外が発生し得る箇所（`LoanContext.tsx:calculateLoan`など）で`logError`を併用し、Boundary以外のハンドリングでも一元化。

### 1.4 コード例（TypeScript）
```tsx
// src/components/ErrorBoundary.tsx
export function ErrorBoundary({
  children,
  fallbackRender = (props) => <DefaultFallback {...props} />,
}: PropsWithChildren<{ fallbackRender?: (api: FallbackProps) => ReactNode }>) {
  return (
    <BaseErrorBoundary
      fallbackRender={(api) => {
        logError(api.error, api.componentStack);
        return fallbackRender(api);
      }}
      onReset={() => window.location.reload()}
    >
      {children}
    </BaseErrorBoundary>
  );
}

// src/utils/logger.ts
export function logError(error: Error, errorInfo?: string) {
  console.error('[AppError]', error, errorInfo);
  trackEvent('Error', 'Unhandled', error.name, errorInfo ? errorInfo.length : undefined);
  window.localStorage.setItem(
    `loan-sim-error-${Date.now()}`,
    JSON.stringify({ message: error.message, stack: error.stack, info: errorInfo })
  );
}
```

### 1.5 テスト方針
- `tests/unit/components/ErrorBoundary.test.tsx`: テスト用コンポーネントで例外を発生させ、フォールバックUIと`logError`呼び出し（`vi.fn`でモック）を検証。
- `tests/integration/app/ErrorHandling.test.tsx`: 実際の`App`をラップし、`LoanContext`の計算エラーを人工的に誘発→フォールバック遷移を確認。
- Storybook相当のドキュメントは不要だが、`docs/TROUBLESHOOTING.md`に回復手順追記を検討。

### 1.6 工数見積もり
- 実装: 4.0h（logger作成1h、ErrorBoundary改修2h、メイン接続1h）
- テスト/リファクタ: 2.0h
- 合計: **6.0h**

---

## 2. Toast通知実装（Medium Priority）

### 2.1 概要と目的
- 計算成功・失敗・履歴操作など主要ユーザーアクションに即時フィードバックを提供。
- 通知の自動消去と手動dismissの両立でUXを最適化。
- エラーや成功イベントとGA計測を連動させ、ユーザー行動を可視化。

### 2.2 技術仕様
- 主要ファイル: `src/contexts/ToastContext.tsx`（複数トースト管理とdurations）、`src/hooks/useCalculator.ts`（成功/失敗ハンドラ注入）、`src/pages/Home.tsx`および`src/pages/History.tsx`（履歴操作時の通知）、`src/utils/analytics.ts`（イベント発火）、`src/components/Toast.tsx`（バリエーションアイコン）。
- ToastはContext APIで管理し、`useToast`カスタムフックを既存フォーム・履歴機能から呼び出す。
- メッセージ定義を`src/constants/toastMessages.ts`（新規）で集中管理し、翻訳・再利用性を確保。
- Tailwindのユーティリティクラスを活用し、レスポンシブ対応（モバイルでは中央下部に配置）。

### 2.3 実装手順
1. `ToastContext`に`position`/`duration`のデフォルト設定と、`removeToast`の`useEffect`によるオートクリーンアップを追加。
2. `useCalculator`内で`useToast`を使用し、`calculateLoan`成功時に`showToast(toastMessages.calculationSuccess(params))`、例外時には`showToast(toastMessages.calculationError(error))`を呼び出し。
3. `LoanContext`で履歴保存・削除時に`historyCallbacks`を返却し、`History`ページから`useToast`を使って通知（保存成功、削除完了、上限到達など）。
4. `Toast`コンポーネントにタイプごとのアイコン（`heroicons`のアウトラインをローカル実装）と`aria-live="polite"`を追加しアクセシビリティ対応。
5. `src/components/ToastStack.tsx`（新規）を導入し、モバイル/デスクトップでのスタックレイアウトを制御。
6. GAイベント（タスク4）との連携のため、`showToast`内部で`trackEvent('Toast', type, message)`をフック出来るようにオプションを持たせる。

### 2.4 コード例（TypeScript）
```tsx
// src/hooks/useCalculator.ts
const { showToast } = useToast();

const handleCalculate = useCallback(async (params: LoanParams) => {
  setIsCalculating(true);
  setError(null);
  try {
    await calculateLoan(params);
    showToast(toastMessages.calculationSuccess(params), 'success');
  } catch (err) {
    const message = err instanceof Error ? err.message : '計算に失敗しました';
    setError(message);
    showToast(message, 'error');
    logError(err as Error);
  } finally {
    setIsCalculating(false);
  }
}, [calculateLoan, showToast]);
```

### 2.5 テスト方針
- `tests/unit/contexts/ToastContext.test.tsx`: `showToast`→自動消去→`onClose`フックの流れを検証。`vi.useFakeTimers()`でタイマーを制御。
- `tests/unit/hooks/useCalculator.test.ts`: 計算成功/失敗時に正しいトーストとエラー状態が発行されるかを確認（`LoanContext`をモック）。
- `tests/integration/app/ToastFlow.test.tsx`: Homeページフォーム送信→Toast表示→自動消去までをE2E的に確認。

### 2.6 工数見積もり
- 実装: 3.5h（Context強化1.5h、フォーム統合1h、History通知1h）
- テスト: 1.5h
- UX調整: 0.5h
- 合計: **5.5h**

---

## 3. プライバシーポリシー・利用規約（High Priority）

### 3.1 概要と目的
- 公開済みアプリに対し、法的文書（プライバシーポリシー、利用規約）を整備し透明性を確保。
- GAによるデータ取得やローカルストレージ利用について明示し、ユーザー同意を得るための根拠を整える。
- フッターやメタ情報を更新して常に最新のドキュメントへ導線を提供。

### 3.2 技術仕様
- 主要ファイル: `src/pages/PrivacyPolicy.tsx`, `src/pages/TermsOfService.tsx`, `src/components/Layout/Footer.tsx`（リンク・著作権表記）、`src/components/Layout/Header.tsx`（場合によってアナウンスバー追加）、`public/privacy-policy.html`（オフラインコピーが必要なら追加）。
- 文書コンポーネントは`Container`内で`prose`クラスを適用し長文の可読性を確保。更新日は`new Date()`取得ではなく固定日＋`docs/`内のメタデータ管理。
- Footerに`target="_blank"`は不要（SPA内遷移）。アクセシビリティ強化として`aria-label`を付与。
- `src/routes/legal.ts`などにルーティング定義を切り出し、`AppContent`で読み込むことでテスト性を高める。

### 3.3 実装手順
1. 文書ドラフトを`docs/issues/`に保存し、レビュー後に`PrivacyPolicy.tsx` / `TermsOfService.tsx`へ反映。Tailwindの`prose`で見出し・リストスタイルを適用。
2. `App.tsx`の`Routes`にリーガルページを追加し、`react-helmet-async`が導入済みであればタイトル/descriptionを設定。未導入なら`<title>`更新ロジックを追加。
3. Footerで`Link`の順序や区切りを整備し、©表記を`住宅ローン電卓`→`Loan Simulation`など正式サービス名に統一。
4. `docs/DEPLOYMENT.md`にリーガルページURLを追記し、運用手順を文書化。
5. テキスト変更が多いため、Vitestではスナップショットテスト（`tests/unit/pages/PrivacyPolicy.test.tsx`）を活用し、差分検知を容易にする。

### 3.4 コード例（TypeScript）
```tsx
// src/App.tsx (抜粋)
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/history" element={<History />} />
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  <Route path="/terms-of-service" element={<TermsOfService />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### 3.5 テスト方針
- `tests/unit/pages/PrivacyPolicy.test.tsx`: 文書主要セクション（はじめに/収集情報/お問い合わせ）が描画されるかチェック。
- `tests/integration/routing/LegalPages.test.tsx`: フッターリンク→各ページ遷移→ヘッダー/フッター共有が維持されるかを検証。
- アクセシビリティ: `@testing-library/jest-dom`の`toHaveAccessibleName`でリンクの`aria-label`を確認。

### 3.6 工数見積もり
- 文書レビュー＆更新: 2.0h
- 実装・ルーティング: 1.0h
- テスト作成: 1.0h
- 合計: **4.0h**

---

## 4. Google Analytics設定（Medium Priority）

### 4.1 概要と目的
- GA4を用いてユーザー行動を計測し、計算頻度・履歴活用・エラー発生を可視化。
- プライバシー配慮として、明示的な同意取得とオプトアウト導線を提供。
- Toast通知・ErrorBoundary・履歴操作と連動したイベントを整理。

### 4.2 技術仕様
- ライブラリ: `react-ga4`（既存）、`.env`で`VITE_GA_MEASUREMENT_ID`を管理。開発/本番でMeasurement IDを切り替え。
- 主要ファイル: `src/utils/analytics.ts`（初期化・イベントAPI統合）、`src/hooks/useConsent.ts`（新規: 同意状態管理）、`src/components/AnalyticsConsentBanner.tsx`（新規: 初回訪問時のバナー）、`src/contexts/LoanContext.tsx`（イベント発火）、`src/pages/Home.tsx`（pageview以外のイベント補強）。
- イベント命名規則: `category`に大分類（`Calculation`、`History`、`Error`）、`action`に動作（`Execute`、`Save`など）、`label`に詳細（返済方式など）を格納。
- プライバシー配慮: 同意未取得時は`initGA`をスキップし、イベント関数はno-op。バナーで同意or拒否を選択でき、拒否時は`localStorage`にフラグ保存。

### 4.3 実装手順
1. `src/hooks/useConsent.ts`で`useState`と`useEffect`を用いた同意状態管理フックを追加。`localStorage`キー（例: `loan-sim-analytics-consent`）で永続化。
2. `AnalyticsConsentBanner`を作成し、拒否時にはGA初期化を行わず、受諾時に`initGA`を呼ぶ。受諾後は`trackPageView`を初回送信。
3. `App`で`useConsent`を用い、同意が得られるまで`trackPageView`や`trackEvent`呼び出しを抑制。`ErrorBoundary`やToastから呼ぶ`logError`なども同意チェックを通過。
4. `LoanContext.calculateLoan`完了時に`trackCalculation(params.repaymentType, params.principal, years)`を呼び、履歴保存時には`trackHistorySave()`を使用。履歴削除時も`trackHistoryDelete()`を呼び出す。
5. `useCalculator`でエラー発生時に`trackEvent('Calculation', 'Error', errorMessage)`を発火し、Toastと連携。
6. テストで`react-ga4`を`vi.mock`し、同意状態の切り替えに応じて`initialize`や`event`が呼ばれる/呼ばれないことを検証。

### 4.4 コード例（TypeScript）
```tsx
// src/utils/analytics.ts
let isInitialized = false;

export function initGA() {
  if (isInitialized || !GA_MEASUREMENT_ID) return;
  ReactGA.initialize(GA_MEASUREMENT_ID, { gtagOptions: { send_page_view: false } });
  isInitialized = true;
}

export function trackCalculation(params: { repaymentType: LoanParams['repaymentType']; principal: number; totalMonths: number; }) {
  if (!isInitialized) return;
  ReactGA.event({
    category: 'Calculation',
    action: 'Execute',
    label: params.repaymentType,
    value: params.principal,
  });
}
```

### 4.5 テスト方針
- `tests/unit/utils/analytics.test.ts`: 初期化済みフラグの挙動、同意未取得時のno-opを確認。
- `tests/integration/analytics/ConsentFlow.test.tsx`: Consentバナー表示→同意→イベント発火までのユーザーフローをシミュレート。
- `npm run test -- --runTestsByPath tests/integration/analytics/Events.test.tsx`でToast/履歴操作からイベントが呼ばれるかの回帰を実施。

### 4.6 工数見積もり
- 実装: 3.0h（Consent管理1h、イベント結線1.5h、バナーUI0.5h）
- テスト: 1.5h
- ドキュメント更新（`docs/DEPLOYMENT.md`, `docs/CURRENT_STATUS.md`）: 0.5h
- 合計: **5.0h**

---

## 全体工数サマリー
- ErrorBoundary: 6.0h
- Toast通知: 5.5h
- プライバシー/利用規約: 4.0h
- Google Analytics: 5.0h
- バッファ（レビュー・リファクタ・ドキュメント更新）: 2.0h
- **総計: 22.5h**

## リスクと緩和策
- GA同意取得フローのUX複雑化 → バナーを最小限にし、拒否時の再同意導線をFooterへ追加。
- ErrorBoundary改修によるレイアウト崩れ → Storybook代替として`npm run dev`でフォールバックUI確認、Tailwindクラスを既存デザインに合わせる。
- Toast多重表示による視認性低下 → 最大表示数を3件に制限し、古い通知から順に自動消去。
- テストのモック過多によるメンテコスト → GAモック共通化ユーティリティ（`tests/utils/gaMock.ts`）を用意。

## 進捗チェックポイント
- 各タスク完了後、`docs/CURRENT_STATUS.md`へ更新概要を追記。
- `CHANGELOG.md`に`fix:`または`feat:`スコープ付きのエントリを追加（例: `feat(error-handling): add global error boundary logging`）。
- リリース前に`npm run build`→`npm run preview`→`node scripts/check-dev-server.js`の順で最終確認。

