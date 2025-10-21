# トラブルシューティング - Troubleshooting Guide

このドキュメントは開発中に発生したエラーと解決方法をまとめています。

---

## 目次

1. [Vite プロジェクト作成時のエラー](#vite-プロジェクト作成時のエラー)
2. [npm test のタイムアウト](#npm-test-のタイムアウト)
3. [TypeScript 診断警告](#typescript-診断警告)
4. [開発サーバー関連](#開発サーバー関連)
5. [Capacitor / モバイル関連](#capacitor--モバイル関連)
6. [フォーム入力の問題](#フォーム入力の問題)

---

## Vite プロジェクト作成時のエラー

### 問題

```bash
npm create vite@latest . -- --template react-ts
# → Operation cancelled
```

**原因**: ディレクトリが空でない場合、Viteが既存ファイルの上書き確認を求めるが、インタラクティブな入力ができない。

### 解決方法

インタラクティブな確認を避けるため、**手動でファイルを作成**する方法を採用:

```bash
# 1. 必要な設定ファイルを個別に作成
# package.json, tsconfig.json, vite.config.ts, etc.

# 2. npm install で依存関係をインストール
npm install

# 3. ディレクトリ構造を作成
mkdir -p src/{components,contexts,hooks,utils,types,pages}
```

**参考コード**:
- `/Users/u1/dev/loan-simulation/package.json`
- `/Users/u1/dev/loan-simulation/tsconfig.json`
- `/Users/u1/dev/loan-simulation/vite.config.ts`

**教訓**:
- 空でないディレクトリには `npm create vite` を使わない
- 設定ファイルを直接作成する方が確実

---

## npm test のタイムアウト

### 問題

```bash
npm run test
# → Command timed out after 1m 0s
```

**原因**: `npm run test` はデフォルトで **watch モード** で起動し、ファイル変更を監視し続けるため、終了しない。

### 解決方法

**watch モードを無効化**して1回だけ実行:

```bash
# ✅ 正しい方法
npm run test -- --run

# または package.json に追加
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest --run",    # 1回だけ実行
    "test:ui": "vitest --ui"       # UIモード
  }
}
```

**Vitestのモード**:
- **watchモード** (デフォルト): ファイル変更を監視
- **runモード** (`--run`): 1回実行して終了
- **UIモード** (`--ui`): ブラウザでテスト結果表示

**教訓**:
- CI/CD や一度だけテストする場合は `--run` を使用
- ローカル開発では watch モードが便利

---

## TypeScript 診断警告

### 問題1: 未使用の import

```typescript
// loanCalculator.test.ts:15
import { PaymentSchedule } from '@/types';
// ★ 'PaymentSchedule' は宣言されましたが使用されませんでした。
```

**解決方法**:

```typescript
// ✅ 使用していない import を削除
import type { LoanParams, LoanResult } from '@/types';

// または型だけインポートする場合は type を明示
import type { PaymentSchedule } from '@/types';
```

### 問題2: 暗黙的な any 型

```typescript
// loanCalculator.test.ts:318
errors.forEach((e) => {
  // ★ パラメーター 'e' の型は暗黙的に 'any' になっています
});
```

**解決方法**:

```typescript
// ✅ 型を明示
errors.forEach((e: ValidationError) => {
  expect(e.field).toBeDefined();
});

// または型推論を活用
interface ValidationError {
  field: string;
  message: string;
}

const errors: ValidationError[] = [];
errors.forEach((e) => {  // 自動的に ValidationError 型と推論される
  // ...
});
```

### 設定での対応

`tsconfig.json` で厳格度を調整:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,      // 未使用変数を警告
    "noUnusedParameters": true,   // 未使用パラメータを警告
    "noImplicitAny": true         // 暗黙的anyを禁止
  }
}
```

**教訓**:
- 未使用の import は削除
- ループ変数には明示的に型を付ける
- ESLint との連携で自動修正可能

---

## 開発サーバー関連

### 問題: ポートが既に使用されている

```bash
npm run dev
# → Error: Port 5173 is already in use
```

**解決方法**:

**方法1: プロセスを終了**
```bash
# ポートを使用しているプロセスを確認
lsof -i :5173

# プロセスを終了
kill -9 <PID>
```

**方法2: 別のポートを使用**
```bash
# 環境変数で指定
PORT=5174 npm run dev

# または vite.config.ts で設定
export default defineConfig({
  server: {
    port: 5174,
    strictPort: false,  // ポートが使用中の場合、自動的に次を使用
  },
});
```

**方法3: バックグラウンド実行の停止**
```bash
# バックグラウンドプロセスを確認
jobs

# 停止
kill %1  # ジョブ番号

# または
killall node
```

### 問題: HMR が動作しない

**症状**: ファイルを編集してもブラウザが更新されない

**解決方法**:

1. ブラウザのキャッシュをクリア
2. `node_modules/.vite` を削除して再起動
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```
3. ブラウザの開発者ツールで「Disable cache」を有効化

---

## Git 関連

### 問題: コミットメッセージが長すぎる

```bash
git commit -m "very long message..."
# → hint: Using 'master' as the name for the initial branch
```

**解決方法**:

**HEREDOCを使用**:
```bash
git commit -m "$(cat <<'EOF'
feat: Implement Phase 2 - Loan calculation logic

Detailed description here...

TICKET-101: Foundation
TICKET-102: Equal payment
...
EOF
)"
```

**または-Fオプション**:
```bash
# メッセージをファイルに書く
cat > commit-msg.txt <<EOF
feat: Implement Phase 2
...
EOF

# ファイルから読み込む
git commit -F commit-msg.txt
```

---

## npm 関連

### 問題: npm install が遅い

**解決方法**:

```bash
# npm キャッシュをクリア
npm cache clean --force

# 並列インストールを増やす
npm install --prefer-offline --no-audit

# または pnpm を使用（高速）
npm install -g pnpm
pnpm install
```

### 問題: 依存関係の脆弱性警告

```bash
npm install
# → 5 moderate severity vulnerabilities
```

**解決方法**:

```bash
# 自動修正を試す
npm audit fix

# 破壊的変更を含む修正
npm audit fix --force

# 無視する（開発環境のみの場合）
# → .npmrc に追加
audit=false
```

**注意**:
- プロダクションでは脆弱性を必ず対応
- 開発環境のみの警告は優先度低

---

## Vitest 関連

### 問題: テストが見つからない

```bash
npm run test
# → No test files found
```

**解決方法**:

1. **ファイル名の確認**:
   - `*.test.ts` または `*.spec.ts`
   - `tests/` ディレクトリ内

2. **vite.config.ts の設定確認**:
   ```typescript
   export default defineConfig({
     test: {
       include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
       exclude: ['node_modules', 'dist'],
     },
   });
   ```

3. **test setup の確認**:
   ```typescript
   // src/test/setup.ts
   import '@testing-library/jest-dom';
   ```

### 問題: jsdom エラー

```bash
Error: Cannot find module 'jsdom'
```

**解決方法**:

```bash
npm install -D jsdom @vitest/ui

# vite.config.ts で指定
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

---

## エディタ/IDE 関連

### VSCode: TypeScript エラーが消えない

**解決方法**:

1. **TypeScript サーバーを再起動**:
   - `Cmd + Shift + P` → "TypeScript: Restart TS Server"

2. **ワークスペースをリロード**:
   - `Cmd + Shift + P` → "Developer: Reload Window"

3. **型定義を再生成**:
   ```bash
   rm -rf node_modules
   npm install
   ```

### Prettier/ESLint の競合

**解決方法**:

```bash
# prettier と eslint を統合
npm install -D eslint-config-prettier

# .eslintrc.cjs
module.exports = {
  extends: [
    'eslint:recommended',
    'prettier',  // prettierのルールを無効化
  ],
};
```

---

## パフォーマンス最適化

### 大量のテストが遅い

**解決方法**:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads',           // または 'forks'
    poolOptions: {
      threads: {
        singleThread: false,   // 並列実行
      },
    },
    isolate: false,            // 分離を無効化（高速化）
  },
});
```

### ビルドが遅い

**解決方法**:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',          // ターゲットを下げる
    minify: 'esbuild',         // esbuildを使用（高速）
    sourcemap: false,          // sourcemapを無効化
  },
});
```

---

## Capacitor / モバイル関連

### 問題: CocoaPods がインストールされていない（iOS）

```bash
npx cap add ios
# → [warn] Skipping pod install because CocoaPods is not installed
```

**解決方法**:

**macOS のみ**: iOSビルドには CocoaPods が必要

```bash
# CocoaPods をインストール
sudo gem install cocoapods

# または Homebrew 経由
brew install cocoapods

# その後、依存関係をインストール
cd ios/App
pod install
cd ../..
```

**注意**:
- iOSビルドは **Mac** でのみ可能
- Xcode がインストールされていることを確認
- Windows/Linux では Android のみ対応

### 問題: Android Studio が見つからない

```bash
npm run cap:open:android
# → Error: Android Studio not found
```

**解決方法**:

1. **Android Studio をインストール**:
   - [Android Studio ダウンロード](https://developer.android.com/studio)
   - インストール後、初回セットアップを完了

2. **環境変数を設定**:
   ```bash
   # ~/.zshrc または ~/.bashrc に追加
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Capacitor に場所を教える**:
   ```bash
   # 手動でプロジェクトを開く
   open -a "Android Studio" android/
   ```

### 問題: ビルド後にアプリが更新されない

```bash
npm run build
# → アプリに変更が反映されない
```

**解決方法**:

**必ず sync コマンドを実行**:

```bash
# ✅ 正しい手順
npm run build
npx cap sync

# または一発コマンド
npm run cap:sync
```

**sync コマンドの役割**:
- `dist/` の内容をネイティブプロジェクトにコピー
- プラグインの設定を更新
- ネイティブの依存関係を同期

### 問題: iOS シミュレータでアプリが起動しない

**解決方法**:

1. **Xcode Command Line Tools を確認**:
   ```bash
   xcode-select --install
   ```

2. **シミュレータのリスト確認**:
   ```bash
   xcrun simctl list devices
   ```

3. **手動で起動**:
   ```bash
   # iOS プロジェクトを開く
   npm run cap:open:ios

   # Xcode でシミュレータを選択して実行
   ```

### 問題: Android エミュレータが起動しない

**解決方法**:

1. **AVD Manager でエミュレータを作成**:
   - Android Studio → Tools → AVD Manager
   - Create Virtual Device

2. **エミュレータを手動で起動**:
   ```bash
   # エミュレータのリスト確認
   emulator -list-avds

   # エミュレータを起動
   emulator -avd Pixel_5_API_33

   # その後、アプリを実行
   npm run cap:run:android
   ```

### 問題: Capacitor のバージョン不一致

```bash
npx cap sync
# → [error] Capacitor version mismatch
```

**解決方法**:

```bash
# すべての Capacitor パッケージを同じバージョンに
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest @capacitor/ios@latest

# 再度 sync
npx cap sync
```

### トラブルシューティングコマンド集

```bash
# 1. Capacitor の状態確認
npx cap doctor

# 2. ネイティブプロジェクトのクリーン
# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios/App && rm -rf Pods Podfile.lock && pod install && cd ../..

# 3. 完全リビルド
npm run build
npx cap sync
npm run cap:open:android  # または ios
```

---

## フォーム入力の問題

### 問題: 借入金額が2001万円~3001万円の範囲に制限される

```tsx
// LoanForm.tsx で発生
<input
  type="number"
  step="1000"    // ← この属性が原因
  min="1"
  max="1000000000"
/>
```

**症状**:
- 上下ボタンで1000円ずつしか増減できない
- 初期値30,000,000から±1000円の範囲に制限される
- 自由な金額入力ができない

**原因**:
- `type="number"` + `step="1000"` の組み合わせ
- HTML5の仕様により、stepの倍数の値しか入力できない

**解決方法**:

```tsx
// ✅ type="text" に変更してカンマ区切りフォーマット
<input
  type="text"
  inputMode="numeric"  // スマホで数字キーボード表示
  value={formatNumber(values.principal)}
  onChange={handlePrincipalChange}
/>

// フォーマット関数
const formatNumber = (num: number | string): string => {
  if (!num) return '';
  const numStr = num.toString().replace(/,/g, '');
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// パース関数
const parseNumber = (str: string): number => {
  const cleaned = str.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// 変更ハンドラ（数字とカンマのみ許可）
const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const input = e.target.value;
  if (input === '' || /^[\d,]*$/.test(input)) {
    const numValue = parseNumber(input);
    handleChange('principal', numValue);
  }
};
```

**メリット**:
- 自由な金額入力が可能
- カンマ区切りで見やすい（30,000,000）
- スマホでは数字キーボードが表示される（`inputMode="numeric"`）
- step/min/max の制約がなくなる

**適用箇所**:
- 借入金額（`type="text"` + `inputMode="numeric"`）
- 返済期間の年数・月数（`type="text"` + `inputMode="numeric"`）
- 金利（`type="text"` + `inputMode="decimal"`）

**教訓**:
- `type="number"` は予期しない制約がある
- 金額入力には `type="text"` + `inputMode` が適切
- カンマ区切りフォーマットでUX向上

### 問題: 金利入力でstep制約により小数点入力ができない

**症状**: 金利 1.375% などの細かい値が入力できない

**解決方法**:

```tsx
// type="text" に変更して小数点入力を許可
<input
  type="text"
  inputMode="decimal"  // 小数点キーボード
  value={values.interestRate || ''}
  onChange={(e) => {
    const input = e.target.value;
    // 数字と小数点のみ許可
    if (input === '' || /^\d*\.?\d*$/.test(input)) {
      handleChange('interestRate', parseFloat(input) || 0);
    }
  }}
/>
```

---

## よくある質問 (FAQ)

### Q1: サブエージェントの実行結果を確認するには？

**A**: サブエージェントは完了時に結果を返します。メインエージェントが結果を受け取り、統合します。

### Q2: 並列実行時のファイル競合は？

**A**: 各サブエージェントは独立したファイルを作成するため、競合は発生しません。
- Agent 1 → `loanCalculator.ts` の一部
- Agent 2 → `equalPrincipal.test.ts`
- Agent 3 → `bonusPayment.test.ts`

### Q3: テストが失敗した場合は？

**A**:
1. エラーメッセージを確認
2. 該当ファイルを修正
3. `npm run test -- --run` で再実行

---

## チェックリスト

開発前に確認すること:

- [ ] Node.js のバージョン (v18以上推奨)
- [ ] npm のバージョン (v9以上推奨)
- [ ] ポート 5173 が空いているか
- [ ] `.gitignore` に `node_modules` が含まれているか
- [ ] TypeScript の設定が適切か

---

## 参考リンク

- [Vite 公式ドキュメント](https://vitejs.dev/)
- [Vitest 公式ドキュメント](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## UX改善の記録

### 改善1: 入力単位を「万円」に変更 (2025-10-13)

**背景**: 住宅ローンは10万円単位での入力が一般的。円単位では桁数が多く数えにくい。

**変更内容**:
- 借入金額: 30,000,000円 → 3000万円 と表示
- ボーナス加算額: 500,000円 → 50万円 と表示
- 内部では円単位で計算（互換性維持）

**実装**:
```tsx
// 万円単位でフォーマット
const formatManyen = (yen: number): string => {
  const manyen = yen / 10000;
  const [integer, decimal] = manyen.toString().split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
};

// 入力時は万円から円に変換
const parseManyenToYen = (str: string): number => {
  const manyen = parseFloat(str.replace(/,/g, ''));
  return isNaN(manyen) ? 0 : manyen * 10000;
};

<input
  type="text"
  inputMode="decimal"
  value={formatManyen(values.principal)}
  onChange={(e) => {
    const input = e.target.value;
    if (input === '' || /^[\d,]*\.?\d*$/.test(input)) {
      handleChange('principal', parseManyenToYen(input));
    }
  }}
  placeholder="3000"
/>
```

**メリット**:
- 桁数が少なく入力しやすい（8桁 → 4桁）
- カンマ区切りで読みやすい（3,000 vs 30,000,000）
- 業界慣習に合致

**適用箇所**:
- `LoanForm.tsx`: 借入金額（万円）
- `BonusSettings.tsx`: ボーナス加算額（万円）

### 改善2: ボーナス払い月を1月・8月に固定 (2025-10-13)

**背景**: 日本の一般的なボーナス月は1月（冬）と8月（夏）。月選択UIは不要。

**変更内容**:
- 月選択UIを削除（12個のボタン不要）
- デフォルトで1月・8月に固定
- 説明文を「年2回（1月・8月）のボーナス月に追加返済」に変更

**実装**:
```tsx
// デフォルト値を変更
const DEFAULT_LOAN_PARAMS: LoanParams = {
  bonusPayment: {
    enabled: false,
    amount: 0,
    months: [1, 8],  // 固定
  },
};

// UIをシンプル化
<div>
  <p className="font-medium">ボーナス払い</p>
  <p className="text-sm text-gray-500">
    年2回（1月・8月）のボーナス月に追加返済を行います
  </p>
  {/* 月選択UIを削除 */}
</div>
```

**メリット**:
- UIがシンプルになり入力が簡単
- ユーザーが迷わない
- 一般的なケースに最適化

**適用箇所**:
- `BonusSettings.tsx`: UI簡素化
- `LoanContext.tsx`: デフォルト値変更
- `Home.tsx`: デフォルト値変更

---

### 改善3: 金利を小数点2桁表示 + 全入力に↑↓ボタン追加 (2025-10-13)

**背景**: 金利は1.50%のように小数点2桁で表示したい。また、微調整のために↑↓ボタンがあると便利。

**変更内容**:

1. **金利表示を2桁固定**:
   ```tsx
   const formatInterestRate = (rate: number): string => {
     return rate.toFixed(2);  // 1.50%, 2.00% など
   };
   ```

2. **全入力欄に↑↓ボタン追加**:
   - 借入金額: 100万円ずつ調整
   - 返済期間（年）: 1年ずつ調整
   - 返済期間（月）: 1ヶ月ずつ調整
   - 金利: 0.01%ずつ調整
   - ボーナス加算額: 10万円ずつ調整

3. **ボーナス月バリデーション削除**:
   - ボーナス月は1月・8月に固定されたため、「月を選択してください」エラーを削除
   - バリデーション関数から該当チェックを削除

**実装**:
```tsx
// 増減ハンドラ
const handleIncrement = (field: keyof LoanParams, step: number) => {
  const currentValue = values[field] as number;
  handleChange(field, Math.max(0, currentValue + step));
};

// UIレイアウト
<div className="relative flex items-center gap-2">
  <input {...props} className="flex-1" />
  <div className="flex flex-col gap-1">
    <button onClick={() => handleIncrement('interestRate', 0.01)}>▲</button>
    <button onClick={() => handleDecrement('interestRate', 0.01)}>▼</button>
  </div>
</div>
```

**メリット**:
- 金利が見やすい（1.5% → 1.50%）
- ワンクリックで微調整可能
- キーボード入力とボタンの両方が使える

**適用箇所**:
- `LoanForm.tsx`: すべての数値入力
- `BonusSettings.tsx`: ボーナス加算額
- `loanCalculator.ts`: ボーナス月バリデーション削除

---

## デプロイ関連

### Vercel デプロイの仕組み（GitHub連携）

**発生日**: 2025-10-20

**重要な発見**:
VercelとGitHubを連携している場合、**GitHubへのpushだけで自動デプロイされる**

**デプロイフロー**:
```bash
# 1. GitHubにpush
git add .
git commit -m "feat: Add new feature"
git push origin main

# 2. Vercelが自動的に検知してデプロイ
# → `vercel --prod` コマンドは不要！
```

**確認方法**:
1. Vercelダッシュボード (https://vercel.com/dashboard) にアクセス
2. プロジェクトページで最新のデプロイメントを確認
3. GitHubのコミットハッシュと紐付いていることを確認

**メリット**:
- 手動デプロイコマンド不要
- GitHubへのpush後、自動的に本番環境に反映
- デプロイ履歴がGitコミットと連動
- ロールバックが簡単（以前のコミットに戻すだけ）

**注意点**:
- mainブランチへのpushが本番デプロイになる設定の場合、慎重に
- プレビューデプロイ: feature branchへのpushは自動的にプレビュー環境にデプロイ
- 環境変数はVercelダッシュボードから設定

**CLI でのデプロイが必要な場合**:
- ローカルから直接デプロイしたい場合のみ
- GitHub連携していない場合
- 環境変数のテストなど特殊な場合

---

### 問題: Vercel CLI デプロイ時のトークン無効エラー（参考）

**エラー内容**:
```bash
vercel --prod
# → Error: The specified token is not valid. Use `vercel login` to generate a new token.
```

**原因**:
- Vercelの認証トークンが期限切れまたは無効化されている
- 長期間ログインしていない場合に発生

**解決方法** (GitHub連携していない場合のみ):

1. **Vercelに再ログイン**:
   ```bash
   vercel login
   ```

2. **ブラウザで認証URLにアクセス**:
   - コマンドが表示するURLをブラウザで開く
   - 例: `https://vercel.com/oauth/device?user_code=XXXX-XXXX`

3. **認証完了後、デプロイを実行**:
   ```bash
   vercel --prod --yes
   ```

**推奨**: GitHub連携を設定して自動デプロイを利用する方が便利

**関連コマンド**:
```bash
# ログイン状態確認
vercel whoami

# プロジェクト情報確認
vercel project ls

# デプロイ履歴確認
vercel ls
```

---

## SimpleCalculator 実装時のトラブル

### 問題: JSX Adjacent Elements Error

**発生日**: 2025-10-20

**エラー内容**:
```
Adjacent JSX elements must be wrapped in an enclosing tag
```

**場所**: `src/pages/Home.tsx` (line 225)

**原因**:
- SimpleCalculator を Home ページに統合する際、ternary operator の構造が不適切
- 特に grid container `<div>` の開始タグが `:` の後に正しく配置されていなかった
- インデントの乱れにより、括弧のマッチングが分かりにくくなっていた

**解決方法**:

1. **ファイル全体を読み込んで構造を確認**:
   ```typescript
   // 正しい構造
   {viewMode === 'calculator' ? (
     <SimpleCalculator />
   ) : (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       {/* ローン計算コンテンツ */}
     </div>
   )}
   ```

2. **インデントを統一**:
   - grid container とその子要素のインデントを揃える
   - 閉じタグの位置を明確にする

3. **Vite dev server を再起動**:
   - HMR (Hot Module Replacement) のキャッシュが古いエラーを表示し続ける場合がある
   - サーバーを再起動することで解決

**手順**:
```bash
# 1. 既存のViteサーバーを停止
# Ctrl+C または kill コマンド

# 2. サーバーを再起動
npm run dev
```

**教訓**:
- ternary operator を使う場合は括弧の対応を慎重に確認
- JSXのネストが深い場合は、インデントを統一して可読性を保つ
- HMRが正しく動作しない場合は、サーバー再起動を試す

---

---

## NISA Calculator 入力フィールドの問題

### 問題: `toFixed()` による入力フィールドの編集不能

**発生日**: 2025-10-21

**症状**:
- 月々の積立額フィールドで数字を削除できない
- キーボードで「10.5」などの小数点を入力できない
- 入力しようとすると値が戻ってしまう

**原因**:
```tsx
// ❌ 問題のあるコード
<input
  type="text"
  value={monthlyAmount.toFixed(1)}  // ← 常にフォーマットされる
  onChange={(e) => {
    const parsed = parseFloat(e.target.value);
    setMonthlyAmount(parsed);
  }}
/>
```

- `value={monthlyAmount.toFixed(1)}` により、入力中も常にフォーマットされる
- 例：「1」と入力 → 即座に「1.0」にフォーマット → 次の文字が入力できない
- 削除時：「10.5」の「0」を消す → `parseFloat("1.5")` → `1.5.toFixed(1)` = "1.5" → 元に戻る

**解決方法: 二重状態管理パターン**

```tsx
// ✅ 解決コード
// 表示用と実数値用の2つの状態を持つ
const [monthlyAmount, setMonthlyAmount] = useState(3);           // 実数値
const [monthlyInputValue, setMonthlyInputValue] = useState('3.0'); // 表示用

// 入力中は表示用状態を自由に更新
const handleMonthlyChange = (value: string) => {
  setMonthlyInputValue(value);  // 即座に表示更新（フォーマットしない）

  // 空文字や小数点のみの場合
  if (value === '' || value === '.') {
    setMonthlyAmount(0.1);
    return;
  }

  // 数値としてパース
  const parsed = parseFloat(value);
  if (!Number.isNaN(parsed)) {
    setMonthlyAmount(clamp(parsed, 0.1, 100));
  }
};

// フォーカスを外した時のみフォーマット
const handleMonthlyBlur = () => {
  setMonthlyInputValue(monthlyAmount.toFixed(1));
};

// JSX
<input
  type="text"
  inputMode="decimal"  // モバイルで数字キーボード
  value={monthlyInputValue}  // 表示用状態を使用
  onChange={(e) => handleMonthlyChange(e.target.value)}
  onBlur={handleMonthlyBlur}  // blur時にフォーマット
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  }}
/>
```

**increment/decrement ボタンでの同期**:

```tsx
const increment = (field: 'monthly' | 'return') => {
  switch (field) {
    case 'monthly':
      setMonthlyAmount(prev => {
        const newVal = clamp(parseFloat((prev + 0.1).toFixed(1)), 0.1, 100);
        setMonthlyInputValue(newVal.toFixed(1)); // 表示も同期
        return newVal;
      });
      break;
    // ...
  }
};
```

**適用箇所**:
- 月々の積立額: `monthlyAmount` / `monthlyInputValue`
- 想定利回り: `annualReturn` / `returnInputValue`
- 積立期間: 通常の状態管理（整数なので問題なし）

**メリット**:
- ✅ ユーザーが自由に編集できる（削除、小数点入力）
- ✅ blur時だけフォーマットされる（10.5 → 10.5、3 → 3.0）
- ✅ increment/decrementボタンは即座にフォーマット
- ✅ `inputMode="decimal"` でモバイル数字キーボード対応

**教訓**:
- `toFixed()` などのフォーマットは `value` に直接使わない
- 入力中は生の値、blur時だけフォーマット
- 表示用と実数値用の状態を分離する

**類似の問題**:
- `toLocaleString()` でカンマ区切りフォーマット
- `replace()` で文字列置換
- その他のフォーマット関数全般

**関連ファイル**:
- `src/components/Investment/InvestmentCalculator.tsx` (line 19-31, 78-99, 120-198)

---

## Vercel ビルドエラー

### 問題: 型エクスポートエラーでビルド失敗

**発生日**: 2025-10-21

**症状**:
- Vercelのビルドが失敗（Build Failed）
- エラー: `Command "npm run build" exited with 2`
- TypeScriptエラー:
  ```
  error TS2305: Module '"@/types"' has no exported member 'AuthState'
  error TS2305: Module '"@/types"' has no exported member 'InvestmentParams'
  error TS2307: Cannot find module 'recharts'
  ```

**原因**:

1. **存在しないファイルからの型エクスポート**
   ```typescript
   // src/types/index.ts
   export type { AuthState, ... } from './auth';  // ❌ auth.ts が存在しない
   ```
   - `src/types/index.ts` が `auth.ts` や `subscription.ts` から型をエクスポート
   - しかし、これらのファイルはGitにコミットされていない（Phase 11以降の予定）
   - ローカル開発環境には存在するが、Vercelにはない

2. **依存関係の未コミット**
   ```json
   // package.json (ローカル変更のみ、未コミット)
   "recharts": "^3.3.0"  // ❌ Gitにコミットされていない
   ```
   - `npm install recharts` 実行済みだが `package.json` 未コミット
   - Vercelが `npm install` 時に recharts をインストールできない

**なぜローカルでは動いていたのか？**
- ローカル: `node_modules/` に recharts がインストール済み、auth.ts も存在
- Vercel: クリーンな環境で `npm install` → recharts なし、auth.ts なし

**解決方法**:

```bash
# 1. src/types/index.ts から存在しない型のエクスポートを削除
# ❌ 削除
export type { AuthState, SignUpParams, ... } from './auth';
export type { SubscriptionState, ... } from './subscription';

# 2. package.json と package-lock.json をコミット
git add package.json package-lock.json src/types/index.ts
git commit -m "fix: Add missing recharts dependency and fix type exports"
git push origin main

# 3. Vercelが自動的に再デプロイ（1〜2分）
```

**教訓**:

1. **依存関係は必ずコミット**
   - `npm install` したら即座に `package.json` をコミット
   - `package-lock.json` も一緒にコミット

2. **型エクスポートは存在確認**
   - `src/types/index.ts` でエクスポートする前に、ファイルが実際に存在するか確認
   - `git ls-files src/types/` で確認

3. **ローカルとリモートの差分を意識**
   - ローカルで動いていても、Vercelで失敗する可能性がある
   - 未コミットファイルは Vercel にデプロイされない

4. **ビルドログを確認**
   - Vercel ダッシュボードの "Build Logs" でエラー詳細を確認
   - TypeScript エラーはビルド時に発見される

**確認コマンド**:

```bash
# コミットされているファイルを確認
git ls-files src/types/

# package.json の差分確認
git diff package.json

# ローカルでビルドテスト（Vercel環境を再現）
rm -rf node_modules
npm ci  # package-lock.json から正確にインストール
npm run build
```

**関連する他のケース**:

- 環境変数が `.env.local` だけで `.env.example` に記載されていない
- `.gitignore` で除外されたファイルに依存している
- `devDependencies` に入れるべきものが `dependencies` にある（または逆）

**デバッグ手順**:

1. Vercel ダッシュボード → 失敗したデプロイメント → "View Build Logs"
2. エラーメッセージから欠けているモジュール/型を特定
3. `git status` で未コミットファイルを確認
4. 必要なファイルをコミット → 自動再デプロイ

---

**最終更新**: 2025-10-21
**バージョン**: 1.7 (✅ Vercelビルドエラー追加)
