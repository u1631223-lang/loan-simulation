/**
 * CheckEmail - メール確認案内ページ
 *
 * 新規登録後に確認メールの案内を表示
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  email?: string;
}

const CheckEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = (location.state as LocationState) ?? {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white shadow-lg rounded-lg p-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 12.713l-11.99-7.21c.004-.148.02-.295.05-.439.2-.977.945-1.77 1.91-1.996.197-.047.398-.068.6-.068h19.8c.202 0 .403.021.6.068.965.226 1.71 1.019 1.91 1.996.03.144.046.291.05.439L12 12.713zm0 2.287L.01 7.789 0 18c0 .942.658 1.757 1.553 1.959.197.044.399.066.602.066h19.69c.203 0 .405-.022.602-.066.895-.202 1.553-1.017 1.553-1.959l-.01-10.211L12 15z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">確認メールを送信しました</h2>
          <p className="text-gray-600">
            {email
              ? `「${email}」宛に確認メールを送信しました。`
              : 'ご登録いただいたメールアドレス宛に確認メールを送信しました。'}
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <p>ログインする前に、以下の手順をご確認ください。</p>
          <ol className="list-decimal list-inside space-y-2 text-left">
            <li>受信トレイに届いたメールを開きます。</li>
            <li>「メールアドレスを確認」ボタン、または記載されたリンクをクリックしてください。</li>
            <li>ブラウザでアプリが開いたらログインをお試しください。</li>
          </ol>
          <p>
            メールが届かない場合は迷惑メールフォルダをご確認のうえ、
            数分待っても届かない場合は再度登録するかサポートまでご連絡ください。
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ログインページへ戻る
          </button>
          <div className="text-center text-xs text-gray-500 space-y-2">
            <p>
              別のメールアドレスで登録し直す場合は{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:underline"
              >
                新規登録ページ
              </button>
              {' '}にお進みください。
            </p>
            <p>
              サポートが必要な場合は、お手数ですが運営担当までご連絡ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
