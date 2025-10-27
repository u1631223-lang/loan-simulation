# Phase 17 セキュリティ対策メモ（作業完了後に必ず削除）

> ⚠️ このディレクトリは誤ってリポジトリに残さないための一時置き場です。対応が完了したら `docs/review` ごと削除してください。

## 実施した対策

- 旧 `supabase/migrations/001_initial_schema.sql` を空ファイル化し、Phase 17 以降は `20250101000000_initial_schema.sql` のみで初期スキーマを構築するよう整理しました。マイグレーション衝突による RLS 無効化リスクを排除しています。
- トリガー関数 `public.handle_new_user` に `SECURITY DEFINER SET search_path = public, pg_temp` を付与し、`search_path` ハイジャックによる特権昇格余地をなくしました。
- `/loan-tools` ルートを `ProtectedRoute` 配下へ移動し、未認証アクセスを遮断しました。

## フォローアップ推奨事項

- 既存環境に適用する場合は `supabase db reset` 等で最新スキーマを再構築し、`SELECT relrowsecurity FROM pg_class WHERE relname = 'income_items';` などで RLS が有効化されていることを確認してください。
- 新規ルート追加時は認証要件と RBAC を再点検し、クライアント側ガードだけに依存しない実装を維持してください。
- 追加した依存パッケージ（`html2canvas` / `jspdf` / `xlsx`）の脆弱性情報を定期的に確認し、必要に応じてバージョンアップしてください。

対応が完了したら、このファイルを含め `docs/review` ディレクトリを削除してください。
