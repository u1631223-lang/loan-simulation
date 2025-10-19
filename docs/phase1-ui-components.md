OpenAI Codex v0.46.0 (research preview)
--------
workdir: /Users/u1/dev/loan-simulation
model: gpt-5-codex
provider: openai
approval: never
sandbox: read-only
reasoning effort: high
reasoning summaries: auto
session id: 0199e32c-4556-7300-ae94-2e425fb123ad
--------
user
phase0-design.mdに基づいて、UIコンポーネントの詳細仕様書を作成してください。Atomic Designパターンに従い、各コンポーネントのProps、状態管理、アクセシビリティ要件を含めてください。

thinking
**Preparing to read design file**
exec
bash -lc ls in /Users/u1/dev/loan-simulation succeeded in 33ms:
AGENTS.md
CHANGELOG.md
CLAUDE.md
README.md
SECURITY.md
android
capacitor.config.ts
dist
docs
index.html
ios
node_modules
package-lock.json
package.json
postcss.config.js
public
scripts
src
tailwind.config.js
tests

thinking
**Searching for phase0-design.md file**
exec
bash -lc "rg --files -g 'phase0-design.md'" in /Users/u1/dev/loan-simulation succeeded in 76ms:
docs/phase0-design.md

thinking
**Reading file contents**
exec
bash -lc 'cat docs/phase0-design.md' in /Users/u1/dev/loan-simulation succeeded in 43ms:
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

thinking
**Drafting detailed UI component specs**

I'm preparing a comprehensive textual specification for the UI components following the Atomic Design methodology, covering atoms, molecules, organisms, templates, and pages. I'll include concise bullet-point summaries of props, state management, dependencies, and accessibility features for each component, all aligned with the phase0 design and the user's original Japanese context.
codex
**UI仕様**

**Atoms**
- `TextInput` (`src/components/atoms/TextInput.tsx`) — Props: `id`, `label`, `value`, `onChange`, `type?`, `placeholder?`, `inputMode?`, `helperText?`, `error?`; State: none; 状態管理: 完全制御コンポーネントとして`LoanFormContext`や親から値を受領; A11y: `label`と`id`を紐付け、`aria-invalid`/`aria-describedby`を自動付与しエラー文言は同期表示.
- `NumberInput` (`atoms/NumberInput.tsx`) — Props: `id`, `label`, `value`, `onChange`, `min?`, `max?`, `step?`, `suffix?`, `locale?`, `error?`; State: フォーマット中の内部`displayValue`(useState)で`blur`時に正規化; 状態管理: `LoanFormContext`へ数値で通知; A11y: `inputmode="decimal"`, `aria-valuemin/max`, JPYの場合は`aria-label`で通貨を明示.
- `Select` (`atoms/Select.tsx`) — Props: `id`, `label`, `value`, `options`, `onChange`, `placeholder?`, `error?`; State: none; 状態管理: 親から制御; A11y: `role="listbox"`/`aria-expanded`をHeadless UIで提供、キーボードナビゲーションと`aria-activedescendant`対応.
- `ToggleSwitch` (`atoms/ToggleSwitch.tsx`) — Props: `id`, `label`, `checked`, `onChange`, `helperText?`, `disabled?`; State: none; 状態管理: 親制御; A11y: `role="switch"`と`aria-checked`を付与し、スペース/Enterでトグル可能、隠しテキストで状態読み上げ.
- `Button` (`atoms/Button.tsx`) — Props: `variant`, `size`, `type`, `icon?`, `loading?`, `disabled?`, `ariaLabel?`; State: none; 状態管理: ハンドラは親から; A11y: ローディング時は`aria-busy`・スピナーに`role="status"`、アイコンのみは`aria-label`必須.
- `Card` (`atoms/Card.tsx`) — Props: `title?`, `subtitle?`, `children`, `elevation?`; State: none; 状態管理: レイアウト専用; A11y: `section`としてレンダリングし`aria-labelledby`を活用、見出しは`<h2>`等を受け入れる.

**Molecules**
- `FormField` (`components/molecules/FormField.tsx`) — Props: `label`, `htmlFor`, `helperText?`, `error?`, `children`; State: none; 状態管理: 子inputの状態を透過; A11y: `role="group"`で関連付け、エラー文は`aria-live="polite"`.
- `CurrencyField` (`molecules/CurrencyField.tsx`) — Props: `value`, `onChange`, `min`, `max`, `step`, `currency`; State: 内部`localizedValue`(useState)でフォーマット; 状態管理: 送信時に数値へ変換し`LoanFormContext`更新; A11y: `aria-label`で金額と通貨、桁区切り読み上げに`lang`設定.
- `InterestRateField` (`molecules/InterestRateField.tsx`) — Props: `value`, `onChange`, `min`, `max`, `step`; State: none; 状態管理: 直接コンテキスト更新; A11y: `%`サフィックスを`aria-describedby`で結合.
- `TermField` (`molecules/TermField.tsx`) — Props: `years`, `months?`, `onChange`; State: 内部で年/月スライダー値を保持し同期; 状態管理: フォームに複合オブジェクトで反映; A11y: スライダーには`aria-valuetext`で「N年」の読み上げ.
- `BonusRepaymentField` (`molecules/BonusRepaymentField.tsx`) — Props: `enabled`, `month`, `amount`, `onToggle`, `onChange`; State: トグル連動で子入力の活性状態を管理; 状態管理: `LoanFormContext`へ部分更新; A11y: 切替時に内包フォームを`aria-hidden`制御しフォーカスを先頭フィールドへ移動.

**Organisms**
- `LoanInputForm` (`components/organisms/LoanInputForm.tsx`) — Props: none (context依存); State: `LoanFormContext`から`state`/`dispatch`を取得し、フィールド単位で`dispatch({type, payload})`; 状態管理: `LoanFormContext`（`useReducer`）が全制御、バリデーションは`useEffect`で実行し`formErrors`を更新; A11y: フォームに`aria-describedby`で総合エラー、`submit`ボタンは`aria-disabled`設定、キーボードタブ順を視覚順に一致.
- `SimulationSummary` (`organisms/SimulationSummary.tsx`) — Props: `summary: LoanSummary | null`, `isLoading`, `currency`; State: none; 状態管理: `useLoanSimulation` hookの結果を受け取る; A11y: 数値カードを`<dl>`で構造化し、更新時は`aria-live="polite"`で読み上げ.
- `RepaymentScheduleTable` (`organisms/RepaymentScheduleTable.tsx`) — Props: `schedule: LoanScheduleEntry[]`, `isCollapsed`, `onToggle`; State: 内部`visibleRows`(useState)でページング; 状態管理: 表示件数はコンポーネント内部、データはhookから; A11y: `<table>`マークアップ、`scope="col"`と`aria-sort`、キーボード操作用に`button`で詳細開閉、視覚的行色分けはコントラスト比4.5:1確保.
- `RepaymentChart` (`organisms/RepaymentChart.tsx`) — Props: `schedule`, `summary`, `variant`('balance'|'interestShare'), `onVariantChange`; State: チャートライブラリ内部のみ; 状態管理: `useLoanSimulation`結果に対し`useMemo`でデータ変換; A11y: `role="img"`と`aria-labelledby`、データテーブルへフォールバック、Variant切替は`ToggleGroup`で提供.
- `PresetList` (`organisms/PresetList.tsx`) — Props: `presets`, `activeId?`, `onSelect`, `onDelete`, `onCreate`; State: 内部検索クエリ(useState)と`filteredPresets`(useMemo); 状態管理: 永続化は`useLoanPresets` hook（localStorage + `useReducer`）; A11y: リストは`<ul>`、各アイテムに`aria-selected`、削除ボタンは`aria-label`でプリセット名を含め、検索はラベル付き.

**Templates**
- `LoanSimulatorTemplate` (`components/templates/LoanSimulatorTemplate.tsx`) — Props: `form`, `summary`, `chart`, `schedule`, `toast`; State: none; 状態管理: 子Organismを受け取りレイアウト構築、レスポンシブで`CSS Grid`; A11y: 主ランドマークを`<main>`、フォーム領域を`<aside>`としてスクリーンリーダー順序を制御.
- `PresetManagerTemplate` (`templates/PresetManagerTemplate.tsx`) — Props: `list`, `editor`, `emptyState`; State: none; 状態管理: 選択状態は`list`内ハンドラが担う; A11y: `list`領域を`role="navigation"`、エディタ領域を`role="form"`、空状態は操作案内を`aria-live`.
- `DocsTemplate` (`templates/DocsTemplate.tsx`) — Props: `toc`, `content`, `onSearch`; State: 内部で検索クエリ(useState); 状態管理: `DocsPage`が文書配列を渡す; A11y: TOCは`nav`ランドマーク、検索は`search`ランドマーク、フォーカススキップリンクを先頭に配置.

**Pages**
- `LoanSimulatorPage` (`src/pages/LoanSimulatorPage.tsx`) — Props: none; State: `LoanFormContextProvider`でフォーム、`useLoanSimulation`で結果、`useToast`で通知; 状態管理: `useEffect`で入力変更時に計算をデバウンス呼び出し; A11y: 初期フォーカスを借入額フィールドへ、計算結果更新を`aria-live`まとめ.
- `PresetManagerPage` (`pages/PresetManagerPage.tsx`) — Props: none; State: `useLoanPresets`でプリセット配列・選択IDを管理、`useLoanFormContext`と同期; 状態管理: CRUD操作を`msw`モックと同期させ、結果をトースト表示; A11y: 保存完了を`role="status"`で告知、削除前に`confirm`ダイアログ（`dialog`要素）を使用.
- `DocsPage` (`pages/DocsPage.tsx`) — Props: none; State: `useState`で検索キーワード、`useMemo`でフィルタ済みセクション; 状態管理: データは静的Markdownを`vite-plugin-markdown`で取り込み; A11y: コンテンツは`<article>`、コード例は`<pre>`に`tabindex="0"`付与.

**共通状態・フック**
- `LoanFormContext` (`src/contexts/LoanFormContext.tsx`) — `state`: `LoanInput` + `validationErrors`; `dispatch`: `setField`, `reset`, `loadPreset`; バリデーションは`useReducer`ミドルウェアで同期; A11y: エラー配列をフィールド`aria-describedby`に供給.
- `useLoanSimulation` (`src/hooks/useLoanSimulation.ts`) — 入力をデバウンス、`loanCalculator`純関数で`summary`/`schedule`生成、`status`(`'idle'|'loading'|'ready'|'error'`)、`error`文字列; 結果は`useMemo`でキャッシュしグラフへ; A11y: エラーはフォーム外のトーストと`aria-live`エリアへ二重通知.
- `useLoanPresets` (`src/hooks/useLoanPresets.ts`) — `presets`, `selectedId`, CRUDメソッド; ローカルストレージ同期は`useEffect`; エラーハンドリングは`toast`経由; A11y: 操作失敗時に`role="alert"`.

**アクセシビリティ全般**
- フォーカスマネジメントはページ遷移時に`skip link`経由でメインへ移動、モーダル時は`focus trap`.
- 色コントラストはTailwindカラーパレットのAA基準値を採用、グラフは模様と併用し色覚多様性を考慮.
- すべてのダイナミック更新（計算結果、プリセット変更）は`aria-live`領域でアナウンスし、利用者が更新タイミングを把握できるようにする.

次のステップ: 1) Figmaワイヤーと本仕様を突き合わせてアトミック階層の漏れを確認 2) `src/components`配下に雛形ファイルを配置しStorybookまたはVitestでProps契約を検証
tokens used
11,690
**UI仕様**

**Atoms**
- `TextInput` (`src/components/atoms/TextInput.tsx`) — Props: `id`, `label`, `value`, `onChange`, `type?`, `placeholder?`, `inputMode?`, `helperText?`, `error?`; State: none; 状態管理: 完全制御コンポーネントとして`LoanFormContext`や親から値を受領; A11y: `label`と`id`を紐付け、`aria-invalid`/`aria-describedby`を自動付与しエラー文言は同期表示.
- `NumberInput` (`atoms/NumberInput.tsx`) — Props: `id`, `label`, `value`, `onChange`, `min?`, `max?`, `step?`, `suffix?`, `locale?`, `error?`; State: フォーマット中の内部`displayValue`(useState)で`blur`時に正規化; 状態管理: `LoanFormContext`へ数値で通知; A11y: `inputmode="decimal"`, `aria-valuemin/max`, JPYの場合は`aria-label`で通貨を明示.
- `Select` (`atoms/Select.tsx`) — Props: `id`, `label`, `value`, `options`, `onChange`, `placeholder?`, `error?`; State: none; 状態管理: 親から制御; A11y: `role="listbox"`/`aria-expanded`をHeadless UIで提供、キーボードナビゲーションと`aria-activedescendant`対応.
- `ToggleSwitch` (`atoms/ToggleSwitch.tsx`) — Props: `id`, `label`, `checked`, `onChange`, `helperText?`, `disabled?`; State: none; 状態管理: 親制御; A11y: `role="switch"`と`aria-checked`を付与し、スペース/Enterでトグル可能、隠しテキストで状態読み上げ.
- `Button` (`atoms/Button.tsx`) — Props: `variant`, `size`, `type`, `icon?`, `loading?`, `disabled?`, `ariaLabel?`; State: none; 状態管理: ハンドラは親から; A11y: ローディング時は`aria-busy`・スピナーに`role="status"`、アイコンのみは`aria-label`必須.
- `Card` (`atoms/Card.tsx`) — Props: `title?`, `subtitle?`, `children`, `elevation?`; State: none; 状態管理: レイアウト専用; A11y: `section`としてレンダリングし`aria-labelledby`を活用、見出しは`<h2>`等を受け入れる.

**Molecules**
- `FormField` (`components/molecules/FormField.tsx`) — Props: `label`, `htmlFor`, `helperText?`, `error?`, `children`; State: none; 状態管理: 子inputの状態を透過; A11y: `role="group"`で関連付け、エラー文は`aria-live="polite"`.
- `CurrencyField` (`molecules/CurrencyField.tsx`) — Props: `value`, `onChange`, `min`, `max`, `step`, `currency`; State: 内部`localizedValue`(useState)でフォーマット; 状態管理: 送信時に数値へ変換し`LoanFormContext`更新; A11y: `aria-label`で金額と通貨、桁区切り読み上げに`lang`設定.
- `InterestRateField` (`molecules/InterestRateField.tsx`) — Props: `value`, `onChange`, `min`, `max`, `step`; State: none; 状態管理: 直接コンテキスト更新; A11y: `%`サフィックスを`aria-describedby`で結合.
- `TermField` (`molecules/TermField.tsx`) — Props: `years`, `months?`, `onChange`; State: 内部で年/月スライダー値を保持し同期; 状態管理: フォームに複合オブジェクトで反映; A11y: スライダーには`aria-valuetext`で「N年」の読み上げ.
- `BonusRepaymentField` (`molecules/BonusRepaymentField.tsx`) — Props: `enabled`, `month`, `amount`, `onToggle`, `onChange`; State: トグル連動で子入力の活性状態を管理; 状態管理: `LoanFormContext`へ部分更新; A11y: 切替時に内包フォームを`aria-hidden`制御しフォーカスを先頭フィールドへ移動.

**Organisms**
- `LoanInputForm` (`components/organisms/LoanInputForm.tsx`) — Props: none (context依存); State: `LoanFormContext`から`state`/`dispatch`を取得し、フィールド単位で`dispatch({type, payload})`; 状態管理: `LoanFormContext`（`useReducer`）が全制御、バリデーションは`useEffect`で実行し`formErrors`を更新; A11y: フォームに`aria-describedby`で総合エラー、`submit`ボタンは`aria-disabled`設定、キーボードタブ順を視覚順に一致.
- `SimulationSummary` (`organisms/SimulationSummary.tsx`) — Props: `summary: LoanSummary | null`, `isLoading`, `currency`; State: none; 状態管理: `useLoanSimulation` hookの結果を受け取る; A11y: 数値カードを`<dl>`で構造化し、更新時は`aria-live="polite"`で読み上げ.
- `RepaymentScheduleTable` (`organisms/RepaymentScheduleTable.tsx`) — Props: `schedule: LoanScheduleEntry[]`, `isCollapsed`, `onToggle`; State: 内部`visibleRows`(useState)でページング; 状態管理: 表示件数はコンポーネント内部、データはhookから; A11y: `<table>`マークアップ、`scope="col"`と`aria-sort`、キーボード操作用に`button`で詳細開閉、視覚的行色分けはコントラスト比4.5:1確保.
- `RepaymentChart` (`organisms/RepaymentChart.tsx`) — Props: `schedule`, `summary`, `variant`('balance'|'interestShare'), `onVariantChange`; State: チャートライブラリ内部のみ; 状態管理: `useLoanSimulation`結果に対し`useMemo`でデータ変換; A11y: `role="img"`と`aria-labelledby`、データテーブルへフォールバック、Variant切替は`ToggleGroup`で提供.
- `PresetList` (`organisms/PresetList.tsx`) — Props: `presets`, `activeId?`, `onSelect`, `onDelete`, `onCreate`; State: 内部検索クエリ(useState)と`filteredPresets`(useMemo); 状態管理: 永続化は`useLoanPresets` hook（localStorage + `useReducer`）; A11y: リストは`<ul>`、各アイテムに`aria-selected`、削除ボタンは`aria-label`でプリセット名を含め、検索はラベル付き.

**Templates**
- `LoanSimulatorTemplate` (`components/templates/LoanSimulatorTemplate.tsx`) — Props: `form`, `summary`, `chart`, `schedule`, `toast`; State: none; 状態管理: 子Organismを受け取りレイアウト構築、レスポンシブで`CSS Grid`; A11y: 主ランドマークを`<main>`、フォーム領域を`<aside>`としてスクリーンリーダー順序を制御.
- `PresetManagerTemplate` (`templates/PresetManagerTemplate.tsx`) — Props: `list`, `editor`, `emptyState`; State: none; 状態管理: 選択状態は`list`内ハンドラが担う; A11y: `list`領域を`role="navigation"`、エディタ領域を`role="form"`、空状態は操作案内を`aria-live`.
- `DocsTemplate` (`templates/DocsTemplate.tsx`) — Props: `toc`, `content`, `onSearch`; State: 内部で検索クエリ(useState); 状態管理: `DocsPage`が文書配列を渡す; A11y: TOCは`nav`ランドマーク、検索は`search`ランドマーク、フォーカススキップリンクを先頭に配置.

**Pages**
- `LoanSimulatorPage` (`src/pages/LoanSimulatorPage.tsx`) — Props: none; State: `LoanFormContextProvider`でフォーム、`useLoanSimulation`で結果、`useToast`で通知; 状態管理: `useEffect`で入力変更時に計算をデバウンス呼び出し; A11y: 初期フォーカスを借入額フィールドへ、計算結果更新を`aria-live`まとめ.
- `PresetManagerPage` (`pages/PresetManagerPage.tsx`) — Props: none; State: `useLoanPresets`でプリセット配列・選択IDを管理、`useLoanFormContext`と同期; 状態管理: CRUD操作を`msw`モックと同期させ、結果をトースト表示; A11y: 保存完了を`role="status"`で告知、削除前に`confirm`ダイアログ（`dialog`要素）を使用.
- `DocsPage` (`pages/DocsPage.tsx`) — Props: none; State: `useState`で検索キーワード、`useMemo`でフィルタ済みセクション; 状態管理: データは静的Markdownを`vite-plugin-markdown`で取り込み; A11y: コンテンツは`<article>`、コード例は`<pre>`に`tabindex="0"`付与.

**共通状態・フック**
- `LoanFormContext` (`src/contexts/LoanFormContext.tsx`) — `state`: `LoanInput` + `validationErrors`; `dispatch`: `setField`, `reset`, `loadPreset`; バリデーションは`useReducer`ミドルウェアで同期; A11y: エラー配列をフィールド`aria-describedby`に供給.
- `useLoanSimulation` (`src/hooks/useLoanSimulation.ts`) — 入力をデバウンス、`loanCalculator`純関数で`summary`/`schedule`生成、`status`(`'idle'|'loading'|'ready'|'error'`)、`error`文字列; 結果は`useMemo`でキャッシュしグラフへ; A11y: エラーはフォーム外のトーストと`aria-live`エリアへ二重通知.
- `useLoanPresets` (`src/hooks/useLoanPresets.ts`) — `presets`, `selectedId`, CRUDメソッド; ローカルストレージ同期は`useEffect`; エラーハンドリングは`toast`経由; A11y: 操作失敗時に`role="alert"`.

**アクセシビリティ全般**
- フォーカスマネジメントはページ遷移時に`skip link`経由でメインへ移動、モーダル時は`focus trap`.
- 色コントラストはTailwindカラーパレットのAA基準値を採用、グラフは模様と併用し色覚多様性を考慮.
- すべてのダイナミック更新（計算結果、プリセット変更）は`aria-live`領域でアナウンスし、利用者が更新タイミングを把握できるようにする.

次のステップ: 1) Figmaワイヤーと本仕様を突き合わせてアトミック階層の漏れを確認 2) `src/components`配下に雛形ファイルを配置しStorybookまたはVitestでProps契約を検証
