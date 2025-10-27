/**
 * FeatureGateTest - FeatureGateコンポーネントのテストページ
 */

import React from 'react';
import { FeatureGate } from '@/components/Common/FeatureGate';
import { useAuth } from '@/hooks/useAuth';

const FeatureGateTest: React.FC = () => {
  const { tier, isAnonymous, isPremium, user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">FeatureGate テストページ</h1>

      {/* 現在の状態表示 */}
      <div className="bg-gray-100 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">現在の認証状態</h2>
        <div className="space-y-2">
          <p><strong>Tier:</strong> {tier}</p>
          <p><strong>isAnonymous:</strong> {isAnonymous ? '✅ Yes' : '❌ No'}</p>
          <p><strong>isPremium:</strong> {isPremium ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User:</strong> {user?.email || '未ログイン'}</p>
        </div>
      </div>

      {/* テストケース1: 登録ユーザー以上 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          テスト1: 登録ユーザー以上に解放（tier="authenticated"）
        </h2>
        <FeatureGate tier="authenticated" featureName="繰上返済シミュレーション">
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              ✅ 繰上返済シミュレーション
            </h3>
            <p className="text-green-700">
              このコンテンツは登録ユーザー以上に表示されます。
            </p>
          </div>
        </FeatureGate>
      </div>

      {/* テストケース2: プレミアムユーザーのみ */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          テスト2: プレミアムユーザーのみ（tier="premium"）
        </h2>
        <FeatureGate tier="premium" featureName="ライフプランシミュレーション">
          <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-800 mb-2">
              ✨ ライフプランシミュレーション
            </h3>
            <p className="text-purple-700">
              このコンテンツはプレミアムユーザーのみに表示されます。
            </p>
          </div>
        </FeatureGate>
      </div>

      {/* テストケース3: 全員にアクセス可能 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          テスト3: 全員にアクセス可能（FeatureGateなし）
        </h2>
        <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-800 mb-2">
            🏠 住宅ローン計算
          </h3>
          <p className="text-blue-700">
            このコンテンツは全てのユーザーに表示されます（無料版）。
          </p>
        </div>
      </div>

      {/* 説明 */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">
          💡 テスト方法
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-yellow-700">
          <li>匿名状態（未ログイン）: テスト1とテスト2でCTA表示</li>
          <li>ログイン: テスト1が解放、テスト2でアップグレードCTA</li>
          <li>プレミアム: 全て解放（user_metadata.is_premium = true）</li>
        </ol>
      </div>
    </div>
  );
};

export default FeatureGateTest;
