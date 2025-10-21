# NISA複利計算ツール - 機能仕様書

## 📋 概要

### 目的
住宅ローン無料版に**NISA複利計算ツール**を追加し、「繰上返済 vs NISA運用」の比較を視覚的に提示することで、有料版への自然な導線を作る。

### ビジネス戦略
- **無料版**: シンプルな複利計算で「複利の力」をアピール
- **有料版への誘導**: 繰上返済との詳細比較・PDF出力は有料版の特典に
- **ターゲット**: 独立系FP、住宅営業担当者、IFA

### 背景
住宅業界の大手メーカーでは、建物のLCC（ライフサイクルコスト）が低いことをアピールし、その差額を繰上返済ではなくNISA投資に回すことで将来の安心感を謳うのが常套手段。この手法を中小FPや住宅営業でも使えるようにする。

---

## 🎯 機能要件

### 入力項目（シンプル設計）

| 項目 | 形式 | デフォルト値 | 制約 | 備考 |
|------|------|-------------|------|------|
| 月々の積立額 | 万円単位 | 3万円 | 0.1〜100万円 | ↑↓ボタンで1万円ずつ調整 |
| 想定利回り | 年利% | 5.0% | 0.0〜20.0% | ↑↓ボタンで0.1%ずつ調整 |
| 積立期間 | 年 | 20年 | 1〜50年 | ↑↓ボタンで1年ずつ調整 |
| 初期投資額 | 万円単位 | 0円 | 0〜1億円 | オプション項目（折りたたみ可） |

### 出力項目

#### サマリー表示
| 項目 | 計算式 | 表示形式 |
|------|--------|----------|
| 総積立額（元本） | 月額 × 12 × 年数 | ○○○万円 |
| 運用益 | 最終資産額 - 元本 | ○○○万円 |
| 最終資産額 | 複利計算結果 | ○○○万円 |

#### グラフ表示

**1. 折れ線グラフ（資産推移）**
- X軸: 経過年数（1年目、2年目...）
- Y軸: 金額（万円）
- 2本の線:
  - 青線: 累計元本
  - 緑線: 運用後資産額
- 目的: 「複利の雪だるま効果」を視覚化

**2. 棒グラフ（内訳）**
- 最終結果の内訳を表示
- 青色: 元本
- 緑色: 運用益
- 目的: 複利効果の実感

---

## 💻 技術仕様

### 新規ファイル（7ファイル）

```
src/
├── components/Investment/
│   ├── InvestmentCalculator.tsx  # メインコンポーネント（300行想定）
│   ├── InvestmentChart.tsx       # グラフコンポーネント（150行想定）
│   └── index.ts                  # barrel export
├── utils/
│   └── investmentCalculator.ts   # 計算ロジック（200行想定）
├── types/
│   └── investment.ts             # 型定義（50行想定）
└── tests/unit/
    └── investmentCalculator.test.ts  # テスト（100行想定）
```

### 型定義

```typescript
// src/types/investment.ts

/** 投資計算のパラメータ */
export interface InvestmentParams {
  monthlyAmount: number;      // 月々の積立額（円）
  annualReturn: number;       // 想定利回り（年利%）
  years: number;              // 積立期間（年）
  initialInvestment?: number; // 初期投資額（円、オプション）
}

/** 投資計算の結果 */
export interface InvestmentResult {
  principal: number;          // 総積立額（元本）
  profit: number;             // 運用益
  total: number;              // 最終資産額
  yearlyData: YearlyData[];   // 年次データ
}

/** 年次データ（グラフ用） */
export interface YearlyData {
  year: number;               // 年数（1, 2, 3...）
  principal: number;          // 累計元本
  total: number;              // 運用後資産額
  profit: number;             // 運用益
}
```

### 計算ロジック

#### 複利計算式

```typescript
/**
 * 毎月積立の複利計算（将来価値）
 *
 * 数式:
 * FV = PMT × ((1 + r)^n - 1) / r
 *
 * Where:
 * - FV  = Future Value（将来価値）
 * - PMT = 月々の積立額
 * - r   = 月利（年利 / 12 / 100）
 * - n   = 総月数（年数 × 12）
 *
 * 初期投資がある場合:
 * FV_total = FV_monthly + PV × (1 + r)^n
 *
 * Where:
 * - PV = Present Value（初期投資額）
 */
export function calculateCompoundInterest(
  params: InvestmentParams
): InvestmentResult {
  const { monthlyAmount, annualReturn, years, initialInvestment = 0 } = params;

  // 月利を計算
  const monthlyRate = annualReturn / 12 / 100;
  const totalMonths = years * 12;

  // 元本（積立総額）
  const principal = monthlyAmount * totalMonths;

  // 複利計算
  let monthlyFV = 0;
  if (monthlyRate === 0) {
    // 金利0%の場合は単純な累計
    monthlyFV = principal;
  } else {
    // 毎月積立の将来価値
    monthlyFV = monthlyAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  }

  // 初期投資の将来価値
  const initialFV = initialInvestment * Math.pow(1 + monthlyRate, totalMonths);

  // 最終資産額
  const total = Math.round(monthlyFV + initialFV);

  // 運用益
  const profit = total - principal - initialInvestment;

  // 年次データ生成
  const yearlyData = generateYearlyData(params);

  return {
    principal: principal + initialInvestment,
    profit,
    total,
    yearlyData
  };
}
```

#### 年次データ生成

```typescript
/**
 * 年ごとの資産推移データを生成
 */
export function generateYearlyData(params: InvestmentParams): YearlyData[] {
  const { monthlyAmount, annualReturn, years, initialInvestment = 0 } = params;
  const monthlyRate = annualReturn / 12 / 100;

  const data: YearlyData[] = [];

  for (let year = 1; year <= years; year++) {
    const months = year * 12;

    // その年までの累計元本
    const principal = monthlyAmount * months + initialInvestment;

    // その年までの運用後資産額
    let monthlyFV = 0;
    if (monthlyRate === 0) {
      monthlyFV = monthlyAmount * months;
    } else {
      monthlyFV = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    }
    const initialFV = initialInvestment * Math.pow(1 + monthlyRate, months);
    const total = Math.round(monthlyFV + initialFV);

    data.push({
      year,
      principal,
      total,
      profit: total - principal
    });
  }

  return data;
}
```

---

## 🎨 UI/UXデザイン

### レイアウト構成

```
┌─────────────────────────────────────────────────────┐
│ Header: [ 住宅ローン ] [ 簡易電卓 ] [ 資産運用 ] ←NEW│
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────┐  ┌────────────────────┐  │
│ │   入力フォーム      │  │   結果サマリー      │  │
│ │                     │  │                    │  │
│ │ 月々の積立額        │  │ 総積立額: ○○万円   │  │
│ │ [  3  ] 万円 [↑↓] │  │ 運用益: ○○万円     │  │
│ │                     │  │ 最終資産額: ○○万円 │  │
│ │ 想定利回り          │  └────────────────────┘  │
│ │ [ 5.0 ] % [↑↓]    │                          │
│ │                     │  ┌────────────────────┐  │
│ │ 積立期間            │  │  折れ線グラフ       │  │
│ │ [ 20  ] 年 [↑↓]   │  │  （資産推移）       │  │
│ │                     │  └────────────────────┘  │
│ │ ▼ 詳細設定（任意）  │                          │
│ │   初期投資額        │  ┌────────────────────┐  │
│ │   [  0  ] 万円     │  │  棒グラフ           │  │
│ │                     │  │  （元本 vs 運用益） │  │
│ │ [ 計算する ]        │  └────────────────────┘  │
│ └─────────────────────┘                          │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 💡 繰上返済との詳細比較は有料版で            │   │
│ │ 「この積立額を繰上返済に回した場合」との比較  │   │
│ │ シミュレーションが可能です [詳しく見る >]    │   │
│ │                                                │   │
│ │ [ 🔒 PDF出力（有料版機能） ]                  │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### カラースキーム

| 要素 | カラー | 用途 |
|------|--------|------|
| 元本線/棒 | `blue-500` | 累計元本の表示 |
| 運用後資産線/棒 | `green-500` | 複利効果後の資産 |
| 運用益棒 | `green-400` | 運用益の強調 |
| 計算ボタン | `green-500` | アクション |
| 有料版CTA背景 | `amber-50` | 注目を集める |
| 鍵マーク | `gray-400` | 有料機能の示唆 |

### レスポンシブ対応

```css
/* モバイル（< 640px） */
- 入力フォームと結果を縦並び
- グラフは幅100%で表示
- フォントサイズを調整

/* タブレット（640px - 1024px） */
- 入力フォームと結果を横並び可能
- グラフは2カラムレイアウト

/* デスクトップ（> 1024px） */
- 左: 入力フォーム（1/3）
- 右: 結果 + グラフ（2/3）
- グラフは横並び表示
```

---

## 🔗 有料版への導線

### 1. 計算結果下のCTA

```tsx
<div className="mt-8 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
  <div className="flex items-start">
    <div className="flex-shrink-0">
      💡
    </div>
    <div className="ml-3">
      <h3 className="text-lg font-medium text-gray-900">
        繰上返済との詳細比較は有料版で
      </h3>
      <p className="mt-2 text-sm text-gray-700">
        「この積立額を繰上返済に回した場合」との比較シミュレーションが可能です。
        利息軽減効果とNISA運用益を並べて提示できるため、顧客への提案がより説得力を持ちます。
      </p>
      <button className="mt-4 text-amber-600 hover:text-amber-700 font-medium">
        詳しく見る →
      </button>
    </div>
  </div>
</div>
```

### 2. PDF出力ボタン（鍵マーク付き）

```tsx
<button
  disabled
  className="mt-4 px-6 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center"
>
  <svg className="w-5 h-5 mr-2" /* 鍵アイコン */>
    {/* 鍵SVGパス */}
  </svg>
  PDF出力（有料版機能）
</button>
```

### 3. 履歴保存制限（将来的に）

無料版では計算履歴を3件までに制限し、それ以上は有料版を促す。

---

## 🧪 テスト戦略

### 単体テスト（投資計算ロジック）

```typescript
describe('複利計算ロジック', () => {
  describe('calculateCompoundInterest', () => {
    it('月3万円、年利5%、20年の場合', () => {
      const result = calculateCompoundInterest({
        monthlyAmount: 30000,
        annualReturn: 5.0,
        years: 20
      });

      expect(result.principal).toBe(7200000);  // 3万 × 12 × 20
      expect(result.total).toBeCloseTo(12331977, -3);  // 複利計算結果
      expect(result.profit).toBeCloseTo(5131977, -3);
    });

    it('年利0%の場合は元本のみ', () => {
      const result = calculateCompoundInterest({
        monthlyAmount: 30000,
        annualReturn: 0,
        years: 20
      });

      expect(result.principal).toBe(7200000);
      expect(result.total).toBe(7200000);
      expect(result.profit).toBe(0);
    });

    it('初期投資額がある場合', () => {
      const result = calculateCompoundInterest({
        monthlyAmount: 30000,
        annualReturn: 5.0,
        years: 20,
        initialInvestment: 1000000  // 100万円
      });

      expect(result.principal).toBe(8200000);  // 720万 + 100万
      expect(result.total).toBeGreaterThan(13000000);
    });
  });

  describe('generateYearlyData', () => {
    it('20年分のデータが生成される', () => {
      const data = generateYearlyData({
        monthlyAmount: 30000,
        annualReturn: 5.0,
        years: 20
      });

      expect(data).toHaveLength(20);
      expect(data[0].year).toBe(1);
      expect(data[19].year).toBe(20);
    });

    it('年ごとに資産が増加する', () => {
      const data = generateYearlyData({
        monthlyAmount: 30000,
        annualReturn: 5.0,
        years: 20
      });

      // 各年で資産が増加していることを確認
      for (let i = 1; i < data.length; i++) {
        expect(data[i].total).toBeGreaterThan(data[i - 1].total);
      }
    });
  });
});
```

### コンポーネントテスト（任意）

```typescript
describe('InvestmentCalculator', () => {
  it('初期値が正しく表示される', () => {
    render(<InvestmentCalculator />);

    expect(screen.getByDisplayValue('3')).toBeInTheDocument();  // 月額
    expect(screen.getByDisplayValue('5.0')).toBeInTheDocument(); // 利回り
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();  // 期間
  });

  it('計算ボタンクリックで結果が表示される', async () => {
    render(<InvestmentCalculator />);

    const button = screen.getByText('計算する');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/最終資産額/)).toBeInTheDocument();
    });
  });
});
```

---

## 📊 成功指標（KPI）

### ユーザーエンゲージメント
- 資産運用タブの利用率: 30%以上
- 1セッションあたりの計算回数: 平均2回以上
- 有料版CTAのクリック率: 5%以上

### コンバージョン
- 無料版→有料版の転換率: 1%以上（業界平均）
- PDF出力ボタンへの興味（クリック試行）: 10%以上

### 技術指標
- ページロード時間: < 2秒
- グラフ描画時間: < 500ms
- テストカバレッジ: 80%以上（計算ロジック）

---

## 🚀 リリース計画

### Phase 9.5: NISA複利計算ツール追加

| ステップ | 期間 | 成果物 |
|---------|------|--------|
| ドキュメント整備 | 1時間 | 本仕様書、チケット、実装ガイド |
| 基盤構築 | 2時間 | 型定義、計算ロジック、テスト |
| コンポーネント実装 | 2.5時間 | UI、グラフ、フォーム |
| ページ統合 | 1時間 | Home.tsx修正、タブ追加 |
| 品質保証 | 1時間 | テスト、レスポンシブ確認 |
| **合計** | **7.5時間** | 完全動作する機能 |

### デプロイ
- Vercelへの自動デプロイ（main ブランチマージ時）
- A/Bテスト: 50%のユーザーに新機能を表示（任意）

---

## ⚠️ 注意事項・制約

### 技術的制約
1. **グラフライブラリ**: rechartsを使用（軽量でReact互換性高い）
2. **データ量**: 最大50年分の年次データ（パフォーマンス考慮）
3. **ブラウザ対応**: Chrome, Safari, Firefox, Edge最新版

### ビジネス制約
1. **無料版の範囲**: 単純な複利計算のみ
2. **有料版との差別化**: 繰上返済比較・複数パターン保存・PDF出力は有料
3. **法的注意**: 「シミュレーション結果は参考値であり、実際の運用成果を保証するものではない」旨を明記

### UX制約
1. **入力値の妥当性**: 極端な値（月額1億円、年利100%など）は警告表示
2. **モバイル対応**: グラフは縮小表示でも判読可能なサイズを維持
3. **アクセシビリティ**: ARIA属性、キーボード操作対応

---

## 📝 将来の拡張案（有料版 Phase 10-18）

### Phase 13: ライフプランシミュレーション連携
- NISA積立をライフイベントと紐付け
- 教育費・老後資金目標との連動

### Phase 17: 詳細比較機能
- 繰上返済シミュレーション実装
- 並列比較UI（繰上返済 vs NISA）
- シナリオ別分析（保守的・標準・楽観的）

### 拡張機能案
- 税制優遇シミュレーション（つみたてNISA vs 一般NISA）
- リバランスアドバイス
- 複数銘柄ポートフォリオ
- iDeCo連携シミュレーション

---

**作成日**: 2025-10-21
**作成者**: Claude Code
**バージョン**: 1.0
