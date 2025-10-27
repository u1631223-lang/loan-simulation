/**
 * FeatureGate - Freemium機能制限コンポーネント
 *
 * ユーザーのTierに応じて機能へのアクセスを制御
 */

import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SignupCTA } from './SignupCTA';
import { UpgradeCTA } from './UpgradeCTA';

export type FeatureTier = 'anonymous' | 'authenticated' | 'premium';

interface FeatureGateProps {
  /**
   * 必要なTier
   * - 'authenticated': 登録ユーザー以上
   * - 'premium': プレミアムユーザーのみ
   */
  tier: FeatureTier;

  /**
   * アクセス許可時に表示するコンテンツ
   */
  children: ReactNode;

  /**
   * アクセス拒否時に表示するフォールバックUI
   * 指定しない場合はデフォルトのCTAを表示
   */
  fallback?: ReactNode;

  /**
   * 機能名（CTA表示用）
   */
  featureName?: string;
}

/**
 * FeatureGate コンポーネント
 *
 * @example
 * // 登録ユーザー以上に機能を解放
 * <FeatureGate tier="authenticated" featureName="繰上返済シミュレーション">
 *   <PrepaymentSimulator />
 * </FeatureGate>
 *
 * @example
 * // プレミアムユーザーのみに機能を解放
 * <FeatureGate tier="premium" featureName="ライフプランシミュレーション">
 *   <LifePlanTool />
 * </FeatureGate>
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  tier,
  children,
  fallback,
  featureName = 'この機能',
}) => {
  const { isAnonymous, isPremium, loading } = useAuth();

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Tier判定
  const hasAccess = (() => {
    if (tier === 'authenticated') {
      // 登録ユーザー以上（匿名でなければOK）
      return !isAnonymous;
    }

    if (tier === 'premium') {
      // プレミアムユーザーのみ
      return isPremium;
    }

    // 'anonymous' tier は常にアクセス可能
    return true;
  })();

  // アクセス許可
  if (hasAccess) {
    return <>{children}</>;
  }

  // アクセス拒否 - カスタムfallbackがある場合はそれを表示
  if (fallback) {
    return <>{fallback}</>;
  }

  // デフォルトのCTA表示
  if (tier === 'authenticated') {
    // 匿名ユーザーに登録を促す
    return <SignupCTA featureName={featureName} />;
  }

  if (tier === 'premium') {
    // 登録ユーザーにプレミアムへのアップグレードを促す
    return <UpgradeCTA featureName={featureName} />;
  }

  // 通常ここには来ない
  return null;
};
