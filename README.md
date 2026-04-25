# 住宅ローン電卓 — 商談中の暗算をゼロに

住宅営業・独立系FP・IFA のための、無料・登録不要の住宅ローン業務電卓。
お客様の前で「年収から借入可能額」「金利上昇シナリオ」「繰上返済の効果」「NISA との比較」までを 1 画面で即答できます。

[![Deploy](https://img.shields.io/badge/deploy-vercel-success)](https://loan-simulation-eight.vercel.app)
[![Tests](https://img.shields.io/badge/tests-142%20passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-Private-blue)]()

🚀 **本番 URL**: https://loan-simulation-eight.vercel.app

---

## 主な機能

- 🏠 **住宅ローン計算**: 元利均等／元金均等／ボーナス払い対応
- 🔁 **逆算モード**: 月々返済額から借入可能額を計算
- 💼 **年収 MAX 借入額**: 返済負担率 30/35% で自動判定。連帯債務／連帯保証にも対応
- 📊 **返済負担率モード**: 年収と返済額から負担率を直接算出
- ⏱️ **繰上返済シミュレーション**: 期間短縮／返済額軽減を比較
- 📈 **ローン比較**: 最大 5 件の条件を一括比較
- 💹 **NISA 複利シミュレーション**: 繰上返済 vs 投資の比較
- 🧮 **簡易電卓**: 坪計算・税込計算・メモリ機能付き
- 📜 **履歴管理**: localStorage に最大 20 件
- 📲 **PWA 対応**: ホーム画面追加でアプリのように起動。前回入力を自動復元
- 🌐 **完全クライアントサイド**: 個人情報の外部送信なし

## 想定ユーザー

- **Primary**: 独立系 FP、住宅営業担当者、IFA
- **Secondary**: 保険代理店、地方銀行渉外担当
- **個人**: 住宅ローン検討者

## 技術スタック

- **Frontend**: React 18 + Vite 5 + TypeScript（strict）
- **Styling**: Tailwind CSS
- **Charts**: Recharts（遅延読み込み）
- **PDF**: jsPDF + html2canvas（遅延読み込み）
- **Storage**: localStorage（履歴・フォームドラフト）
- **Mobile**: Capacitor（Android / iOS）
- **Testing**: Vitest + React Testing Library（142 tests）
- **Hosting**: Vercel

## クイックスタート

```bash
npm install
npm run dev          # http://localhost:5173
npm run test -- --run
npm run build
```

> ⚠️ `npm run test` は watch モードのため、CI / コマンド実行では必ず `--run` を付けてください。

## ホーム画面に追加（PWA）

iOS Safari / Android Chrome で本番 URL を開き、共有メニューから「ホーム画面に追加」を選択するとアプリとして起動できます。前回入力したローン条件・モード・タブ位置はすべて自動復元されるため、商談を中断しても続きから再開できます。

## 開発の方針（無料版に集中）

- 個人情報の収集・外部送信は行わない
- 認証／課金／クラウド同期は実装しない（必要になった段階で再検討）
- localStorage のみで状態管理し、商談現場での即応性を最優先
- 初期バンドル ~150KB (gzip) を維持（`recharts` / `jspdf` / `xlsx` は遅延読み込み）

## デプロイ

main へのマージで Vercel が自動デプロイします。手動の場合は:

```bash
npm i -g vercel
vercel --prod
```

## ライセンス

Private.
