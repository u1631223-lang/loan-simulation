# 🚨 現在の認証問題 (Current Authentication Issues)

**⚠️ このファイルは問題解決後に削除してください (DELETE THIS FILE AFTER RESOLVING THE ISSUE)**

---

## 📋 問題の概要 (Problem Summary)

**症状**: Webサイト経由で登録したユーザーがログインできない
**エラーメッセージ**: "Email not confirmed" (メール未確認)

---

## 🔍 根本原因 (Root Cause)

### タイミング問題 (Timing Issue)

1. **過去の設定状態** (Past Configuration):
   - Supabase Dashboard → Authentication → Email で「Confirm email」がONだった
   - この状態で登録されたユーザーはメール確認が必須

2. **現在の設定状態** (Current Configuration):
   - 「Confirm email」を**OFF**に変更済み
   - 新規登録はメール確認不要になった

3. **問題点** (Issue):
   - **既存ユーザーの確認状態は遡及的に変更されない**
   - 「Confirm email」がONの時に登録されたユーザーは、設定をOFFにしても「未確認」状態のまま残る

---

## 📊 現在のユーザー状況 (Current User Status)

| メールアドレス | 登録方法 | 確認状態 | ログイン可否 |
|--------------|---------|---------|------------|
| `u1_1223@yahoo.co.jp` | Webサイト経由 | ❌ 未確認 | ❌ 不可 |
| `tanimoto.yuichi@panasonic-homes.com` | Supabase Dashboard | ✅ 確認済み | ✅ 可能 |

---

## 🛠️ 解決方法 (Resolution Steps)

### Option 1: CLIスクリプトで既存ユーザーを確認済みにする（推奨）

**新規追加ツール**:
- `scripts/confirm-supabase-user.js`
  - SupabaseのService Role Keyを用いて対象ユーザーの`email_confirmed_at`を更新
  - 複数ユーザーをまとめて処理可能

**事前準備**:
- 環境変数をセット（例: `.env.local`を読み込むか手動でエクスポート）
  ```bash
  export SUPABASE_URL="https://<your-project>.supabase.co"
  export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
  - `SUPABASE_URL` は `VITE_SUPABASE_URL` と同じ値でOK
  - Service Role Keyは**漏洩厳禁**

**実行例**:
```bash
node scripts/confirm-supabase-user.js u1_1223@yahoo.co.jp
```
- 成功するとログに `Confirmation succeeded` が出力され、Supabase Dashboardでも即座に確認済みになる
- 複数メールの場合: `node scripts/confirm-supabase-user.js user1@example.com user2@example.com`

**メリット**:
- 繰り返し手動操作する必要がなく、記録に残せる
- ローカル/CI どちらでも実行可能
- 今後同様の問題が発生した際に再利用できる

---

### Option 2: 既存ユーザーをSupabase Dashboardから手動確認する

**手順**:
1. Supabase Dashboard を開く
2. **Authentication** → **Users** に移動
3. 対象ユーザー（`u1_1223@yahoo.co.jp`）を見つける
4. ユーザー行の右側にある **"..."** メニューをクリック
5. **"Confirm email"** を選択
6. ユーザーが「確認済み」状態になる

**メリット**:
- ブラウザのみで対応できる
- 履歴がSupabase上に残る

---

### Option 3: 新しいアカウントで登録し直す

**手順**:
1. Webサイトの登録画面で新しいメールアドレスを使用
2. 現在「Confirm email」がOFFなので、即座にログイン可能

**メリット**:
- 手動操作不要
- 本番環境での新規ユーザー体験をテストできる

---

## 🎯 影響範囲 (Impact)

### ブロックされている機能テスト
- ✅ Tier 1（匿名）: 影響なし（ログイン不要）
- ❌ Tier 2（無料会員）: テスト不可
  - 繰上返済シミュレーション
  - ローン比較機能
  - クラウド履歴同期
  - CSV/Excel/PDF出力（透かし付き）
- ❌ Tier 3（有料会員）: テスト不可（Stripe未実装に加え、ログインもできない）

---

## ✅ 確認事項 (Verification)

### 設定確認済み (Verified Settings)

**Supabase Dashboard → Authentication → Providers → Email**:
- ✅ Enable email provider: **ON**
- ✅ Confirm email: **OFF** ← 正しく設定済み
- ✅ Secure email change: **ON**

**問題ないが、既存ユーザーは影響を受けない**

---

## 🚀 次のステップ (Next Steps)

1. **即座に**: Option 1 のスクリプトを実行し `u1_1223@yahoo.co.jp` を確認済みにする（実行ログを保存）。ダッシュボード操作を選ぶ場合は Option 2 を使用。
2. ログイン成功を確認し、Supabase Dashboardで `email_confirmed_at` がセットされていることを確認
3. Tier 2 機能をテスト:
   - 繰上返済シミュレーション
   - ローン比較機能
   - クラウド履歴同期
   - PDF/CSV/Excel出力
4. **このファイルを削除する** ✅

---

## 📝 備考 (Notes)

### 今後の予防策
- 「Confirm email」設定を変更する際は、既存ユーザーへの影響を考慮
- テスト環境では最初から「Confirm email: OFF」で運用するのが推奨
- 本番環境では「Confirm email: ON」も検討（スパム防止）

### 関連ドキュメント
- `docs/PHASE-18-SUMMARY.md`: Freemium戦略の全体像
- `docs/PHASE-18-TESTING-GUIDE.md`: 手動テスト手順
- `src/contexts/AuthContext.tsx`: 認証ロジック実装
- `supabase/migrations/*`: データベーススキーマとRLS

---

**作成日**: 2025-10-27
**ステータス**: 🔴 未解決 → Option 1 のスクリプトを実行し、結果を確認してください
**解決後**: ✅ このファイルを削除してください
