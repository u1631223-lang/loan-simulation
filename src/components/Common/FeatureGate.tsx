/**
 * FeatureGate - 機能制限なし（全機能開放）
 *
 * 認証撤廃に伴い、常にchildrenを表示する。
 * 既存コンポーネントの互換性を維持。
 */

import React, { ReactNode } from 'react';

export type FeatureTier = 'anonymous' | 'authenticated' | 'premium';

interface FeatureGateProps {
  tier: FeatureTier;
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ children }) => {
  return <>{children}</>;
};
