# Gemini API セットアップガイド

## 概要

このプロジェクトでは、Google Gemini APIを使用してAIによる住宅ローンアドバイスを生成しています。この機能を有効にするには、Gemini APIキーの取得と設定が必要です。

## 前提条件

- Googleアカウント（無料）
- 開発環境（ローカル or Vercel）

## ステップ1: Gemini APIキーの取得

### 1.1 Google AI Studioにアクセス

https://makersuite.google.com/app/apikey にアクセスします。

### 1.2 Googleアカウントでログイン

既存のGoogleアカウントでログインしてください。

### 1.3 APIキーを作成

1. **"Create API Key"** ボタンをクリック
2. 既存のGoogle Cloud Projectを選択するか、新規作成
   - 新規作成の場合: **"Create API key in new project"** を選択
3. APIキーが生成されます（例：`AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`）
4. 📋 **APIキーをコピー** してください（後で使用します）

### 1.4 利用制限の確認

**無料プラン（Gemini API Free Tier）:**
- 料金: **無料**
- リクエスト制限:
  - 60リクエスト/分
  - 1500リクエスト/日
- モデル: `gemini-pro`

**本番環境での注意:**
- 大量アクセスが予想される場合は、Google Cloud Platformでの課金設定を検討してください
- 詳細: https://ai.google.dev/pricing

## ステップ2: ローカル環境での設定

### 2.1 `.env` ファイルの編集

プロジェクトルートの `.env` ファイルを開き、以下を追加します：

```bash
# Google Gemini API Configuration
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ 重要:**
- `VITE_GEMINI_API_KEY=` の後に、コピーしたAPIキーを貼り付けてください
- `.env` ファイルは **絶対にGitにコミットしない** でください（`.gitignore` で除外されています）

### 2.2 開発サーバーの再起動

APIキーを設定したら、開発サーバーを再起動してください：

```bash
# 既存のサーバーを停止（Ctrl+C）
# 再起動
npm run dev
```

### 2.3 動作確認

1. http://localhost:5173 にアクセス
2. ローン条件を入力して「計算する」をクリック
3. 結果画面で **「🤖 AIアドバイス」** ボタンをクリック
4. 数秒後、AIによるアドバイスが表示されることを確認

**成功例:**
```
✅ 安全圏内：この条件であれば比較的安全に返済できる見込みです。

📊 総合評価
年収600万円に対して5000万円の借入は...
```

**失敗例（APIキー未設定）:**
```
⚠️ APIエラーが発生しました
Gemini API キーが設定されていません。.env ファイルに VITE_GEMINI_API_KEY を設定してください。
```

## ステップ3: 本番環境（Vercel）での設定

### 3.1 Vercel Dashboardにログイン

https://vercel.com/dashboard にアクセスしてログインします。

### 3.2 プロジェクトの環境変数を設定

1. プロジェクトを選択
2. **Settings** タブをクリック
3. 左メニューから **Environment Variables** を選択
4. 以下を入力：
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: （コピーしたAPIキー）
   - **Environment**: `Production`, `Preview`, `Development` すべてにチェック
5. **Save** をクリック

### 3.3 再デプロイ

環境変数を追加したら、再デプロイが必要です：

```bash
# ローカルから再デプロイ
git push origin main

# または Vercel Dashboard から "Redeploy" ボタンをクリック
```

### 3.4 本番環境での動作確認

1. デプロイ完了後、本番URLにアクセス
2. ローン計算を実行してAIアドバイスが正常に動作することを確認

## トラブルシューティング

### エラー: "API_KEY_INVALID"

**原因:** APIキーが正しくない、または無効化されています。

**解決策:**
1. Google AI Studioで新しいAPIキーを再生成
2. `.env` ファイルを再確認（余分なスペースがないか確認）
3. 開発サーバーを再起動

### エラー: "RATE_LIMIT"

**原因:** APIの利用制限（60req/分 or 1500req/日）を超えました。

**解決策:**
1. 数分待ってから再試行
2. 大量アクセスが必要な場合は、Google Cloud Platformで課金設定を行う

### AIアドバイスボタンが表示されない

**原因:**
- APIキーが設定されていない（内部で無効化される）
- または、計算結果が表示されていない

**解決策:**
1. `.env` ファイルにAPIキーを追加
2. 開発サーバーを再起動
3. ローン計算を実行してから確認

### パースエラー: "JSON形式のレスポンスが見つかりませんでした"

**原因:** Gemini APIのレスポンスが想定した形式と異なります。

**解決策:**
1. 「再生成」ボタンをクリックして再試行
2. それでも失敗する場合は、プロンプトテンプレートの改善が必要（開発者に報告）

## セキュリティのベストプラクティス

### ✅ DO（推奨）

- APIキーは `.env` ファイルに保存し、**絶対にGitにコミットしない**
- Vercelの環境変数機能を使用する
- APIキーの定期的なローテーション（3-6ヶ月ごと）
- 本番環境では使用量監視を設定

### ❌ DON'T（禁止）

- APIキーをソースコードに直接記述しない
- APIキーを公開リポジトリにコミットしない
- APIキーをクライアントサイドJavaScriptに埋め込まない
- APIキーをメールやSlackで送信しない

## API利用量の監視

Google AI Studioダッシュボードで利用状況を確認できます：

https://makersuite.google.com/app/apikey

- リクエスト数
- エラー率
- レスポンスタイム

## よくある質問（FAQ）

### Q1: Gemini APIは無料ですか？

**A:** はい、無料プラン（Free Tier）があります。
- 60リクエスト/分
- 1500リクエスト/日

大規模なアプリケーションでは、有料プランへのアップグレードを検討してください。

### Q2: APIキーを複数人で共有してもいいですか？

**A:** 開発チーム内での共有は可能ですが、セキュリティ上、各開発者が個別のAPIキーを持つことを推奨します。

### Q3: ローカル開発でAPIキーを使わずにテストできますか？

**A:** はい、AIアドバイス機能はAPIキーが未設定の場合、自動的に無効化されます。他の機能（ローン計算、NISA計算など）は問題なく動作します。

### Q4: Supabaseとの連携は必須ですか？

**A:** いいえ。AIアドバイスはログインなしでも利用できます。Supabaseはアドバイス履歴の保存に使用されますが、オプション機能です。

## 参考リンク

- **Google AI Studio**: https://makersuite.google.com/app/apikey
- **Gemini API Documentation**: https://ai.google.dev/tutorials/get_started_web
- **Pricing**: https://ai.google.dev/pricing
- **Rate Limits**: https://ai.google.dev/docs/rate_limits

## サポート

問題が解決しない場合は、以下を確認してください：

1. `docs/TROUBLESHOOTING.md` - トラブルシューティングガイド
2. GitHub Issues - 既知の問題と解決策
3. プロジェクト管理者への問い合わせ

---

**更新日**: 2025-11-05
**対応バージョン**: v1.0.0以降
