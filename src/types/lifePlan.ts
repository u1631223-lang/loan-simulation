/**
 * ライフプランシミュレーションの型定義
 */

// ライフイベントのタイプ
export type LifeEventType =
  | 'marriage'      // 結婚
  | 'birth'         // 出産
  | 'education'     // 教育（入学・卒業）
  | 'car'           // 車購入
  | 'housing'       // 住宅購入
  | 'retirement'    // 退職
  | 'other';        // その他

// ライフイベント
export interface LifeEvent {
  id: string;
  lifePlanId: string;
  eventType: LifeEventType;
  eventName: string;
  year: number;
  amount?: number;
  notes?: string;
  createdAt?: string;
}

// ライフイベント作成パラメータ
export interface CreateLifeEventParams {
  lifePlanId: string;
  eventType: LifeEventType;
  eventName: string;
  year: number;
  amount?: number;
  notes?: string;
}

// ライフイベント更新パラメータ
export interface UpdateLifeEventParams {
  eventType?: LifeEventType;
  eventName?: string;
  year?: number;
  amount?: number;
  notes?: string;
}

// ライフプラン
export interface LifePlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startYear: number;
  endYear: number;
  createdAt: string;
  updatedAt: string;
}

// ライフプラン作成パラメータ
export interface CreateLifePlanParams {
  name: string;
  description?: string;
  startYear: number;
  endYear: number;
}

// ライフプラン更新パラメータ
export interface UpdateLifePlanParams {
  name?: string;
  description?: string;
  startYear?: number;
  endYear?: number;
}

// 年次キャッシュフロー
export interface CashFlow {
  id: string;
  lifePlanId: string;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  balance: number;
  createdAt?: string;
}

// キャッシュフロー計算パラメータ
export interface CashFlowParams {
  lifePlanId: string;
  year: number;
  income: number;
  expenses: number;
  savings: number;
}

// ライフイベントのカテゴリー情報
export interface LifeEventCategory {
  type: LifeEventType;
  label: string;
  description: string;
  icon: string;
  defaultAmount?: number;
}

// イベントタイプのメタデータ
export const LIFE_EVENT_CATEGORIES: Record<LifeEventType, LifeEventCategory> = {
  marriage: {
    type: 'marriage',
    label: '結婚',
    description: '結婚式・新婚旅行などの費用',
    icon: '💍',
    defaultAmount: 3000000, // 300万円
  },
  birth: {
    type: 'birth',
    label: '出産',
    description: '出産費用・準備費用',
    icon: '👶',
    defaultAmount: 500000, // 50万円
  },
  education: {
    type: 'education',
    label: '教育',
    description: '入学金・授業料・学費',
    icon: '🎓',
    defaultAmount: 1000000, // 100万円
  },
  car: {
    type: 'car',
    label: '車購入',
    description: '車両購入費用',
    icon: '🚗',
    defaultAmount: 2500000, // 250万円
  },
  housing: {
    type: 'housing',
    label: '住宅購入',
    description: '住宅購入・頭金・諸費用',
    icon: '🏠',
    defaultAmount: 30000000, // 3000万円
  },
  retirement: {
    type: 'retirement',
    label: '退職',
    description: '退職金・老後資金',
    icon: '🏖️',
    defaultAmount: 0,
  },
  other: {
    type: 'other',
    label: 'その他',
    description: 'その他のライフイベント',
    icon: '📌',
    defaultAmount: 0,
  },
};

// 収入源
export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  startYear: number;
  endYear?: number;
  frequency: 'monthly' | 'annual' | 'one_time';
}

// 支出項目
export interface ExpenseItem {
  id: string;
  category: string;
  name: string;
  amount: number;
  startYear: number;
  endYear?: number;
  frequency: 'monthly' | 'annual' | 'one_time';
  isFixed: boolean;
}

// ライフプランサマリー
export interface LifePlanSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  finalBalance: number;
  eventsCount: number;
  yearsSpan: number;
}

// バリデーション結果
export interface LifePlanValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
