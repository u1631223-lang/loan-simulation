# トラブルシューティング - Troubleshooting Guide

このドキュメントは開発中に発生したエラーと解決方法をまとめています。

---

## 目次

1. [Vite プロジェクト作成時のエラー](#vite-プロジェクト作成時のエラー)
2. [npm test のタイムアウト](#npm-test-のタイムアウト)
3. [TypeScript 診断警告](#typescript-診断警告)
4. [開発サーバー関連](#開発サーバー関連)
5. [Capacitor / モバイル関連](#capacitor--モバイル関連)

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

**最終更新**: 2025-10-12
**バージョン**: 1.1 (Capacitor / モバイル関連を追加)
