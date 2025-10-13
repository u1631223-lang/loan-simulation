# Phase 0 Issues - デプロイ準備と初期リリース

**作成日**: 2025-10-13
**期間**: 2-3日
**目標**: 本番環境デプロイ + 初期ユーザーフィードバック収集

---

## ISSUE-001: Vercelへのデプロイ 🔴 Critical

### メタデータ
- **担当**: メイン開発者
- **期間**: 0.5日
- **優先度**: 🔴 Critical
- **ラベル**: `deployment`, `phase-0`, `infrastructure`
- **Dependencies**: なし

### 目的
住宅ローン電卓を本番環境（Vercel）にデプロイし、一般ユーザーがアクセス可能にする。

### タスク

#### 1. GitHubリポジトリの準備
```bash
# 1. リモートリポジトリが未設定の場合
git remote add origin https://github.com/YOUR_USERNAME/loan-simulation.git

# 2. mainブランチにプッシュ
git push -u origin main

# 3. READMEの確認
# - プロジェクト説明
# - スクリーンショット（オプション）
# - デモURL（デプロイ後に追加）
```

#### 2. Vercelアカウント作成・連携
```bash
# 1. Vercel CLI インストール（未インストールの場合）
npm i -g vercel

# 2. Vercelにログイン
vercel login

# 3. プロジェクトを初期化
vercel

# 質問への回答例:
# ? Set up and deploy "~/dev/loan-simulation"? [Y/n] y
# ? Which scope do you want to deploy to? YOUR_USERNAME
# ? Link to existing project? [y/N] n
# ? What's your project's name? loan-simulation
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n
```

#### 3. 本番デプロイ
```bash
# 本番環境にデプロイ
vercel --prod

# デプロイ完了後、URLが表示される
# 例: https://loan-simulation.vercel.app
```

#### 4. カスタムドメイン設定（オプション）
```bash
# Vercel Dashboard でドメイン追加
# 例: loan-calculator.yourdomain.com

# DNS設定（お名前.com、ムームードメイン等）
# - Aレコード: 76.76.21.21
# - CNAMEレコード: cname.vercel-dns.com
```

#### 5. 環境変数の設定
```bash
# Vercel Dashboard → Settings → Environment Variables

# 現在は不要（Phase 0はフロントエンドのみ）
# Phase 1以降で追加:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_GA_MEASUREMENT_ID
```

#### 6. 動作確認チェックリスト
- [ ] トップページが表示される
- [ ] 借入金額の入力ができる
- [ ] 計算が正常に動作する
- [ ] 結果が表示される
- [ ] 履歴の保存・読み込みができる
- [ ] 履歴の削除ができる
- [ ] レスポンシブデザインが正しく動作（スマホ・タブレット）
- [ ] 逆算機能が動作する

### 完了条件
- [ ] https://loan-simulation.vercel.app（またはカスタムドメイン）でアクセス可能
- [ ] すべてのチェックリスト項目がパス
- [ ] Lighthouse スコア: Performance 90+, Accessibility 90+
- [ ] README.mdにデモURLを追加

### トラブルシューティング

**ビルドエラーが発生した場合**:
```bash
# ローカルで確認
npm run build

# エラー内容を確認して修正
# TypeScriptエラー → 型を修正
# ESLintエラー → ルール違反を修正
```

**デプロイ後に動作しない場合**:
```bash
# Vercel Dashboard → Deployments → Logs で確認
# ブラウザのコンソールエラーを確認（F12）
```

### 参考リンク
- [Vercel Documentation](https://vercel.com/docs)
- [Vite + Vercel](https://vitejs.dev/guide/static-deploy.html#vercel)

---

## ISSUE-002: ErrorBoundaryコンポーネント実装 🟡 High

### メタデータ
- **担当**: サブエージェント推奨
- **期間**: 0.5日
- **優先度**: 🟡 High
- **ラベル**: `component`, `phase-0`, `error-handling`
- **Dependencies**: なし

### 目的
予期しないエラーが発生した際に、ユーザーに適切なフィードバックを提供し、アプリがクラッシュするのを防ぐ。

### タスク

#### 1. ErrorBoundaryコンポーネント作成
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // TODO Phase 2: Sentryに送信
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                エラーが発生しました
              </h1>
              <p className="text-gray-600 mb-6">
                申し訳ございません。予期しないエラーが発生しました。
                ページを再読み込みしてもう一度お試しください。
              </p>
              {this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    エラー詳細（開発者向け）
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ページを再読み込み
                </button>
                <button
                  onClick={this.handleReset}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  トップページに戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 2. App.tsxでErrorBoundaryを適用
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoanProvider } from './contexts/LoanContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './pages/Home';
import History from './pages/History';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LoanProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </LoanProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
```

#### 3. 計算エラーのハンドリング強化
```typescript
// src/contexts/LoanContext.tsx（一部）
const calculate = () => {
  try {
    // 入力値のバリデーション
    const errors = validateLoanParams(loanParams);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      // TODO: トーストメッセージで表示（ISSUE-003で実装）
      return;
    }

    // 計算実行
    const result = calculateLoan(loanParams);
    setLoanResult(result);
    addToHistory({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      params: loanParams,
      result,
    });
  } catch (error) {
    console.error('Calculation error:', error);
    // エラーをユーザーに通知
    alert('計算中にエラーが発生しました。入力値を確認してください。');
  }
};
```

### 完了条件
- [ ] ErrorBoundaryコンポーネントが実装されている
- [ ] App.tsxで全体をラップしている
- [ ] エラー発生時に適切なUIが表示される
- [ ] 「再読み込み」ボタンが動作する
- [ ] 「トップページに戻る」ボタンが動作する
- [ ] コンソールにエラーログが出力される
- [ ] TypeScript型エラーがない

### テスト方法
```typescript
// src/pages/Home.tsx に一時的にエラーを追加
const Home = () => {
  // テスト用エラー
  throw new Error('Test error for ErrorBoundary');

  return (
    // ...
  );
};
```

実行後、ErrorBoundaryのUIが表示されることを確認。

---

## ISSUE-003: トーストメッセージシステム実装 🟢 Medium

### メタデータ
- **担当**: サブエージェント推奨
- **期間**: 0.5日
- **優先度**: 🟢 Medium
- **ラベル**: `component`, `phase-0`, `ux`
- **Dependencies**: なし

### 目的
ユーザーの操作に対して、成功・エラー・情報のフィードバックを視覚的に提供し、UXを向上させる。

### タスク

#### 1. Toastコンポーネント作成
```typescript
// src/components/Toast.tsx
import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 ${styles[type]} text-white
        px-6 py-4 rounded-lg shadow-2xl
        flex items-center gap-3
        animate-slide-up max-w-sm
        z-50
      `}
    >
      <span className="text-2xl font-bold">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-2xl leading-none hover:opacity-80 transition-opacity"
        aria-label="閉じる"
      >
        ×
      </button>
    </div>
  );
}
```

#### 2. ToastContext作成
```typescript
// src/contexts/ToastContext.tsx
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Toast, ToastProps } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type: ToastProps['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);

  const showToast = useCallback((message: string, type: ToastProps['type']) => {
    setToast({ message, type });
  }, []);

  const handleClose = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleClose}
          duration={toast.duration}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
```

#### 3. Tailwind CSSアニメーション追加
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
};
```

#### 4. App.tsxでToastProviderを適用
```typescript
// src/App.tsx
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <LoanProvider>
            {/* ... */}
          </LoanProvider>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
```

#### 5. 各機能にトースト追加

**計算成功時**:
```typescript
// src/contexts/LoanContext.tsx
import { useToast } from './ToastContext';

export function LoanProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();

  const calculate = () => {
    try {
      // ... 計算処理
      setLoanResult(result);
      addToHistory(historyItem);
      showToast('計算が完了しました', 'success');
    } catch (error) {
      showToast('計算中にエラーが発生しました', 'error');
    }
  };

  const clearHistory = () => {
    storage.clearHistory();
    setHistory([]);
    showToast('履歴を削除しました', 'info');
  };
};
```

**履歴読み込み時**:
```typescript
// src/components/History/HistoryList.tsx
const handleLoadHistory = (item: HistoryItem) => {
  loadFromHistory(item);
  showToast('履歴を読み込みました', 'info');
  navigate('/');
};
```

### 完了条件
- [ ] Toastコンポーネントが実装されている
- [ ] ToastContextが実装されている
- [ ] App.tsxでToastProviderをラップしている
- [ ] 計算成功時にトーストが表示される
- [ ] 履歴削除時にトーストが表示される
- [ ] 履歴読み込み時にトーストが表示される
- [ ] エラー時にトーストが表示される
- [ ] 3秒後に自動で消える
- [ ] スライドアニメーションが動作する
- [ ] 「×」ボタンで手動で閉じられる

### テスト方法
```typescript
// ボタンを追加してテスト
<button onClick={() => showToast('テストメッセージ', 'success')}>
  Success Toast
</button>
<button onClick={() => showToast('エラーメッセージ', 'error')}>
  Error Toast
</button>
<button onClick={() => showToast('情報メッセージ', 'info')}>
  Info Toast
</button>
```

---

## ISSUE-004: プライバシーポリシー・利用規約作成 🟡 High

### メタデータ
- **担当**: メイン開発者
- **期間**: 0.5日
- **優先度**: 🟡 High
- **ラベル**: `legal`, `phase-0`, `content`
- **Dependencies**: なし

### 目的
法的要件を満たし、ユーザーに安心して利用してもらうための文書を用意する。モバイルアプリ申請にも必須。

### タスク

#### 1. プライバシーポリシー作成
```html
<!-- public/privacy-policy.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>プライバシーポリシー - 住宅ローン電卓</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="max-w-4xl mx-auto py-12 px-4">
    <h1 class="text-3xl font-bold mb-8">プライバシーポリシー</h1>

    <div class="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <section>
        <h2 class="text-xl font-semibold mb-3">1. はじめに</h2>
        <p class="text-gray-700">
          住宅ローン電卓（以下「本サービス」）は、ユーザーのプライバシーを尊重し、
          個人情報の保護に努めます。本プライバシーポリシーは、本サービスにおける
          個人情報の取り扱いについて説明します。
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">2. 収集する情報</h2>
        <p class="text-gray-700 mb-2">
          本サービスは、以下の情報を収集する場合があります:
        </p>
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          <li>計算に使用した金額・期間等の入力値（ブラウザのローカルストレージに保存）</li>
          <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
          <li>Google Analyticsによる匿名の利用統計</li>
        </ul>
        <p class="text-gray-700 mt-2">
          <strong>重要</strong>: 本サービスは、氏名・メールアドレス等の個人を特定できる
          情報は収集しません。
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">3. 情報の利用目的</h2>
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          <li>サービスの提供・運営</li>
          <li>サービスの改善・新機能の開発</li>
          <li>利用状況の分析</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">4. 情報の保存場所</h2>
        <p class="text-gray-700">
          計算履歴は、ユーザーのブラウザのローカルストレージに保存されます。
          サーバーへの送信は行いません。履歴は、ブラウザのキャッシュを削除することで
          消去できます。
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">5. Cookie・トラッキング技術</h2>
        <p class="text-gray-700">
          本サービスは、Google Analyticsを使用して匿名の利用統計を収集しています。
          Cookieを無効にすることで、トラッキングを拒否できます。
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">6. 第三者への提供</h2>
        <p class="text-gray-700">
          本サービスは、法令に基づく場合を除き、ユーザーの情報を第三者に提供しません。
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">7. プライバシーポリシーの変更</h2>
        <p class="text-gray-700">
          本ポリシーは予告なく変更される場合があります。変更後は、本ページに掲載します。
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">8. お問い合わせ</h2>
        <p class="text-gray-700">
          プライバシーポリシーに関するご質問は、以下までお問い合わせください。<br>
          Email: support@yourdomain.com
        </p>
      </section>

      <p class="text-sm text-gray-500 mt-8">
        最終更新日: 2025年10月13日
      </p>
    </div>

    <div class="mt-8 text-center">
      <a href="/" class="text-blue-600 hover:underline">トップページに戻る</a>
    </div>
  </div>
</body>
</html>
```

#### 2. 利用規約作成
```html
<!-- public/terms-of-service.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>利用規約 - 住宅ローン電卓</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="max-w-4xl mx-auto py-12 px-4">
    <h1 class="text-3xl font-bold mb-8">利用規約</h1>

    <div class="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <section>
        <h2 class="text-xl font-semibold mb-3">第1条（適用）</h2>
        <p class="text-gray-700">
          本規約は、本サービスの利用に関する条件を定めるものです。
          ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">第2条（サービスの内容）</h2>
        <p class="text-gray-700">
          本サービスは、住宅ローンの返済計算を行うツールを提供します。
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">第3条（免責事項）</h2>
        <p class="text-gray-700 mb-2">
          本サービスは、計算結果の正確性について保証しません。
          実際のローン契約にあたっては、金融機関にご確認ください。
        </p>
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          <li>計算結果に起因する損害について、一切の責任を負いません</li>
          <li>サービスの中断・終了による損害について、責任を負いません</li>
          <li>バグ・不具合による計算ミスについて、責任を負いません</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">第4条（禁止事項）</h2>
        <p class="text-gray-700 mb-2">
          ユーザーは、以下の行為を行ってはなりません:
        </p>
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          <li>サービスの不正利用</li>
          <li>サーバーへの過度な負荷をかける行為</li>
          <li>リバースエンジニアリング、逆コンパイル</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">第5条（利用規約の変更）</h2>
        <p class="text-gray-700">
          本規約は予告なく変更される場合があります。変更後は、本ページに掲載します。
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">第6条（準拠法・管轄裁判所）</h2>
        <p class="text-gray-700">
          本規約は日本法に準拠します。本サービスに関する紛争は、
          東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </section>

      <p class="text-sm text-gray-500 mt-8">
        最終更新日: 2025年10月13日
      </p>
    </div>

    <div class="mt-8 text-center">
      <a href="/" class="text-blue-600 hover:underline">トップページに戻る</a>
    </div>
  </div>
</body>
</html>
```

#### 3. Footerにリンク追加
```typescript
// src/components/Layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2025 住宅ローン電卓. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="/privacy-policy.html"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              プライバシーポリシー
            </a>
            <a
              href="/terms-of-service.html"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              利用規約
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

### 完了条件
- [ ] `public/privacy-policy.html` が作成されている
- [ ] `public/terms-of-service.html` が作成されている
- [ ] Footerにリンクが追加されている
- [ ] リンクをクリックすると別タブで開く
- [ ] スマホでも読みやすいレイアウト
- [ ] メールアドレス・更新日を正しく記載

---

## ISSUE-005: Google Analytics設定 🟢 Medium

### メタデータ
- **担当**: サブエージェント推奨
- **期間**: 0.25日
- **優先度**: 🟢 Medium
- **ラベル**: `analytics`, `phase-0`, `infrastructure`
- **Dependencies**: ISSUE-001（デプロイ完了後）

### 目的
ユーザー行動を分析し、サービス改善のためのデータを収集する。

### タスク

#### 1. Google Analytics アカウント作成
1. [Google Analytics](https://analytics.google.com/) にアクセス
2. 「測定を開始」をクリック
3. プロパティ名: 「住宅ローン電卓」
4. レポートのタイムゾーン: 日本
5. 通貨: 日本円（JPY）
6. データストリーム（ウェブ）追加
7. 測定IDをコピー（例: G-XXXXXXXXXX）

#### 2. 環境変数設定
```bash
# .env.local
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

```bash
# Vercel Dashboard → Settings → Environment Variables
# Name: VITE_GA_MEASUREMENT_ID
# Value: G-XXXXXXXXXX
```

#### 3. GA4パッケージインストール
```bash
npm install react-ga4
```

#### 4. analytics.ts実装
```typescript
// src/lib/analytics.ts
import ReactGA from 'react-ga4';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (MEASUREMENT_ID) {
    ReactGA.initialize(MEASUREMENT_ID, {
      gaOptions: {
        anonymizeIp: true, // IP匿名化
      },
    });
    console.log('Google Analytics initialized');
  } else {
    console.warn('GA Measurement ID not found');
  }
};

// ページビュー送信
export const trackPageView = (path: string) => {
  if (MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

// イベント送信
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// 計算イベント
export const trackCalculation = (params: {
  principal: number;
  years: number;
  months: number;
  interestRate: number;
  repaymentType: string;
  hasBonus: boolean;
}) => {
  trackEvent('Calculation', 'Execute', params.repaymentType, params.principal);
};

// 履歴操作
export const trackHistory = (action: 'save' | 'load' | 'delete') => {
  trackEvent('History', action);
};
```

#### 5. App.tsxで初期化
```typescript
// src/App.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from './lib/analytics';

function App() {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    // ...
  );
}
```

#### 6. 各機能にトラッキング追加
```typescript
// src/contexts/LoanContext.tsx
import { trackCalculation, trackHistory } from '../lib/analytics';

const calculate = () => {
  // ... 計算処理
  trackCalculation({
    principal: loanParams.principal,
    years: loanParams.years,
    months: loanParams.months,
    interestRate: loanParams.interestRate,
    repaymentType: loanParams.repaymentType,
    hasBonus: loanParams.bonusPayment?.enabled || false,
  });
};

const addToHistory = (item: HistoryItem) => {
  // ... 履歴保存
  trackHistory('save');
};
```

### 完了条件
- [ ] Google Analytics アカウント作成済み
- [ ] 測定ID取得済み
- [ ] 環境変数設定済み（ローカル・Vercel）
- [ ] analytics.ts実装済み
- [ ] App.tsxで初期化済み
- [ ] ページビューが送信される
- [ ] 計算イベントが送信される
- [ ] 履歴操作イベントが送信される
- [ ] Real-timeレポートで動作確認済み

### 動作確認
1. Vercelにデプロイ
2. Google Analytics → レポート → リアルタイム
3. サイトにアクセスしてアクティブユーザーが表示されるか確認
4. 計算を実行して「イベント」に表示されるか確認

---

## Phase 0 完了チェックリスト

### 必須タスク（Must Have）
- [ ] **ISSUE-001**: Vercelデプロイ完了
- [ ] **ISSUE-002**: ErrorBoundary実装
- [ ] **ISSUE-004**: プライバシーポリシー・利用規約作成
- [ ] 全機能がプロダクションで動作

### 推奨タスク（Should Have）
- [ ] **ISSUE-003**: トーストメッセージ実装
- [ ] **ISSUE-005**: Google Analytics設定
- [ ] Lighthouseスコア90以上

### オプション（Nice to Have）
- [ ] OGP画像設定（SNSシェア用）
- [ ] Faviconカスタマイズ
- [ ] README.mdにバッジ追加

### 最終確認
- [ ] PC・タブレット・スマホで動作確認
- [ ] Chrome・Safari・Firefoxで動作確認
- [ ] 計算結果が正確（テストケースと一致）
- [ ] 履歴が正しく保存・読み込み
- [ ] エラー時に適切なメッセージ表示

---

## サブエージェントへの依頼テンプレート

### ISSUE-002の依頼例
```
あなたはReact + TypeScriptの専門家です。
ISSUE-002「ErrorBoundaryコンポーネント実装」を実装してください。

【要件】
- Reactクラスコンポーネントでエラーを捕捉
- エラー発生時に適切なUIを表示
- 「再読み込み」「トップに戻る」ボタンを提供
- コンソールにエラーログを出力

【制約】
- TypeScript strictモード準拠
- Tailwind CSSでスタイリング
- レスポンシブ対応

【ファイル】
- 作成: src/components/ErrorBoundary.tsx
- 編集: src/App.tsx（ErrorBoundaryでラップ）

【完了条件】
- [ ] エラー発生時にUIが表示される
- [ ] ボタンが正しく動作する
- [ ] 型エラーがない

【参考】
- 既存スタイル: src/components/Layout/Header.tsx

上記ドキュメントの「ISSUE-002」セクションを参考に実装してください。
```

---

**最終更新**: 2025-10-13
**次のステップ**: ISSUE-001からスタート
