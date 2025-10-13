# サブエージェント活用ガイド

**作成日**: 2025-10-13
**目的**: Claude Codeのサブエージェント機能を効果的に活用し、開発を加速

---

## 📋 目次

1. [サブエージェントとは](#1-サブエージェントとは)
2. [いつ使うべきか](#2-いつ使うべきか)
3. [並列実行戦略](#3-並列実行戦略)
4. [依頼テンプレート](#4-依頼テンプレート)
5. [Phase 0での活用例](#5-phase-0での活用例)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. サブエージェントとは

### 1.1 概要
Claude Codeの**Task tool**を使用して、独立したサブエージェントを起動できます。
サブエージェントは、特定のタスクを自律的に実行し、完了後に結果を返します。

### 1.2 メリット
- **並列実行**: 複数のタスクを同時に進行
- **専門特化**: 各エージェントがタスクに集中
- **開発加速**: 理想的には30-50%の時間短縮

### 1.3 制約
- **ステートレス**: 各エージェントは独立（他のエージェントと通信不可）
- **ファイル競合**: 同じファイルを複数エージェントが編集すると競合
- **コンテキスト制限**: 大規模ファイルは苦手

---

## 2. いつ使うべきか

### 2.1 ✅ サブエージェントに適したタスク

**独立したコンポーネント実装**:
```
✅ ISSUE-002: ErrorBoundaryコンポーネント作成
   - 新規ファイル: src/components/ErrorBoundary.tsx
   - 依存: なし
   - 並列実行可能

✅ ISSUE-003: Toastコンポーネント + Context
   - 新規ファイル: src/components/Toast.tsx, src/contexts/ToastContext.tsx
   - 依存: なし
   - 並列実行可能
```

**ユーティリティ関数**:
```
✅ 教育費計算ロジック実装
   - ファイル: src/utils/educationCostCalculator.ts
   - テスト: tests/unit/educationCost.test.ts
   - 依存: なし
```

**テストコード作成**:
```
✅ 既存コンポーネントのテスト追加
   - ファイル: tests/unit/LoanForm.test.tsx
   - 依存: 既存コンポーネント（読み取りのみ）
```

**ドキュメント作成**:
```
✅ API仕様書作成
   - ファイル: docs/API_SPEC.md
   - 依存: なし
```

### 2.2 ❌ サブエージェントに適さないタスク

**アーキテクチャ設計**:
```
❌ 全体的なデータフロー設計
   - 理由: 複数ファイルにまたがる、意思決定が必要
```

**統合作業**:
```
❌ 複数コンポーネントの連携実装
   - 理由: ファイル競合のリスク、全体像の理解が必要
```

**重要な意思決定**:
```
❌ 技術スタック選定
   - 理由: プロジェクト全体への影響、トレードオフの検討が必要
```

**既存コードの大規模リファクタリング**:
```
❌ 全コンポーネントのTypeScript移行
   - 理由: ファイル競合、破壊的変更のリスク
```

---

## 3. 並列実行戦略

### 3.1 Phase 0での並列実行例

**シナリオ**: ISSUE-002, 003, 005を同時実行

```typescript
// 単一メッセージで3つのTask toolを呼び出し

Task 1 (ISSUE-002): ErrorBoundary実装
├─ ファイル: src/components/ErrorBoundary.tsx
├─ 編集: src/App.tsx
└─ 依存: なし

Task 2 (ISSUE-003): Toast実装
├─ ファイル: src/components/Toast.tsx
├─ ファイル: src/contexts/ToastContext.tsx
├─ 編集: src/App.tsx
└─ 依存: なし

Task 3 (ISSUE-005): Google Analytics
├─ ファイル: src/lib/analytics.ts
├─ 編集: src/App.tsx
└─ 依存: なし
```

**⚠️ 注意**: `src/App.tsx`が競合する可能性あり

**解決策**:
1. **順序制御**: Task 1完了 → Task 2開始 → Task 3開始
2. **ファイル分離**: App.tsxの編集は最後にまとめて手動で実施
3. **モック使用**: 各エージェントは独自のApp.tsx編集案を提示、後で統合

### 3.2 ファイル競合を避ける方法

**方法1: ファイルを完全に分離**
```
Agent 1: src/components/A.tsx
Agent 2: src/components/B.tsx
Agent 3: src/components/C.tsx
→ 競合なし ✅
```

**方法2: 時系列で実行**
```
Agent 1実行 → 完了 → Agent 2実行 → 完了 → Agent 3実行
→ 競合なし ✅（並列性は失われる）
```

**方法3: 統合作業を後回し**
```
Agent 1, 2, 3: 独立したコンポーネント作成
メイン開発者: App.tsxで統合
→ 効率的 ✅
```

---

## 4. 依頼テンプレート

### 4.1 基本テンプレート

```markdown
あなたはReact + TypeScriptの専門家です。
以下のタスクを実装してください。

【タスク】
{ISSUE番号}: {タスク名}

【目的】
{このタスクの目的を1-2文で}

【要件】
- {要件1}
- {要件2}
- {要件3}

【制約】
- TypeScript strictモード準拠
- ESLint警告ゼロ
- Tailwind CSSでスタイリング（必要な場合）
- レスポンシブ対応
- テストカバレッジ80%以上（該当する場合）

【ファイル】
- 作成: {新規ファイルのパス}
- 編集: {既存ファイルのパス}

【完了条件】
- [ ] 機能が正常に動作する
- [ ] テストがパスする（該当する場合）
- [ ] 型エラーがない
- [ ] ESLint警告がない
- [ ] レスポンシブ対応（UI系の場合）

【参考】
- 既存コード: {参考にするファイルパス}
- 技術スタック: React 18, TypeScript 5, Tailwind CSS 3
- 設計パターン: {Context API, hooks等}

【最終成果物】
実装コードとテストコード（該当する場合）を提供してください。
エラーが発生した場合は、docs/TROUBLESHOOTING.mdに追記してください。
```

### 4.2 コンポーネント実装用

```markdown
あなたはReact + TypeScriptの専門家です。
ISSUE-002「ErrorBoundaryコンポーネント実装」を実装してください。

【目的】
予期しないエラーを捕捉し、ユーザーに適切なUIを表示する。

【要件】
- React.Componentを継承したクラスコンポーネント
- getDerivedStateFromError, componentDidCatchを実装
- エラー発生時に専用UIを表示
- 「再読み込み」「トップに戻る」ボタンを提供
- エラー詳細を開閉可能に（開発者向け）

【制約】
- TypeScript strictモード準拠
- Tailwind CSSでスタイリング
- レスポンシブ対応
- ESLint警告ゼロ

【ファイル】
- 作成: src/components/ErrorBoundary.tsx
- 編集: src/App.tsx（ErrorBoundaryでラップ）

【完了条件】
- [ ] エラー発生時に専用UIが表示される
- [ ] 「再読み込み」ボタンが動作する
- [ ] 「トップに戻る」ボタンが動作する
- [ ] エラー詳細が表示される（折りたたみ）
- [ ] 型エラーがない
- [ ] スマホでも見やすい

【参考】
- 既存スタイル: src/components/Layout/Header.tsx
- Tailwindクラス: bg-white, shadow-lg, rounded-lg, p-8

【テスト方法】
一時的に以下を追加してエラーを発生させる:
```typescript
// src/pages/Home.tsx
throw new Error('Test error');
```

【最終成果物】
- src/components/ErrorBoundary.tsx
- src/App.tsxの編集内容
```

### 4.3 ユーティリティ関数実装用

```markdown
あなたはJavaScript/TypeScriptの専門家です。
教育費計算ロジックを実装してください。

【タスク】
ISSUE-151: 教育費計算アルゴリズム実装

【要件】
- 子供の年齢から大学卒業までの教育費を計算
- 公立/私立の選択に対応
- 幼稚園、小学校、中学校、高校、大学の各段階で計算
- 年ごとの費用を配列で返す

【入力】
```typescript
interface EducationCostInput {
  childAge: number;
  schoolType: 'public' | 'private';
  universityType: 'none' | 'public' | 'private-liberal' | 'private-science';
}
```

【出力】
```typescript
interface EducationCostOutput {
  year: number;
  cost: number; // 万円単位
}[]
```

【費用データ（文部科学省調査より）】
- 幼稚園（公立）: 23万円/年
- 幼稚園（私立）: 53万円/年
- 小学校（公立）: 33万円/年
- 小学校（私立）: 160万円/年
- 中学校（公立）: 50万円/年
- 中学校（私立）: 140万円/年
- 高校（公立）: 47万円/年
- 高校（私立）: 103万円/年
- 大学（公立）: 135万円/年
- 大学（私立・文系）: 185万円/年
- 大学（私立・理系）: 208万円/年

【ファイル】
- 作成: src/utils/educationCostCalculator.ts
- 作成: tests/unit/educationCost.test.ts

【テストケース】
```typescript
// 3歳、公立、大学なし
expect(calculateEducationCost(3, 'public', 'none')).toEqual([
  { year: 2025, cost: 23 }, // 幼稚園
  // ...
]);

// 6歳、私立、私立大学（文系）
expect(calculateEducationCost(6, 'private', 'private-liberal')).toEqual([
  { year: 2025, cost: 160 }, // 小学校
  // ...
]);
```

【完了条件】
- [ ] 全テストケースがパス
- [ ] 型エラーがない
- [ ] JSDocコメント付き
- [ ] エッジケース対応（0歳、23歳等）

【最終成果物】
- src/utils/educationCostCalculator.ts
- tests/unit/educationCost.test.ts
```

---

## 5. Phase 0での活用例

### 5.1 並列実行プラン

**Day 1: デプロイ + 並列開発**
```
メイン開発者:
├─ ISSUE-001: Vercelデプロイ
└─ ISSUE-004: プライバシーポリシー作成

Agent 1:
└─ ISSUE-002: ErrorBoundary実装

Agent 2:
└─ ISSUE-003: Toast実装

Agent 3:
└─ ISSUE-005: Google Analytics設定
```

**効果**: 1日で5タスク完了（通常3日 → 1日）

### 5.2 実行手順

#### Step 1: サブエージェント起動（並列）
```
単一メッセージで3つのTask toolを同時呼び出し:

Task 1: ISSUE-002実装
Task 2: ISSUE-003実装
Task 3: ISSUE-005実装
```

#### Step 2: 結果の確認
各エージェントが完了すると、実装コードが返される。

#### Step 3: 統合作業
```bash
# 1. 各エージェントの成果物を確認
# 2. App.tsxの競合を解決（手動マージ）
# 3. ビルド確認
npm run build

# 4. テスト実行
npm run test -- --run

# 5. 動作確認
npm run dev
```

#### Step 4: コミット
```bash
git add .
git commit -m "feat(phase-0): Implement error handling and toast system

- Add ErrorBoundary component for error catching
- Add Toast system for user feedback
- Add Google Analytics tracking
- Update App.tsx to integrate all features

ISSUE-002, ISSUE-003, ISSUE-005 completed"

git push origin main
```

---

## 6. トラブルシューティング

### 6.1 ファイル競合が発生した場合

**症状**: 同じファイルを複数エージェントが編集し、内容が食い違う

**解決策**:
```bash
# 1. 各エージェントの編集内容を確認
# 2. 手動でマージ
# 3. 以下のコマンドで確認

# 型チェック
npm run type-check

# Lint
npm run lint

# ビルド
npm run build
```

### 6.2 テストが失敗した場合

**症状**: エージェントが作成したテストが失敗する

**解決策**:
```bash
# 1. エラーメッセージを確認
npm run test -- --run

# 2. テストを修正
# 3. 再実行
npm run test -- --run

# 4. TROUBLESHOOTING.mdに追記
```

### 6.3 サブエージェントが停止した場合

**症状**: エージェントが途中で停止し、完了しない

**原因**:
- タイムアウト
- コンテキストサイズ超過
- 複雑すぎるタスク

**解決策**:
1. タスクをさらに小さく分割
2. 依頼内容を簡潔にする
3. 参考ファイルを減らす

### 6.4 型エラーが残る場合

**症状**: エージェントの成果物に型エラーがある

**解決策**:
```bash
# 1. 型エラーを確認
npm run type-check

# 2. 該当箇所を修正
# 例: any型を適切な型に変更

# 3. 再確認
npm run type-check
```

---

## 7. ベストプラクティス

### 7.1 依頼前の準備

**チェックリスト**:
- [ ] タスクが独立している（他のタスクに依存しない）
- [ ] ファイルが競合しない（他のエージェントと異なる）
- [ ] 要件が明確（曖昧な表現がない）
- [ ] 完了条件が定義されている

### 7.2 依頼内容の明確化

**❌ 悪い例**:
```
Toastを作って
```

**✅ 良い例**:
```
ISSUE-003「Toastコンポーネント実装」を実装してください。

【要件】
- 3種類のタイプ（success, error, info）
- 3秒後に自動で消える
- スライドインアニメーション
- 「×」ボタンで手動で閉じられる

【ファイル】
- src/components/Toast.tsx
- src/contexts/ToastContext.tsx

【完了条件】
- [ ] 3種類のタイプが動作する
- [ ] 自動で消える
- [ ] アニメーションが動作する
```

### 7.3 結果の検証

**エージェント完了後に必ず実施**:
```bash
# 1. 型チェック
npm run type-check

# 2. Lint
npm run lint

# 3. ビルド
npm run build

# 4. テスト
npm run test -- --run

# 5. 動作確認
npm run dev
```

---

## 8. Phase 1以降での応用

### 8.1 Phase 1での並列実行例

**Week 5-6: 顧客管理機能**
```
Agent 1 (ISSUE-121): 顧客CRUD API
├─ ファイル: src/services/customerService.ts
├─ ファイル: src/hooks/useCustomers.ts
└─ 依存: Supabase設定（事前完了）

Agent 2 (ISSUE-122): 顧客一覧UI
├─ ファイル: src/pages/Customers.tsx
├─ ファイル: src/components/CustomerList.tsx
└─ 依存: なし（モックデータ使用）

Agent 3 (ISSUE-123): 検索機能
├─ ファイル: src/hooks/useCustomerSearch.ts
├─ ファイル: src/components/SearchBar.tsx
└─ 依存: なし
```

**効果**: 3日 → 1日に短縮

### 8.2 Phase 2での並列実行例

**Month 1: AIヒアリング機能**
```
Agent 1 (ISSUE-201): Gemini API統合
├─ ファイル: src/lib/gemini.ts
└─ 依存: なし

Agent 2 (ISSUE-202): チャットUI
├─ ファイル: src/components/Chat/ChatWindow.tsx
├─ ファイル: src/components/Chat/MessageBubble.tsx
└─ 依存: なし（モックAPI）

Agent 3 (ISSUE-203): 会話履歴管理
├─ ファイル: src/hooks/useChatHistory.ts
└─ 依存: なし
```

---

## 付録: よくある質問

### Q1: サブエージェントは何個まで同時実行できる?
**A**: 理論上は制限なしですが、実用的には3-5個が推奨。多すぎると統合が複雑になります。

### Q2: サブエージェント間でデータを共有できる?
**A**: できません。各エージェントは独立しています。共有が必要な場合は、メイン開発者が統合作業を行います。

### Q3: サブエージェントが失敗した場合は?
**A**: エラーメッセージを確認し、タスクを小さく分割するか、メイン開発者が手動で実装します。

### Q4: 既存コードのリファクタリングは可能?
**A**: 可能ですが、小規模な変更に限ります。大規模リファクタリングはメイン開発者が行うべきです。

---

**最終更新**: 2025-10-13
**次のステップ**: Phase 0 ISSUE-002, 003, 005をサブエージェントで並列実行
