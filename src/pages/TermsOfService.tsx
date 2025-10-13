import React from 'react';
import Container from '@/components/Layout/Container';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container>
        <div className="py-8 prose prose-slate max-w-none">
          <h1>利用規約</h1>
          <p className="text-sm text-gray-500">最終更新日: 2025年10月14日</p>

          <h2>1. はじめに</h2>
          <p>
            本利用規約（以下「本規約」）は、住宅ローン電卓（以下「本サービス」）の利用条件を定めるものです。
            本サービスを利用することにより、ユーザーは本規約に同意したものとみなされます。
          </p>

          <h2>2. サービスの概要</h2>
          <p>本サービスは、住宅ローンの返済額を計算するための無料のウェブアプリケーションです。</p>

          <h3>2.1 主な機能</h3>
          <ul>
            <li>元利均等返済・元金均等返済の計算</li>
            <li>ボーナス払いの計算</li>
            <li>逆算機能（返済額から借入可能額を計算）</li>
            <li>計算履歴の保存（最大20件、ローカル保存）</li>
          </ul>

          <h3>2.2 サービスの性質</h3>
          <p className="font-bold text-orange-600">
            本サービスは、計算結果の参考値を提供するものであり、実際の住宅ローン契約における正確な金額を保証するものではありません。
          </p>

          <h2>3. 禁止事項</h2>
          <p>ユーザーは、以下の行為を行ってはなりません：</p>
          <ul>
            <li>本サービスのサーバーやシステムに過度な負荷をかける行為</li>
            <li>不正アクセスやハッキング行為</li>
            <li>本サービスを違法な目的で使用すること</li>
            <li>他のユーザーや第三者の権利を侵害すること</li>
          </ul>

          <h2>4. 計算結果の免責事項</h2>

          <h3>4.1 参考情報としての提供</h3>
          <p>
            本サービスが提供する計算結果は、あくまで参考情報です。
            実際の住宅ローン契約においては、以下の点にご注意ください：
          </p>
          <ul>
            <li>金融機関によって計算方法や条件が異なる場合があります</li>
            <li>手数料、保証料、団体信用生命保険料などは含まれていません</li>
            <li>変動金利の将来的な変動は反映されていません</li>
            <li>繰り上げ返済などの条件変更は考慮されていません</li>
          </ul>

          <h3>4.2 責任の限定</h3>
          <p className="font-bold text-red-600">
            本サービスの利用により生じたいかなる損害についても、運営者は責任を負いません。
          </p>
          <p className="font-semibold">
            実際の住宅ローン契約の際は、必ず金融機関の提供する正式な情報をご確認ください。
          </p>

          <h2>5. データの取り扱い</h2>

          <h3>5.1 ローカル保存</h3>
          <p>計算履歴は、ユーザーのブラウザ内（ローカルストレージ）にのみ保存されます。</p>

          <h3>5.2 データの消失</h3>
          <p>以下の場合、保存されたデータが消失する可能性があります：</p>
          <ul>
            <li>ブラウザのキャッシュをクリアした場合</li>
            <li>ブラウザを再インストールした場合</li>
            <li>デバイスの故障や交換</li>
          </ul>
          <p>運営者は、データの消失について責任を負いません。重要なデータは別途保存することを推奨します。</p>

          <h2>6. 準拠法と管轄裁判所</h2>
          <p>
            本規約は日本国法に準拠し、本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>

          <h2>7. お問い合わせ</h2>
          <p>本規約に関するご質問やご意見は、以下までお問い合わせください：</p>
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

          <hr className="my-8" />
          <p className="text-sm text-gray-600">本サービスをご利用いただき、ありがとうございます。</p>
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default TermsOfService;
