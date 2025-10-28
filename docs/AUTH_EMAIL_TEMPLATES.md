# Supabase メールテンプレート例

Supabase のデフォルトメールは英語のままなので、日本語運用向けに以下のようなテンプレートへ差し替えてください。変更は Supabase Dashboard → **Authentication → Email Templates** で行えます。

> ⚠️ HTML エディタで直接入力する際は、`{{ }}` で囲まれた Supabase 変数を削除しないよう注意してください。

---

## 1. サインアップ確認メール（Confirm signup）

```html
<h1>住宅ローン電卓にご登録いただきありがとうございます。</h1>
<p>アカウントを有効化するには、以下のボタンをクリックしてください。</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">
    メールアドレスを確認する
  </a>
</p>
<p>ボタンが動作しない場合は、以下のURLをブラウザに貼り付けてください。</p>
<pre style="white-space:pre-wrap;">{{ .ConfirmationURL }}</pre>
<hr />
<p>※ このメールに心当たりがない場合は破棄してください。</p>
```

- `{{ .ConfirmationURL }}` は Supabase が生成する確認リンクです。
- ボタン色などは Tailwind のプライマリカラーに合わせています。

## 2. パスワードリセット（Reset password）

```html
<h1>パスワード再設定のご案内</h1>
<p>以下のボタンからパスワードを再設定してください。</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">
    パスワードを再設定する
  </a>
</p>
<p>リンクの有効期限は 1 時間です。心当たりのない場合は、このメールを破棄してください。</p>
<pre style="white-space:pre-wrap;">{{ .ConfirmationURL }}</pre>
```

## 3. メール変更確認（Change email）

```html
<h1>メールアドレス変更の確認</h1>
<p>メールアドレスの変更を完了するには、以下のボタンをクリックしてください。</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">
    変更を確定する
  </a>
</p>
<hr />
<p>※ 心当たりがない場合はアカウント保護のためサポートまでご連絡ください。</p>
```

---

## Site URL・Redirect URL の確認

テンプレート内で使用される `{{ .SiteURL }}`（または `{{ .ConfirmationURL }}` に含まれる `redirect_to` パラメータ）は、Supabase の **Authentication → URL Configuration** に設定した Site URL/Redirect URLs に基づきます。

- 開発時は `http://localhost:5173`
- 本番はデプロイ先ドメイン（例: `https://loan.example.com`）

Create React App の既定値（`http://localhost:3000`）が残っていると、確認メールから 3000 ポートへ遷移してしまうため、必ず更新してください。

## テスト方法

1. Supabase Dashboard → Authentication → Users → 右上「Invite user」でテストメールを送信
2. またはローカルで `/signup` から登録し、届いたメールを確認
3. リンククリック後に `http://localhost:5173/auth/callback`（または本番ドメイン）へ遷移することを確認

テンプレートを更新した後は、テスト環境で必ず動作を確認してください。
