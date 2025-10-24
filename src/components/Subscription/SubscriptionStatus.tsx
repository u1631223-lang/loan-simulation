/**
 * SubscriptionStatus Component
 * サブスクリプションのステータス表示コンポーネント
 */

import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';

interface SubscriptionStatusProps {
  className?: string;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  className = '',
}) => {
  const {
    subscription,
    isLoading,
    isSubscribed,
    getDaysRemaining,
    getNextBillingDate,
    isCancelScheduled,
    cancel,
  } = useSubscription();

  const [isCanceling, setIsCanceling] = React.useState(false);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
        <p className="text-gray-600">現在サブスクリプションに登録されていません</p>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const nextBillingDate = getNextBillingDate();
  const isCanceled = isCancelScheduled();

  const handleCancel = async () => {
    if (!confirm('本当にサブスクリプションをキャンセルしますか？\n※現在の期間終了まで引き続きご利用いただけます。')) {
      return;
    }

    setIsCanceling(true);
    try {
      await cancel();
      alert('サブスクリプションのキャンセルが完了しました。');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('キャンセルに失敗しました。もう一度お試しください。');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">プレミアムプラン</h3>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            isCanceled
              ? 'bg-orange-100 text-orange-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {isCanceled ? 'キャンセル予定' : '有効'}
        </span>
      </div>

      {/* サブスクリプション詳細 */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">ステータス:</span>
          <span className="font-medium text-gray-900">
            {subscription?.status === 'active' && '有効'}
            {subscription?.status === 'trialing' && 'トライアル中'}
            {subscription?.status === 'past_due' && '支払い期限切れ'}
            {subscription?.status === 'canceled' && 'キャンセル済み'}
          </span>
        </div>

        {nextBillingDate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {isCanceled ? '有効期限:' : '次回請求日:'}
            </span>
            <span className="font-medium text-gray-900">
              {nextBillingDate.toLocaleDateString('ja-JP')}
            </span>
          </div>
        )}

        {daysRemaining !== null && daysRemaining > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">残り日数:</span>
            <span className="font-medium text-gray-900">{daysRemaining}日</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">月額料金:</span>
          <span className="font-medium text-gray-900">¥980</span>
        </div>
      </div>

      {/* キャンセルメッセージ */}
      {isCanceled && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            サブスクリプションは期間終了時（{nextBillingDate?.toLocaleDateString('ja-JP')}）に自動的にキャンセルされます。
            それまでプレミアム機能をご利用いただけます。
          </p>
        </div>
      )}

      {/* アクションボタン */}
      {!isCanceled && (
        <button
          onClick={handleCancel}
          disabled={isCanceling}
          className="w-full px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCanceling ? 'キャンセル中...' : 'サブスクリプションをキャンセル'}
        </button>
      )}
    </div>
  );
};

export default SubscriptionStatus;
