# 住宅ローン電卓 - 技術スタック提案書

## 1. 技術スタック概要

### 1.1 推奨構成

```
Frontend Framework:    React 18 + Vite
Language:             TypeScript
Styling:              Tailwind CSS
State Management:     React Hooks + Context API
Storage:              localStorage
Mobile Packaging:     Capacitor
Testing:              Vitest + React Testing Library
Linting:              ESLint + Prettier
```

### 1.2 選定理由

| 技術 | 選定理由 |
|------|---------|
| **React + Vite** | 高速な開発環境、豊富なエコシステム、軽量なビルド結果 |
| **TypeScript** | 型安全性、バグの早期発見、保守性の向上 |
| **Tailwind CSS** | 高速なUI開発、レスポンシブ対応が容易、一貫性のあるデザイン |
| **Capacitor** | Web技術でAndroid/iOSアプリをビルド可能、Webコードの再利用率が高い |
| **localStorage** | サーバー不要、シンプルなデータ永続化、プライバシー保護 |

---

## 2. 詳細技術仕様

### 2.1 フロントエンド

#### 2.1.1 React + Vite
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "vite": "^5.0.0"
}
```

**メリット**:
- Viteによる高速なHMR（Hot Module Replacement）
- 最適化されたプロダクションビルド
- TypeScriptネイティブサポート
- 学習コストが低い

**使用するReact機能**:
- `useState`: 入力値・計算結果の状態管理
- `useEffect`: 履歴の自動保存
- `useContext`: グローバル状態管理（必要に応じて）
- `useMemo`: 計算結果のメモ化
- `useCallback`: イベントハンドラの最適化

#### 2.1.2 TypeScript
```json
{
  "typescript": "^5.3.0"
}
```

**型定義例**:
```typescript
interface LoanParams {
  principal: number;        // 借入金額
  interestRate: number;     // 金利（年利）
  years: number;            // 返済期間（年）
  months: number;           // 返済期間（月）
  repaymentType: 'equal-payment' | 'equal-principal'; // 返済方式
  bonusPayment?: {
    enabled: boolean;
    amount: number;
    months: number[];       // ボーナス月（1-12）
  };
}

interface LoanResult {
  monthlyPayment: number;   // 月々返済額
  totalPayment: number;     // 総返済額
  totalInterest: number;    // 利息総額
  schedule: PaymentSchedule[]; // 返済計画
}

interface PaymentSchedule {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}
```

### 2.2 スタイリング

#### 2.2.1 Tailwind CSS
```json
{
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

**設定例**:
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',    // ブルー系
        secondary: '#10B981',  // グリーン系
        accent: '#F59E0B',     // オレンジ系
      },
      spacing: {
        'calculator': '4.5rem', // ボタンサイズ
      }
    },
  },
  plugins: [],
}
```

**レスポンシブデザイン**:
```jsx
// Tailwindのブレイクポイント
sm: 640px   // スマホ横向き
md: 768px   // タブレット
lg: 1024px  // PC
xl: 1280px  // 大画面PC

// 使用例
<div className="
  w-full           // mobile: 100%幅
  md:w-1/2         // tablet: 50%幅
  lg:w-1/3         // PC: 33%幅
  p-4              // 全デバイス: padding
  md:p-8           // tablet以上: 大きめpadding
">
```

### 2.3 状態管理

#### 2.3.1 React Hooks + Context API
```typescript
// contexts/LoanContext.tsx
interface LoanContextType {
  loanParams: LoanParams;
  setLoanParams: (params: LoanParams) => void;
  loanResult: LoanResult | null;
  calculate: () => void;
  history: LoanHistory[];
  addToHistory: (result: LoanResult) => void;
  clearHistory: () => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);
```

**状態管理の方針**:
- グローバル状態: Context API（計算パラメータ、履歴）
- ローカル状態: useState（UI状態、入力値）
- 外部ライブラリ不要（Redux等は使用しない）

#### 2.3.2 localStorage による永続化
```typescript
// utils/storage.ts
const STORAGE_KEYS = {
  LOAN_HISTORY: 'loan-calculator-history',
  SETTINGS: 'loan-calculator-settings',
};

export const saveHistory = (history: LoanHistory[]) => {
  localStorage.setItem(STORAGE_KEYS.LOAN_HISTORY, JSON.stringify(history));
};

export const loadHistory = (): LoanHistory[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LOAN_HISTORY);
  return data ? JSON.parse(data) : [];
};
```

**保存するデータ**:
- 計算履歴（最大20件）
- ユーザー設定（表示形式など）

### 2.4 計算ロジック

#### 2.4.1 ローン計算アルゴリズム
```typescript
// utils/loanCalculator.ts

/**
 * 元利均等返済の月々返済額を計算
 * PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
 */
export const calculateEqualPayment = (
  principal: number,
  annualRate: number,
  totalMonths: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / totalMonths;

  const payment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return Math.round(payment);
};

/**
 * 元金均等返済の計算
 */
export const calculateEqualPrincipal = (
  principal: number,
  annualRate: number,
  totalMonths: number
): PaymentSchedule[] => {
  const monthlyPrincipal = principal / totalMonths;
  const monthlyRate = annualRate / 12 / 100;
  let remainingBalance = principal;
  const schedule: PaymentSchedule[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    const interest = remainingBalance * monthlyRate;
    const payment = monthlyPrincipal + interest;
    remainingBalance -= monthlyPrincipal;

    schedule.push({
      month,
      payment: Math.round(payment),
      principal: Math.round(monthlyPrincipal),
      interest: Math.round(interest),
      balance: Math.round(remainingBalance),
    });
  }

  return schedule;
};

/**
 * ボーナス併用払いの計算
 */
export const calculateWithBonus = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  bonusAmount: number,
  bonusMonths: number[]
): LoanResult => {
  // ボーナス返済分と月次返済分を分離して計算
  // ...実装詳細
};
```

**精度の保証**:
- 浮動小数点の誤差対策（小数点以下を適切に丸める）
- 金融計算に準拠した四捨五入ルール
- 端数処理の明確化

---

## 3. モバイルアプリ化戦略

### 3.1 Capacitor による Native 化

#### 3.1.1 Capacitor とは
- Ionic社が開発するクロスプラットフォームフレームワーク
- WebアプリをそのままAndroid/iOSアプリに変換
- ネイティブAPIへのアクセスも可能

#### 3.1.2 導入手順
```bash
# Capacitorのインストール
npm install @capacitor/core @capacitor/cli

# プロジェクトの初期化
npx cap init

# プラットフォームの追加
npx cap add android
npx cap add ios

# ビルドと同期
npm run build
npx cap sync

# アプリの起動
npx cap open android  # Android Studio
npx cap open ios      # Xcode
```

#### 3.1.3 設定ファイル
```json
// capacitor.config.json
{
  "appId": "com.yourcompany.loancalculator",
  "appName": "住宅ローン電卓",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#1E40AF"
    }
  }
}
```

### 3.2 配布戦略

#### 3.2.1 Web版
- **ホスティング**: Vercel / Netlify / Cloudflare Pages
- **URL**: https://loan-calculator.yourdomain.com
- **PWA対応**: Service Workerで将来的に対応可能

#### 3.2.2 Android版
- **配布方法**: Google Play Console
- **要件**:
  - Developer アカウント（$25 一回払い）
  - APK/AABファイル
  - プライバシーポリシー

#### 3.2.3 iOS版
- **配布方法**: App Store Connect
- **要件**:
  - Apple Developer Program（年$99）
  - Mac + Xcode
  - プライバシーポリシー

---

## 4. プロジェクト構成

### 4.1 ディレクトリ構造

```
loan-simulation/
├── public/                  # 静的ファイル
│   ├── icon.png
│   └── favicon.ico
├── src/
│   ├── components/          # UIコンポーネント
│   │   ├── Calculator/
│   │   │   ├── Keypad.tsx
│   │   │   ├── Display.tsx
│   │   │   └── index.tsx
│   │   ├── Input/
│   │   │   ├── LoanForm.tsx
│   │   │   └── BonusSettings.tsx
│   │   ├── Result/
│   │   │   ├── Summary.tsx
│   │   │   ├── Schedule.tsx
│   │   │   └── Chart.tsx
│   │   ├── History/
│   │   │   ├── HistoryList.tsx
│   │   │   └── HistoryItem.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Container.tsx
│   ├── contexts/            # Context API
│   │   └── LoanContext.tsx
│   ├── hooks/               # カスタムフック
│   │   ├── useCalculator.ts
│   │   ├── useHistory.ts
│   │   └── useKeyboard.ts
│   ├── utils/               # ユーティリティ関数
│   │   ├── loanCalculator.ts
│   │   ├── storage.ts
│   │   └── formatter.ts
│   ├── types/               # TypeScript型定義
│   │   └── loan.ts
│   ├── pages/               # ページコンポーネント
│   │   ├── Home.tsx
│   │   ├── History.tsx
│   │   └── Settings.tsx
│   ├── App.tsx              # ルートコンポーネント
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── tests/                   # テストファイル
│   ├── unit/
│   └── integration/
├── capacitor.config.json    # Capacitor設定
├── vite.config.ts           # Vite設定
├── tailwind.config.js       # Tailwind設定
├── tsconfig.json            # TypeScript設定
├── package.json
└── README.md
```

### 4.2 主要コンポーネント設計

```
App
├── Header
├── LoanProvider (Context)
│   └── Home
│       ├── Calculator
│       │   ├── Display (計算結果表示)
│       │   ├── LoanForm (パラメータ入力)
│       │   └── Keypad (テンキー)
│       └── Result
│           ├── Summary (概要)
│           ├── Schedule (返済計画表)
│           └── Chart (グラフ)
├── History
│   └── HistoryList
│       └── HistoryItem[]
└── Footer
```

---

## 5. 開発フロー

### 5.1 環境構築

```bash
# プロジェクト作成
npm create vite@latest loan-simulation -- --template react-ts

# 依存関係インストール
cd loan-simulation
npm install

# Tailwind CSSセットアップ
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 開発サーバー起動
npm run dev
```

### 5.2 開発フェーズ

#### Phase 1: 基本機能実装（1-2週間）
- [x] プロジェクトセットアップ
- [ ] 基本UIの構築（電卓レイアウト）
- [ ] ローン計算ロジックの実装
- [ ] 元利均等返済の計算
- [ ] 元金均等返済の計算
- [ ] 結果表示画面

#### Phase 2: 拡張機能（1週間）
- [ ] ボーナス払い機能
- [ ] 返済計画表の表示
- [ ] 履歴機能（localStorage）
- [ ] キーボードショートカット

#### Phase 3: UI/UX改善（1週間）
- [ ] レスポンシブデザインの調整
- [ ] アニメーション・トランジション
- [ ] エラーハンドリング
- [ ] ユーザビリティテスト

#### Phase 4: モバイル対応（1週間）
- [ ] タッチ操作の最適化
- [ ] PWA対応（オプション）
- [ ] Capacitor統合
- [ ] Android/iOSビルドテスト

#### Phase 5: リリース準備（3-5日）
- [ ] パフォーマンス最適化
- [ ] クロスブラウザテスト
- [ ] ドキュメント整備
- [ ] デプロイ

### 5.3 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# TypeScript型チェック
npm run type-check

# Lint実行
npm run lint

# テスト実行
npm run test

# Capacitor同期
npm run build && npx cap sync

# Androidエミュレータ起動
npx cap run android

# iOSシミュレータ起動
npx cap run ios
```

---

## 6. テスト戦略

### 6.1 単体テスト

#### 6.1.1 計算ロジックのテスト
```typescript
// tests/unit/loanCalculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateEqualPayment } from '@/utils/loanCalculator';

describe('元利均等返済計算', () => {
  it('3000万円、35年、1.5%の場合', () => {
    const payment = calculateEqualPayment(30000000, 1.5, 420);
    expect(payment).toBe(91855); // 期待値
  });

  it('金利0%の場合は元金均等になる', () => {
    const payment = calculateEqualPayment(12000000, 0, 120);
    expect(payment).toBe(100000);
  });
});
```

#### 6.1.2 コンポーネントテスト
```typescript
// tests/unit/Keypad.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Keypad from '@/components/Calculator/Keypad';

describe('Keypad', () => {
  it('数字ボタンをクリックすると値が入力される', () => {
    const onInput = vi.fn();
    render(<Keypad onInput={onInput} />);

    fireEvent.click(screen.getByText('5'));
    expect(onInput).toHaveBeenCalledWith('5');
  });
});
```

### 6.2 統合テスト

```typescript
// tests/integration/calculation.test.tsx
describe('ローン計算フロー', () => {
  it('入力から結果表示までの一連の流れ', async () => {
    render(<App />);

    // 金額入力
    const principalInput = screen.getByLabelText('借入金額');
    fireEvent.change(principalInput, { target: { value: '30000000' } });

    // 計算実行
    const calculateButton = screen.getByText('計算');
    fireEvent.click(calculateButton);

    // 結果確認
    await waitFor(() => {
      expect(screen.getByText(/月々返済額/)).toBeInTheDocument();
    });
  });
});
```

### 6.3 E2Eテスト（オプション）

- Playwright を使用
- 主要なユーザーフローをテスト
- CI/CDで自動実行

---

## 7. デプロイメント

### 7.1 Web版デプロイ（Vercel推奨）

#### 7.1.1 Vercelへのデプロイ
```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

**設定**:
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### 7.1.2 環境変数（必要な場合）
```
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=住宅ローン電卓
```

### 7.2 Android版リリース

#### 7.2.1 ビルド手順
```bash
# プロダクションビルド
npm run build

# Capacitor同期
npx cap sync android

# Android Studioで開く
npx cap open android

# APK/AAB生成
# Android Studio: Build > Generate Signed Bundle/APK
```

#### 7.2.2 署名鍵の生成
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 7.3 iOS版リリース

#### 7.3.1 ビルド手順
```bash
# Xcodeで開く
npx cap open ios

# 署名設定
# Xcode > Signing & Capabilities

# アーカイブ作成
# Xcode > Product > Archive
```

#### 7.3.2 App Store Connect
- App情報の登録
- スクリーンショット準備（必須サイズ）
- プライバシーポリシー設定
- 審査提出

---

## 8. パフォーマンス最適化

### 8.1 コード分割

```typescript
// React.lazy でルート分割
const History = lazy(() => import('@/pages/History'));
const Settings = lazy(() => import('@/pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### 8.2 メモ化

```typescript
// 高コストな計算結果をメモ化
const loanResult = useMemo(() => {
  return calculateLoan(loanParams);
}, [loanParams]);

// イベントハンドラをメモ化
const handleCalculate = useCallback(() => {
  // 計算処理
}, [dependencies]);
```

### 8.3 ビルド最適化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'], // グラフライブラリ
        },
      },
    },
  },
});
```

---

## 9. セキュリティ考慮事項

### 9.1 データ保護
- 個人情報は一切保存しない
- localStorage使用（端末内のみ）
- 外部サーバーへの送信なし

### 9.2 入力検証
```typescript
const validateLoanParams = (params: LoanParams): ValidationResult => {
  if (params.principal <= 0 || params.principal > 1000000000) {
    return { valid: false, error: '借入金額が不正です' };
  }
  if (params.interestRate < 0 || params.interestRate > 20) {
    return { valid: false, error: '金利が不正です' };
  }
  // その他の検証...
  return { valid: true };
};
```

### 9.3 依存パッケージの管理
```bash
# 脆弱性チェック
npm audit

# 自動修正
npm audit fix
```

---

## 10. まとめ

### 10.1 技術スタックの利点

| 要件 | 実現方法 | メリット |
|------|---------|---------|
| **クロスプラットフォーム** | React + Capacitor | 1つのコードベースで Web/Android/iOS 対応 |
| **高速開発** | Vite + Tailwind | HMRで即座に反映、CSSも高速記述 |
| **型安全** | TypeScript | バグの早期発見、保守性向上 |
| **シンプルな構成** | フロントエンドのみ | サーバー不要、低コスト |
| **オフライン可能** | localStorage + PWA | 将来的な拡張が容易 |

### 10.2 開発期間見積もり

```
Phase 1: 基本機能      1-2週間
Phase 2: 拡張機能      1週間
Phase 3: UI/UX改善     1週間
Phase 4: モバイル対応   1週間
Phase 5: リリース準備   3-5日
--------------------------------
合計:                  4-6週間
```

### 10.3 コスト見積もり

**開発コスト**:
- 開発環境: 無料
- ホスティング（Vercel）: 無料〜$20/月

**アプリ配布コスト**:
- Google Play: $25（一回のみ）
- App Store: $99/年

### 10.4 次のステップ

1. ✅ 要件定義の確認
2. ✅ 技術スタックの決定
3. ⬜ プロジェクトセットアップ
4. ⬜ 基本UIの実装
5. ⬜ 計算ロジックの実装

---

**作成日**: 2025-10-12
**バージョン**: 1.0
**ステータス**: 承認待ち
