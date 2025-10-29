# 有料版機能有効化手順書

## 概要

このドキュメントは、有料版機能（Phase 10-18）の開発完了後、Coming Soon状態から実際の機能に切り替えるための手順をまとめたものです。

**作成日**: 2025-10-30
**対象**: Phase 10-18 開発完了後

---

## 🎯 背景

現在、有料版機能（FPツール）は開発中のため、以下のように Coming Soon ページを表示しています：

- `/household-budget` → Coming Soon
- `/asset-management` → Coming Soon
- `/insurance-planning` → Coming Soon

開発完了後、これらを実際の機能ページに切り替える必要があります。

---

## ✅ 有効化チェックリスト

### 1. App.tsx - ルーティングの有効化

**ファイル**: `src/App.tsx`

#### 変更箇所 1: インポートのコメントを外す

```diff
 import LoanTools from '@/pages/LoanTools';
 import ComingSoon from '@/pages/ComingSoon';
-// Phase 13-14 実装時に有効化（現在は型エラーのため一時的に無効化）
-// import HouseholdBudget from '@/pages/HouseholdBudget';
-// import { AssetManagement } from '@/pages/AssetManagement';
-// import InsurancePlanning from '@/pages/InsurancePlanning';
+import HouseholdBudget from '@/pages/HouseholdBudget';
+import { AssetManagement } from '@/pages/AssetManagement';
+import InsurancePlanning from '@/pages/InsurancePlanning';
 import FeatureGateTest from '@/pages/FeatureGateTest';
```

#### 変更箇所 2: ルーティングの有効化

```diff
       <Route
         path="/loan-tools"
         element={<LoanTools />}
       />

-      {/* 有料版機能 - 開発完了までComing Soonページを表示 */}
-      <Route path="/household-budget" element={<ComingSoon />} />
-      <Route path="/asset-management" element={<ComingSoon />} />
-      <Route path="/insurance-planning" element={<ComingSoon />} />
-
-      {/* Phase 13-14 開発完了後に有効化
+      {/* 有料版機能 - Protected Routes */}
       <Route
         path="/household-budget"
         element={
           <ProtectedRoute>
             <HouseholdBudget />
           </ProtectedRoute>
         }
       />
       <Route
         path="/asset-management"
         element={
           <ProtectedRoute>
             <AssetManagement />
           </ProtectedRoute>
         }
       />
       <Route
         path="/insurance-planning"
         element={
           <ProtectedRoute>
             <InsurancePlanning />
           </ProtectedRoute>
         }
       />
-      */}
```

---

### 2. Header.tsx - ナビゲーションメニューの有効化

**ファイル**: `src/components/Layout/Header.tsx`

#### 変更箇所 1: 変数のコメントを外す

```diff
   const { user, isAuthenticated, signOut } = useAuth();
   const [showUserMenu, setShowUserMenu] = useState(false);
-  // const [showFPMenu, setShowFPMenu] = useState(false); // FPツール開発完了時に有効化
+  const [showFPMenu, setShowFPMenu] = useState(false);
   const [showMobileMenu, setShowMobileMenu] = useState(false);

   const isActive = (path: string) => location.pathname === path;
-  // FPツール開発完了時に有効化
-  // const isFPActive = () => {
-  //   const fpPaths = ['/household-budget', '/asset-management', '/insurance-planning'];
-  //   return fpPaths.includes(location.pathname);
-  // };
+  const isFPActive = () => {
+    const fpPaths = ['/household-budget', '/asset-management', '/insurance-planning'];
+    return fpPaths.includes(location.pathname);
+  };
```

#### 変更箇所 2: デスクトップメニューの有効化

```diff
-              {/* FP Tools Dropdown - 開発完了までコメントアウト */}
-              {/*
               <div className="relative">
                 <button
                   onClick={() => setShowFPMenu(!showFPMenu)}
                   onBlur={() => setTimeout(() => setShowFPMenu(false), 200)}
                   className={`px-3 py-2 rounded-lg transition font-medium text-sm lg:text-base flex items-center gap-1 ${
                     isFPActive()
                       ? 'bg-white text-primary'
                       : 'text-white hover:bg-white/10'
                   }`}
                 >
                   <span className="hidden lg:inline">FPツール</span>
                   <span className="inline lg:hidden">FP</span>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </button>

                 {showFPMenu && (
                   <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                     <Link
                       to="/household-budget"
                       className={`block px-4 py-2 text-sm transition ${
                         isActive('/household-budget')
                           ? 'bg-primary/10 text-primary font-semibold'
                           : 'text-gray-700 hover:bg-gray-100'
                       }`}
                       onClick={() => setShowFPMenu(false)}
                     >
                       💰 家計収支
                     </Link>
                     <Link
                       to="/asset-management"
                       className={`block px-4 py-2 text-sm transition ${
                         isActive('/asset-management')
                           ? 'bg-primary/10 text-primary font-semibold'
                           : 'text-gray-700 hover:bg-gray-100'
                       }`}
                       onClick={() => setShowFPMenu(false)}
                     >
                       📈 資産運用
                     </Link>
                     <Link
                       to="/insurance-planning"
                       className={`block px-4 py-2 text-sm transition ${
                         isActive('/insurance-planning')
                           ? 'bg-primary/10 text-primary font-semibold'
                           : 'text-gray-700 hover:bg-gray-100'
                       }`}
                       onClick={() => setShowFPMenu(false)}
                     >
                       🛡️ 保険設計
                     </Link>
                   </div>
                 )}
               </div>
-              */}
```

#### 変更箇所 3: モバイルメニューの有効化

```diff
-              {/* FP Tools in Mobile - 開発完了までコメントアウト */}
-              {/*
               <div className="border-t border-white/20 pt-2 mt-2">
                 <p className="px-4 py-2 text-sm font-semibold text-white/70">
                   FPツール
                 </p>
                 <Link
                   to="/household-budget"
                   className={`px-4 py-2 rounded-lg transition text-sm ${
                     isActive('/household-budget')
                       ? 'bg-white text-primary font-semibold'
                       : 'text-white hover:bg-white/10'
                   }`}
                   onClick={() => setShowMobileMenu(false)}
                 >
                   💰 家計収支
                 </Link>
                 <Link
                   to="/asset-management"
                   className={`px-4 py-2 rounded-lg transition text-sm ${
                     isActive('/asset-management')
                       ? 'bg-white text-primary font-semibold'
                       : 'text-white hover:bg-white/10'
                   }`}
                   onClick={() => setShowMobileMenu(false)}
                 >
                   📈 資産運用
                 </Link>
                 <Link
                   to="/insurance-planning"
                   className={`px-4 py-2 rounded-lg transition text-sm ${
                     isActive('/insurance-planning')
                       ? 'bg-white text-primary font-semibold'
                       : 'text-white hover:bg-white/10'
                   }`}
                   onClick={() => setShowMobileMenu(false)}
                 >
                   🛡️ 保険設計
                 </Link>
               </div>
-              */}
```

---

### 3. Home.tsx - 資産運用モードの有効化

**ファイル**: `src/pages/Home.tsx`

#### 変更箇所 1: ボタンの有効化

```diff
           {/* 表示モード切り替え */}
-          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-xl mx-auto w-full">
+          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-xl mx-auto w-full">
             <button
               onClick={() => setViewMode('loan')}
               className={viewModeButtonClass('loan')}
             >
               💰 ローン計算
             </button>
             <button
               onClick={() => setViewMode('calculator')}
               className={viewModeButtonClass('calculator')}
             >
               🧮 電卓
             </button>
-            {/* 資産運用モード - 開発完了後に有効化 */}
-            {/*
             <button
               onClick={() => setViewMode('investment')}
               className={viewModeButtonClass('investment')}
             >
               📈 資産運用
             </button>
-            */}
           </div>
```

#### 変更箇所 2: InvestmentCalculatorの有効化

```diff
           {/* メインコンテンツ */}
           {viewMode === 'calculator' && <SimpleCalculator />}
-          {/* 資産運用モード - 開発完了後に有効化 */}
-          {/* {viewMode === 'investment' && <InvestmentCalculator />} */}
+          {viewMode === 'investment' && <InvestmentCalculator />}
```

---

### 4. Coming Soon ページの削除（オプション）

**ファイル**: `src/pages/ComingSoon.tsx`

有効化後、Coming Soon ページは不要になるため、削除してもOKです（将来的に再利用する可能性がある場合は残しておく）。

```bash
# 削除する場合
rm src/pages/ComingSoon.tsx

# App.tsx から import も削除
# import ComingSoon from '@/pages/ComingSoon';
```

---

## 🧪 テスト手順

有効化後、以下を必ず確認してください：

### 1. ローカルで動作確認

```bash
npm run dev
```

- [ ] Header の FP ツールドロップダウンメニューが表示される
- [ ] FP ツールメニューから各ページに遷移できる
  - [ ] 💰 家計収支 → `/household-budget`
  - [ ] 📈 資産運用 → `/asset-management`
  - [ ] 🛡️ 保険設計 → `/insurance-planning`
- [ ] Home ページの資産運用モードが動作する
- [ ] 未ログイン時は ProtectedRoute によりログイン画面にリダイレクトされる
- [ ] ログイン後、FP ツールページが正常に表示される

### 2. ビルドテスト

```bash
npm run build
npm run preview
```

- [ ] ビルドエラーがない
- [ ] プレビューで動作確認

### 3. TypeScript チェック

```bash
npm run type-check
```

- [ ] 型エラーがない

### 4. デプロイ前の最終確認

- [ ] すべてのコメントアウトを外した
- [ ] Coming Soon ページへのルーティングを削除した
- [ ] ナビゲーションメニューが正常に動作する
- [ ] 認証フローが正常に動作する

---

## 📝 補足事項

### 認証が必要な機能

有料版機能は `ProtectedRoute` でラップされているため、以下が必要です：

1. **Supabase 認証の設定**
   - Auth が正常に動作していること
   - 環境変数 `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` が設定されていること

2. **Subscription 管理**
   - Stripe との連携が完了していること
   - サブスクリプション状態が正しく判定できること

### Coming Soon ページの再利用

将来的に新機能を追加する際、Coming Soon ページを再利用できます。その場合：

1. `src/pages/ComingSoon.tsx` を残しておく
2. 新機能のルートを追加時に `<ComingSoon />` を一時的に表示

---

## 🚀 デプロイ

有効化とテストが完了したら、Vercel にデプロイします：

```bash
# Git にコミット
git add .
git commit -m "feat: 有料版機能を有効化 (Phase 10-18 完了)"
git push origin main

# Vercel に自動デプロイ（main ブランチへの push で自動実行）
```

---

## ⚠️ ロールバック手順

万が一、有効化後に問題が発生した場合：

1. **即座にロールバック**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **または Coming Soon に戻す**
   - 上記の手順を逆に実行（コメントアウトを戻す）
   - 緊急対応として、`App.tsx` のルートのみ Coming Soon に戻すだけでも OK

---

## ✅ 完了確認

- [ ] すべてのコメントアウトを外した
- [ ] ローカルで動作確認完了
- [ ] ビルド・型チェック通過
- [ ] デプロイ完了
- [ ] 本番環境で動作確認完了

---

**最終更新**: 2025-10-30
**次のステップ**: Phase 10-18 の開発完了後、この手順書に従って有効化してください。
