# 📚 Documentation Index

このディレクトリには、住宅ローン電卓 → FPツール統合プラットフォームの全ドキュメントが含まれています。

---

## 🎯 クイックスタート

1. **プロジェクト概要**: [project.md](project.md)
2. **要件定義**: [requirements.md](requirements.md)
3. **技術スタック**: [tech-stack.md](tech-stack.md)
4. **トラブルシューティング**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md) ⚠️ エラー時は必読

---

## 📖 ユーザー向けドキュメント

| ドキュメント | 説明 |
|------------|------|
| [USER_GUIDE.md](USER_GUIDE.md) | エンドユーザー向け使い方ガイド |
| [FAQ.md](FAQ.md) | よくある質問と回答 |
| [LIFEPLAN_CALCULATOR_USAGE.md](LIFEPLAN_CALCULATOR_USAGE.md) | ライフプラン計算機の使い方 |

---

## 🏗️ 開発ドキュメント

### Phase別完了レポート

各Phaseの実装内容と完了報告：

| Phase | ドキュメント | 内容 | ステータス |
|-------|------------|------|----------|
| **Phase 0** | [PHASE0_DETAILED_DESIGN.md](PHASE0_DETAILED_DESIGN.md) | 詳細設計 | ✅ 完了 |
| **Phase 9** | [PHASE9_COMPLETION_REPORT.md](PHASE9_COMPLETION_REPORT.md) | 無料版デプロイ | ✅ 完了 |
| **Phase 11-12** | [PHASE_11_12_COMPLETION.md](PHASE_11_12_COMPLETION.md) | バックエンド基盤構築 | ✅ 完了 |
| **Phase 13** | [PHASE-13-COMPLETE.md](PHASE-13-COMPLETE.md) | ライフプランシミュレーション | ✅ 完了 |
| **Phase 14-17** | [PHASE-14-17-SUMMARY.md](PHASE-14-17-SUMMARY.md) | FP機能実装（家計収支・資産運用・保険設計） | ✅ 完了 |
| **Phase 18** | [PHASE-18-SUMMARY.md](PHASE-18-SUMMARY.md) | Freemium戦略実装 | ✅ 完了 |

### 開発計画

| ドキュメント | 説明 |
|------------|------|
| [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) | 全体開発計画（Phase 1-18） |
| [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) | 開発ロードマップ |
| [TICKETS_FP.md](TICKETS_FP.md) | FP機能チケット一覧 |
| [TICKETS_NISA.md](TICKETS_NISA.md) | NISA機能チケット一覧 |
| [TICKETS_SUMMARY.md](TICKETS_SUMMARY.md) | チケット進捗サマリー |
| [SUBAGENT_GUIDE.md](SUBAGENT_GUIDE.md) | Subagent活用ガイド |

### アーキテクチャ

| ドキュメント | 説明 |
|------------|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | システムアーキテクチャ全体図 |
| [phase0-design.md](phase0-design.md) | Phase 0 設計ドキュメント |
| [phase1-ui-components.md](phase1-ui-components.md) | Phase 1 UIコンポーネント設計 |

---

## 🚀 デプロイメント

| ドキュメント | 説明 |
|------------|------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | デプロイ手順（Vercel） |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | デプロイ前チェックリスト |
| [DEPLOYMENT_SUCCESS_REPORT.md](DEPLOYMENT_SUCCESS_REPORT.md) | デプロイ成功報告 |

---

## 🔧 技術セットアップ

### Supabase

| ドキュメント | 説明 |
|------------|------|
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Supabaseセットアップ手順 |

### 認証 (Supabase Auth)

| ドキュメント | 説明 |
|------------|------|
| [AUTH_SETUP.md](AUTH_SETUP.md) | 認証セットアップ手順 |
| [AUTH_QUICK_START.md](AUTH_QUICK_START.md) | 認証クイックスタート |
| [AUTH_INTEGRATION.md](AUTH_INTEGRATION.md) | 認証統合ガイド |

### 決済 (Stripe)

| ドキュメント | 説明 |
|------------|------|
| [STRIPE_SETUP.md](STRIPE_SETUP.md) | Stripeセットアップ手順 |
| [STRIPE_QUICK_START.md](STRIPE_QUICK_START.md) | Stripeクイックスタート |
| [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) | Stripe統合ガイド |
| [STRIPE_DEPLOYMENT_CHECKLIST.md](STRIPE_DEPLOYMENT_CHECKLIST.md) | Stripeデプロイチェックリスト |

---

## 🧪 機能別ドキュメント

### NISA複利計算機

| ドキュメント | 説明 |
|------------|------|
| [NISA_FEATURE_SPEC.md](NISA_FEATURE_SPEC.md) | NISA機能仕様書 |
| [NISA_IMPLEMENTATION_GUIDE.md](NISA_IMPLEMENTATION_GUIDE.md) | NISA実装ガイド |

---

## 📝 その他

| ドキュメント | 説明 |
|------------|------|
| [AI_API_COMPARISON.md](AI_API_COMPARISON.md) | AI API比較（Gemini vs ChatGPT） |
| [CURRENT_STATUS.md](CURRENT_STATUS.md) | 現在のステータス（古い、Phase完了レポート参照） |
| [QUICK-START-PHASE13-14.md](QUICK-START-PHASE13-14.md) | Phase 13-14クイックスタート |

---

## 🗂️ サブディレクトリ

### archive/
過去のドキュメントや廃止された機能のアーカイブ

### issues/
Issue管理用ディレクトリ

### review/
レビュー用ドキュメント

---

## 📋 ドキュメント作成・更新ルール

1. **Phase完了時**: `PHASE-XX-SUMMARY.md` を作成（個別チケットは含めない）
2. **機能追加時**: 既存のPhaseサマリーに追記、または新規ドキュメント作成
3. **バグ修正時**: `TROUBLESHOOTING.md` に追記
4. **セットアップ手順追加時**: 該当する `*_SETUP.md` に追記
5. **個別チケットファイルは作成しない**: Phase サマリーに統合

---

## 🔍 ドキュメント検索Tips

**Phase別の実装内容を知りたい**:
→ `PHASE-XX-SUMMARY.md` を参照

**機能の使い方を知りたい**:
→ `USER_GUIDE.md` または `*_USAGE.md` を参照

**エラーが発生した**:
→ `TROUBLESHOOTING.md` を参照（必読！）

**セットアップ手順を知りたい**:
→ `*_SETUP.md` または `*_QUICK_START.md` を参照

**開発計画を知りたい**:
→ `DEVELOPMENT_PLAN.md` または `DEVELOPMENT_ROADMAP.md` を参照

**技術的詳細を知りたい**:
→ `tech-stack.md` または `ARCHITECTURE.md` を参照

---

## 📊 プロジェクト進捗

| Phase | 内容 | ステータス |
|-------|------|----------|
| Phase 1-9 | 無料版（住宅ローン計算機） | ✅ 完了・デプロイ済み |
| Phase 10 | ユーザードキュメント整備 | ✅ 完了 |
| Phase 11-12 | バックエンド基盤構築（Supabase + Stripe） | ✅ 完了 |
| Phase 13 | ライフプランシミュレーション | ✅ 完了 |
| Phase 14 | 家計収支管理 | ✅ 完了 |
| Phase 15 | 資産運用シミュレーション | ✅ 完了 |
| Phase 16 | 保険設計シミュレーション | ✅ 完了 |
| Phase 17 | バグ修正とリファクタリング | ✅ 完了 |
| Phase 18 | Freemium戦略実装 | ✅ 完了 |
| Phase 19 | Advanced Features (AI, White-label) | 🔜 計画中 |
| Phase 20 | Enterprise Features (SSO, API) | 🔜 計画中 |

**現在の完成度**: 約 90%（Phase 18 完了）

---

## 🎉 主要マイルストーン

- **2025-10-13**: Phase 9 完了、無料版デプロイ
- **2025-10-20**: Phase 11-12 完了、Supabase + Stripe 統合
- **2025-10-25**: Phase 13-16 完了、全FP機能実装
- **2025-10-26**: Phase 18 完了、Freemium戦略実装

---

**Next**: Phase 19 (Advanced Features) - AI機能追加、ホワイトラベル対応

**Contact**: プロジェクトに関する質問は、GitHubのIssuesまで
