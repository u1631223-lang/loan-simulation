# 🎫 TICKETS: 年収ベースMAX借入額計算機能

**Phase**: 9.8（無料版機能拡張）
**Priority**: 🟡 High
**Total Estimate**: 約5時間（10チケット）

---

## 📋 チケット一覧

### TICKET-980: 型定義作成
**Priority**: 🔴 Critical
**Estimate**: 20分
**Status**: ⬜ TODO

**Description**:
年収ベース計算用の型定義を作成

**Tasks**:
- [ ] `src/types/income.ts` 作成
- [ ] `IncomeParams` 型定義
  - `primaryIncome: number` (本人年収、万円)
  - `interestRate: number` (金利、%)
  - `years: number` (返済期間、年)
  - `hasCoDebtor: boolean` (連帯債務者/保証人の有無)
  - `coDebtorType?: 'joint-debtor' | 'guarantor'` (連帯債務者 or 保証人)
  - `coDebtorIncome?: number` (相手の年収、万円)
- [ ] `IncomeResult` 型定義
  - `maxBorrowableAmount: number` (借入可能額、円)
  - `monthlyPayment: number` (月々返済額、円)
  - `repaymentRatio: number` (返済負担率、0.30 or 0.35)
  - `totalIncome: number` (合算年収、万円)
  - `annualRepayment: number` (年間返済額、円)

**Acceptance Criteria**:
- TypeScript strict mode でエラーなし
- 全フィールドにJSDocコメント付き

---

### TICKET-981: 計算ロジック実装
**Priority**: 🔴 Critical
**Estimate**: 40分
**Status**: ⬜ TODO
**Dependencies**: TICKET-980

**Description**:
年収から借入可能額を計算するロジックを実装

**Tasks**:
- [ ] `src/utils/incomeCalculator.ts` 作成
- [ ] `calculateMaxBorrowable()` 関数実装
  - Step 1: 合算年収計算（連帯債務者100%、保証人50%）
  - Step 2: 返済負担率決定（400万円未満30%、以上35%）
  - Step 3: 月々返済可能額算出
  - Step 4: `calculateReverse()` を使って借入可能額逆算
- [ ] エラーハンドリング（年収0円、金利マイナスなど）
- [ ] JSDocコメント追加

**Calculation Logic**:
```typescript
// 1. 合算年収
let totalIncome = primaryIncome;
if (hasCoDebtor) {
  totalIncome += coDebtorType === 'joint-debtor'
    ? coDebtorIncome
    : coDebtorIncome * 0.5;
}

// 2. 返済負担率
const ratio = totalIncome < 400 ? 0.30 : 0.35;

// 3. 月々返済可能額
const monthlyPayment = (totalIncome * 10000 * ratio) / 12;

// 4. 借入可能額（逆算）
const result = calculateReverse({
  monthlyPayment,
  interestRate,
  years,
  months: 0,
  repaymentType: 'equal-payment',
  bonusPayment: { enabled: false }
});
```

**Acceptance Criteria**:
- 既存の `calculateReverse` を正しく使用
- 4つのテストケースがすべてパス（次チケットで作成）

---

### TICKET-982: ユニットテスト作成
**Priority**: 🔴 Critical
**Estimate**: 30分
**Status**: ⬜ TODO
**Dependencies**: TICKET-981

**Description**:
`incomeCalculator.ts` のユニットテストを作成

**Tasks**:
- [ ] `tests/unit/incomeCalculator.test.ts` 作成
- [ ] Test Case 1: 基本計算（単独、年収500万円）
- [ ] Test Case 2: 年収400万円未満（返済負担率30%）
- [ ] Test Case 3: 連帯債務者（100%合算）
- [ ] Test Case 4: 連帯保証人（50%合算）
- [ ] エッジケース: 年収0円、金利0%など

**Test Cases**:
```typescript
describe('年収ベース借入可能額計算', () => {
  test('Case 1: 年収500万円、単独', () => {
    const result = calculateMaxBorrowable({
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false
    });
    expect(result.repaymentRatio).toBe(0.35);
    expect(result.maxBorrowableAmount).toBeCloseTo(51000000, -5);
  });

  test('Case 2: 年収350万円（30%）', () => {
    const result = calculateMaxBorrowable({
      primaryIncome: 350,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false
    });
    expect(result.repaymentRatio).toBe(0.30);
    expect(result.maxBorrowableAmount).toBeCloseTo(30600000, -5);
  });

  test('Case 3: 連帯債務者（100%合算）', () => {
    const result = calculateMaxBorrowable({
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: true,
      coDebtorType: 'joint-debtor',
      coDebtorIncome: 400
    });
    expect(result.totalIncome).toBe(900);
    expect(result.maxBorrowableAmount).toBeCloseTo(91800000, -5);
  });

  test('Case 4: 連帯保証人（50%合算）', () => {
    const result = calculateMaxBorrowable({
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: true,
      coDebtorType: 'guarantor',
      coDebtorIncome: 600
    });
    expect(result.totalIncome).toBe(800);
    expect(result.maxBorrowableAmount).toBeCloseTo(81600000, -5);
  });
});
```

**Acceptance Criteria**:
- すべてのテストがパス
- カバレッジ90%以上

---

### TICKET-983: IncomeFormコンポーネント実装（基本入力）
**Priority**: 🔴 Critical
**Estimate**: 45分
**Status**: ⬜ TODO
**Dependencies**: TICKET-980

**Description**:
年収入力フォームの基本部分を実装

**Tasks**:
- [ ] `src/components/Input/IncomeForm.tsx` 作成
- [ ] 本人年収入力（万円単位、▲▼ボタン）
  - デフォルト: 500万円
  - 増減: 10万円ずつ
  - 範囲: 100〜3000万円
- [ ] 金利入力（%、▲▼ボタン）
  - デフォルト: 1.0%
  - 増減: 0.01%ずつ
  - 範囲: 0.1〜5.0%
- [ ] 返済期間入力（年、▲▼ボタン）
  - デフォルト: 35年
  - 増減: 1年ずつ
  - 範囲: 5〜50年
- [ ] 「計算する」ボタン
- [ ] レスポンシブデザイン（Tailwind CSS）

**UI Reference**:
- `src/components/Input/ReverseLoanForm.tsx` を参考
- 同じスタイル・レイアウトパターンを使用

**Acceptance Criteria**:
- ▲▼ボタンで正しく増減
- 範囲外の値は入力不可
- PC/タブレット/スマホで正しく表示

---

### TICKET-984: IncomeFormコンポーネント実装（連帯債務者/保証人）
**Priority**: 🟡 High
**Estimate**: 40分
**Status**: ⬜ TODO
**Dependencies**: TICKET-983

**Description**:
連帯債務者・連帯保証人入力機能を追加

**Tasks**:
- [ ] チェックボックス「連帯債務者または連帯保証人がいる」
- [ ] ラジオボタン（チェック時に表示）
  - ⚪ 連帯債務者（年収を100%合算）
  - ⚪ 連帯保証人（年収を50%合算）
- [ ] 相手の年収入力（万円単位、▲▼ボタン）
  - デフォルト: 400万円
  - 増減: 10万円ずつ
  - 範囲: 100〜3000万円
- [ ] 表示/非表示の切り替えアニメーション
- [ ] 説明テキスト追加

**UI Layout**:
```tsx
<div className="mt-4">
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={hasCoDebtor} ... />
    <span>連帯債務者または連帯保証人がいる</span>
  </label>

  {hasCoDebtor && (
    <div className="mt-4 pl-6 border-l-2 border-blue-300">
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="radio" value="joint-debtor" ... />
          <span>連帯債務者（年収を100%合算）</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="guarantor" ... />
          <span>連帯保証人（年収を50%合算）</span>
        </label>
      </div>

      <div className="mt-4">
        <label>相手の年収</label>
        <input ... />
      </div>
    </div>
  )}
</div>
```

**Acceptance Criteria**:
- チェックON/OFFで正しく表示切替
- ラジオボタン選択が正しく動作
- 説明文が分かりやすい

---

### TICKET-985: 結果表示コンポーネント実装
**Priority**: 🔴 Critical
**Estimate**: 35分
**Status**: ⬜ TODO
**Dependencies**: TICKET-981, TICKET-983

**Description**:
計算結果の表示部分を実装

**Tasks**:
- [ ] `IncomeForm.tsx` 内に結果表示セクション追加
- [ ] 借入可能額表示（大きく目立つように）
- [ ] 返済負担率表示（30% or 35%）
- [ ] 月々返済額表示
- [ ] 注意事項表示
- [ ] 「詳しい返済計画を立てる」ボタン
  - クリックで「借入額から計算」タブへ遷移
  - 計算結果を引き継ぎ（借入金額をプリセット）

**UI Design**:
```tsx
<div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
  <h3 className="text-xl font-bold mb-4">📊 計算結果</h3>

  {/* 借入可能額 - 目立つように */}
  <div className="bg-white p-6 rounded-lg shadow-md mb-4">
    <div className="text-sm text-gray-600 mb-1">
      ✅ あなたの借入可能額（最大）
    </div>
    <div className="text-4xl font-bold text-blue-600">
      {formatCurrency(result.maxBorrowableAmount)}
    </div>
  </div>

  {/* 詳細情報 */}
  <div className="space-y-3">
    <div>
      <span className="text-gray-700">💡 返済負担率:</span>
      <span className="font-bold ml-2">{result.repaymentRatio * 100}%</span>
      <span className="text-sm text-gray-500 ml-2">
        （年収{result.totalIncome}万円{result.repaymentRatio === 0.35 ? '以上' : '未満'}のため）
      </span>
    </div>
    <div>
      <span className="text-gray-700">📌 月々の返済額:</span>
      <span className="font-bold ml-2">
        約 {formatCurrency(result.monthlyPayment)}
      </span>
    </div>
  </div>

  {/* 注意事項 */}
  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
    <h4 className="font-bold text-yellow-800 mb-2">⚠️ 注意事項</h4>
    <ul className="text-sm text-yellow-900 space-y-1">
      <li>• この金額は理論上の最大値です。</li>
      <li>• 実際の借入額は、他の借入状況や審査基準により異なります。</li>
      <li>• 一般的には年収の5〜6倍程度が安全な借入額の目安とされています。</li>
    </ul>
  </div>

  {/* CTA */}
  <button
    className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg"
    onClick={handleDetailPlan}
  >
    💰 詳しい返済計画を立てる
  </button>
</div>
```

**Acceptance Criteria**:
- 金額が見やすく表示される
- 注意事項が適切に配置
- CTAボタンが目立つ

---

### TICKET-986: Home.tsx タブ統合
**Priority**: 🔴 Critical
**Estimate**: 30分
**Status**: ⬜ TODO
**Dependencies**: TICKET-985

**Description**:
Homeページに「年収から計算」タブを追加

**Tasks**:
- [ ] `src/pages/Home.tsx` 修正
- [ ] `ViewMode` 型に `'income'` を追加
  - `'loan' | 'reverse' | 'calculator' | 'income'`
- [ ] タブボタンに「年収から計算」追加
- [ ] `IncomeForm` コンポーネントをインポート
- [ ] 条件分岐で表示切替
- [ ] タブ間の状態引き継ぎ（年収計算 → 借入額計算）

**Tab Layout**:
```tsx
<div className="flex gap-2 mb-6">
  <button
    className={viewMode === 'loan' ? 'active' : ''}
    onClick={() => setViewMode('loan')}
  >
    借入額から計算
  </button>
  <button
    className={viewMode === 'reverse' ? 'active' : ''}
    onClick={() => setViewMode('reverse')}
  >
    返済額から計算
  </button>
  <button
    className={viewMode === 'income' ? 'active' : ''}
    onClick={() => setViewMode('income')}
  >
    💰 年収から計算  {/* アイコンで目立たせる */}
  </button>
  <button
    className={viewMode === 'calculator' ? 'active' : ''}
    onClick={() => setViewMode('calculator')}
  >
    電卓
  </button>
</div>

{viewMode === 'income' && <IncomeForm />}
```

**State Transfer Logic**:
```tsx
// IncomeForm から LoanForm へ遷移時
const handleDetailPlan = () => {
  setLoanParams({
    principal: incomeResult.maxBorrowableAmount,
    interestRate: incomeParams.interestRate,
    years: incomeParams.years,
    // ...
  });
  setViewMode('loan'); // タブ切替
};
```

**Acceptance Criteria**:
- タブ切替がスムーズ
- 計算結果が次のタブに引き継がれる
- レスポンシブ対応（タブが折り返し可能）

---

### TICKET-987: レスポンシブ対応
**Priority**: 🟡 High
**Estimate**: 20分
**Status**: ⬜ TODO
**Dependencies**: TICKET-986

**Description**:
スマホ・タブレット表示の最適化

**Tasks**:
- [ ] タブボタンのレスポンシブ調整
  - PC: 横並び
  - スマホ: 2行に折り返し or スクロール可能
- [ ] フォーム入力欄のサイズ調整
- [ ] 結果表示の文字サイズ調整
- [ ] ▲▼ボタンのタップエリア確保（44x44px以上）
- [ ] 各デバイスで動作確認

**Breakpoints**:
- `sm`: 640px（スマホ横）
- `md`: 768px（タブレット）
- `lg`: 1024px（PC）

**Acceptance Criteria**:
- iPhone SE（375px）で正しく表示
- iPad（768px）で正しく表示
- PC（1024px以上）で正しく表示
- タッチ操作がしやすい

---

### TICKET-988: ドキュメント更新
**Priority**: 🟢 Medium
**Estimate**: 15分
**Status**: ⬜ TODO
**Dependencies**: TICKET-987

**Description**:
関連ドキュメントを更新

**Tasks**:
- [ ] `docs/DEVELOPMENT_PLAN.md` に Phase 9.8 追加
- [ ] `docs/TICKETS_SUMMARY.md` 更新
- [ ] `docs/requirements.md` に機能追加
- [ ] `CLAUDE.md` の「Current Implementation Status」更新
- [ ] `README.md` の機能一覧更新

**Update Example**:
```markdown
## Phase 9.8: 年収ベースMAX借入額計算（無料版機能拡張）✅

- TICKET-980 to TICKET-989: 年収から借入可能額を計算
- アンカリング効果を活用したマーケティング戦略
- 連帯債務者・連帯保証人対応
```

**Acceptance Criteria**:
- すべてのドキュメントが最新状態
- 他の開発者が理解できる内容

---

### TICKET-989: 手動テスト実施
**Priority**: 🟡 High
**Estimate**: 25分
**Status**: ⬜ TODO
**Dependencies**: TICKET-987

**Description**:
機能の手動テスト実施

**Test Scenarios**:

1. **基本操作テスト**
   - [ ] 年収500万円、金利1.0%、35年で計算
   - [ ] 結果が正しく表示されるか
   - [ ] ▲▼ボタンで値が増減するか

2. **連帯債務者テスト**
   - [ ] チェックボックスONで入力欄表示
   - [ ] 連帯債務者選択で100%合算
   - [ ] 結果が正しいか

3. **連帯保証人テスト**
   - [ ] 連帯保証人選択で50%合算
   - [ ] 結果が正しいか

4. **タブ遷移テスト**
   - [ ] 「詳しい返済計画」ボタンで遷移
   - [ ] 借入金額が引き継がれるか

5. **エッジケーステスト**
   - [ ] 年収100万円（最小値）
   - [ ] 年収3000万円（最大値）
   - [ ] 金利0.1%（最小値）
   - [ ] 返済期間5年（最小値）

6. **レスポンシブテスト**
   - [ ] iPhone SE（375px）
   - [ ] iPad（768px）
   - [ ] PC（1920px）

**Acceptance Criteria**:
- すべてのテストシナリオがパス
- バグが見つかった場合は修正

---

## 📊 進捗管理

### ステータス
- ⬜ TODO: 未着手
- 🔄 IN PROGRESS: 作業中
- ✅ DONE: 完了

### 見積時間
- **Total**: 約5時間
- **Critical Path**: TICKET-980 → 981 → 982 → 983 → 984 → 985 → 986 → 987 → 989

---

## 🎯 成功指標

1. **機能完成度**:
   - すべてのユニットテストがパス
   - 手動テストシナリオがすべてパス

2. **UX品質**:
   - タブ切替がスムーズ
   - 計算結果が見やすい
   - 注意事項が適切に配置

3. **コード品質**:
   - TypeScript strict mode でエラーなし
   - ESLint警告なし
   - 既存コードとの一貫性

4. **マーケティング効果**:
   - アンカリング効果の演出ができている
   - CTAが自然に配置されている
   - ユーザーが次のアクションを取りやすい

---

**作成日**: 2025-10-27
**Phase**: 9.8（無料版機能拡張）
**Total Tickets**: 10
**Total Estimate**: 約5時間
