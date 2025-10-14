# Deployment Guide

このドキュメントは、住宅ローン電卓アプリケーションのデプロイメント手順を説明します。

## 📋 目次

1. [事前準備](#事前準備)
2. [Web アプリケーション（Vercel）](#web-アプリケーションvercel)
3. [Android アプリ](#android-アプリ)
4. [iOS アプリ](#ios-アプリ)
5. [トラブルシューティング](#トラブルシューティング)

---

## 事前準備

### 必要な環境

- **Node.js**: v18.0.0 以上
- **npm**: v9.0.0 以上
- **Git**: 最新版

### ビルド前のチェックリスト

```bash
# 1. 依存関係のインストール
npm install

# 2. TypeScript 型チェック
npm run type-check

# 3. ESLint チェック
npm run lint

# 4. テスト実行
npm run test -- --run

# 5. Production ビルド
npm run build

# 6. ビルド結果の確認
ls -lh dist/
```

### ビルド成果物

```
dist/
├── index.html              (468 bytes)
├── assets/
│   ├── index-XXXXXX.css   (~35 KB, gzip: 6.2 KB)
│   └── index-XXXXXX.js    (~239 KB, gzip: 74 KB)
├── privacy-policy.md
└── terms-of-service.md
```

---

## Web アプリケーション（Vercel）

### Vercel へのデプロイ手順

#### 方法 1: Vercel CLI を使用（推奨）

```bash
# 1. Vercel CLI のインストール（初回のみ）
npm i -g vercel

# 2. Vercel にログイン
vercel login

# 3. プロジェクトのセットアップ（初回のみ）
vercel

# 質問への回答例:
# - Set up and deploy "~/dev/loan-simulation"? [Y/n] → Y
# - Which scope do you want to deploy to? → 自分のアカウント
# - Link to existing project? [y/N] → N
# - What's your project's name? → loan-simulation
# - In which directory is your code located? → ./
# - Want to override the settings? [y/N] → N

# 4. 本番環境へデプロイ
vercel --prod
```

#### 方法 2: GitHub と連携（自動デプロイ）

1. **GitHub リポジトリにプッシュ**
   ```bash
   git add .
   git commit -m "feat: Prepare for production deployment"
   git push origin main
   ```

2. **Vercel ダッシュボードで設定**
   - [vercel.com](https://vercel.com/) にアクセス
   - 「New Project」をクリック
   - GitHub リポジトリを選択
   - 「Import」をクリック

3. **設定の確認**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **デプロイ**
   - 「Deploy」をクリック
   - 以降は `main` ブランチへのプッシュで自動デプロイ

### カスタムドメインの設定

Vercel ダッシュボード → Settings → Domains で独自ドメインを追加可能。

```
例: loan-calculator.yourcompany.com
```

---

## Android アプリ

### 前提条件

- **Android Studio**: 最新版（Electric Eel 以降推奨）
- **Java Development Kit**: JDK 11 以上

### ビルド手順

#### 1. Web ビルドとプラットフォーム同期

```bash
# Web アプリをビルドして Android プラットフォームに同期
npm run cap:sync
```

#### 2. Android Studio で開く

```bash
# Android Studio を起動
npm run cap:open:android
```

#### 3. アプリの設定を確認

`android/app/src/main/AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourcompany.loancalculator">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="住宅ローン電卓"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        ...
    </application>
</manifest>
```

#### 4. Debug ビルド（開発用）

Android Studio で:
1. デバイスを選択（エミュレータまたは実機）
2. Run（緑の再生ボタン）をクリック

または CLI で:
```bash
npm run cap:run:android
```

#### 5. Release ビルド（Google Play 配布用）

**署名キーの生成（初回のみ）:**
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**`android/app/build.gradle` に署名設定を追加:**
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('../my-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Release APK/AAB のビルド:**
```bash
cd android
./gradlew assembleRelease    # APK ビルド
./gradlew bundleRelease       # AAB ビルド（推奨）
```

出力先:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Google Play へのアップロード

1. [Google Play Console](https://play.google.com/console/) にアクセス
2. 「アプリを作成」
3. AAB ファイルをアップロード
4. ストアの掲載情報を入力
5. リリース（内部テスト → クローズドテスト → 本番）

**必要な情報:**
- アプリ名: 住宅ローン電卓
- 説明文
- スクリーンショット（最低 2 枚）
- アイコン画像（512x512px）
- プライバシーポリシー URL

---

## iOS アプリ

### 前提条件

- **macOS**: Ventura 以降
- **Xcode**: 14.0 以降
- **Apple Developer Program**: $99/年（配布に必要）

### ビルド手順

#### 1. Web ビルドとプラットフォーム同期

```bash
# Web アプリをビルドして iOS プラットフォームに同期
npm run cap:sync
```

#### 2. Xcode で開く

```bash
# Xcode を起動
npm run cap:open:ios
```

#### 3. アプリの設定を確認

Xcode で:
1. プロジェクトナビゲータから `App` を選択
2. Signing & Capabilities タブ
3. Team を選択（Apple Developer アカウントが必要）
4. Bundle Identifier を設定（例: `com.yourcompany.loancalculator`）

#### 4. シミュレータでテスト

1. デバイスを選択（例: iPhone 15 Pro）
2. Run（⌘R）をクリック

または CLI で:
```bash
npm run cap:run:ios
```

#### 5. 実機でテスト

1. iPhone/iPad を Mac に接続
2. Xcode でデバイスを選択
3. Run（⌘R）をクリック

**注意**: 実機テストには Apple Developer アカウントが必要です。

#### 6. Release ビルド（App Store 配布用）

**アーカイブの作成:**
1. Xcode メニュー → Product → Archive
2. ビルド完了後、Organizer が開く
3. 「Distribute App」をクリック
4. 「App Store Connect」を選択
5. 「Upload」をクリック

### App Store へのアップロード

1. [App Store Connect](https://appstoreconnect.apple.com/) にアクセス
2. 「マイ App」→「+」→「新規 App」
3. 必要情報を入力:
   - プラットフォーム: iOS
   - 名前: 住宅ローン電卓
   - デフォルトの言語: 日本語
   - Bundle ID: `com.yourcompany.loancalculator`
   - SKU: `loan-calculator-ios`

4. App 情報を入力:
   - スクリーンショット（各デバイスサイズ）
   - 説明文
   - キーワード
   - サポート URL
   - プライバシーポリシー URL

5. ビルドを選択してリリース
   - TestFlight（ベータ版配布）
   - 審査申請（本番リリース）

**審査には 1〜3 日程度かかります。**

---

## トラブルシューティング

### ビルドエラー

#### TypeScript エラー
```bash
# 型エラーの確認
npm run type-check

# エラーがある場合は修正してから再ビルド
```

#### ESLint エラー
```bash
# Lint エラーの確認
npm run lint

# 自動修正を試す
npx eslint . --ext ts,tsx --fix
```

### Vercel デプロイエラー

#### ビルドタイムアウト
- Build & Development Settings → Build Command
- タイムアウト設定を延長（Pro プラン以上）

#### 環境変数の設定
- Settings → Environment Variables
- 必要な変数を追加（このプロジェクトでは不要）

### Capacitor 同期エラー

```bash
# キャッシュをクリアして再同期
rm -rf node_modules package-lock.json
npm install
npm run cap:sync
```

### Android ビルドエラー

#### Gradle エラー
```bash
cd android
./gradlew clean
./gradlew build
```

#### SDK バージョンエラー
`android/app/build.gradle` で SDK バージョンを確認:
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        minSdkVersion 22
        targetSdkVersion 34
    }
}
```

### iOS ビルドエラー

#### CocoaPods エラー
```bash
cd ios/App
pod install
```

#### 署名エラー
Xcode → Signing & Capabilities → Team を正しく設定

---

## セキュリティに関する注意

### ビルド成果物の管理

- ✅ `dist/` フォルダは `.gitignore` に含まれています
- ✅ Android/iOS の署名キーは **絶対に** Git にコミットしない
- ✅ `.keystore` ファイルは安全な場所に保管

### デプロイ前のチェックリスト

- [ ] 開発用コンソールログを削除
- [ ] デバッグフラグを無効化
- [ ] API キーやシークレットが含まれていないか確認
- [ ] プライバシーポリシーと利用規約を最新化
- [ ] テストを全て通過している
- [ ] ビルドサイズが適切（全体で 1MB 以下が理想）

---

## 継続的デプロイメント（CI/CD）

### GitHub Actions の例

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## まとめ

このドキュメントに従えば、住宅ローン電卓アプリを以下のプラットフォームにデプロイできます:

1. ✅ **Web アプリ（Vercel）**: 数分で完了
2. ✅ **Android アプリ（Google Play）**: 初回は 1〜2 時間
3. ✅ **iOS アプリ（App Store）**: 初回は 2〜3 時間 + 審査待ち

疑問点があれば、各プラットフォームの公式ドキュメントを参照してください:
- [Vercel Documentation](https://vercel.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
