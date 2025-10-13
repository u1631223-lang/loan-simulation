import React from 'react';
import Container from '@/components/Layout/Container';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container>
        <div className="py-8 prose prose-slate max-w-none">
          <h1>プライバシーポリシー</h1>
          <p className="text-sm text-gray-500">最終更新日: 2025年10月14日</p>

          <h2>1. はじめに</h2>
          <p>
            住宅ローン電卓（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
            本プライバシーポリシーは、本サービスにおける情報の収集、使用、保護について説明します。
          </p>

          <h2>2. 収集する情報</h2>
          <h3>2.1 ユーザーが入力する情報</h3>
          <p>本サービスでは、以下の情報をローカルストレージ（お使いのブラウザ内）に保存します：</p>
          <ul>
            <li>借入金額</li>
            <li>返済期間</li>
            <li>金利</li>
            <li>返済方式（元利均等/元金均等）</li>
            <li>ボーナス払い設定</li>
            <li>計算結果の履歴（最大20件）</li>
          </ul>
          <p className="font-bold text-blue-600">
            重要: これらの情報は完全にお使いのデバイス内に保存され、外部サーバーには一切送信されません。
          </p>

          <h3>2.2 自動的に収集される情報</h3>
          <p>Google Analyticsを使用して、以下の情報を収集する場合があります：</p>
          <ul>
            <li>ページビュー</li>
            <li>使用機能（計算実行、履歴保存など）</li>
            <li>デバイス情報（ブラウザの種類、画面サイズなど）</li>
            <li>アクセス元の地域情報（国・地域レベル）</li>
          </ul>
          <p>これらの情報は統計的な分析のみに使用され、個人を特定することはできません。</p>

          <h2>3. 情報の使用目的</h2>
          <p>収集した情報は以下の目的で使用されます：</p>
          <ul>
            <li>サービスの提供と機能改善</li>
            <li>利用状況の分析</li>
            <li>ユーザー体験の向上</li>
            <li>技術的な問題の診断と修正</li>
          </ul>

          <h2>4. データの削除</h2>
          <p>ユーザーはいつでも以下の方法でデータを削除できます：</p>
          <ul>
            <li>履歴ページから「履歴をクリア」ボタンをクリック</li>
            <li>ブラウザの設定からローカルストレージをクリア</li>
            <li>ブラウザのキャッシュと Cookie を削除</li>
          </ul>

          <h2>5. セキュリティ</h2>
          <p>
            本サービスは、ユーザー情報の保護に努めていますが、インターネット経由の通信やローカルストレージの保存方法に絶対的な安全性はありません。
          </p>
          <p className="font-semibold text-orange-600">
            共有PCや公共の場所で本サービスを使用する場合は、使用後に履歴をクリアすることを推奨します。
          </p>

          <h2>6. お問い合わせ</h2>
          <p>プライバシーポリシーに関するご質問やご意見は、以下までお問い合わせください：</p>
          <p>
            <a
              href="https://github.com/u1631223-lang/loan-simulation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              GitHubリポジトリ
            </a>
          </p>
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
