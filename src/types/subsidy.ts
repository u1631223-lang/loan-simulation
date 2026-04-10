/**
 * 浄化槽補助金管理システムの型定義
 * Septic Tank Subsidy Management System Types
 */

/**
 * 補助金制度カテゴリ
 */
export type SubsidyCategoryType =
  | 'septic_tank_installation'   // 浄化槽設置
  | 'septic_tank_conversion'     // 浄化槽転換（単独→合併）
  | 'tank_removal'               // 既存槽撤去（解体）
  | 'plumbing_work'              // 配管工事
  | 'cesspool_removal'           // くみ取り便槽撤去
  | 'other';

/**
 * カテゴリの日本語ラベル
 */
export const SUBSIDY_CATEGORY_LABELS: Record<SubsidyCategoryType, string> = {
  septic_tank_installation: '浄化槽設置',
  septic_tank_conversion: '浄化槽転換（単独→合併）',
  tank_removal: '既存槽撤去（解体）',
  plumbing_work: '配管工事',
  cesspool_removal: 'くみ取り便槽撤去',
  other: 'その他',
};

/**
 * 申請ステータス
 */
export type ApplicationStatus =
  | 'draft'       // 下書き
  | 'preparing'   // 準備中
  | 'submitted'   // 申請済み
  | 'approved'    // 承認済み
  | 'rejected'    // 却下
  | 'completed';  // 完了（補助金受領済み）

/**
 * ステータスの日本語ラベル
 */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: '下書き',
  preparing: '準備中',
  submitted: '申請済み',
  approved: '承認済み',
  rejected: '却下',
  completed: '完了',
};

/**
 * ステータスの色
 */
export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

/**
 * 撤去タイプ
 */
export type DemolitionType =
  | 'single_tank'   // 単独処理浄化槽撤去
  | 'cesspool'      // くみ取り便槽撤去
  | 'other';

/**
 * 自治体
 */
export interface Municipality {
  id: string;
  name: string;
  prefecture: string;
  region?: string;
  website_url?: string;
  contact_department?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 補助金制度
 */
export interface SubsidyProgram {
  id: string;
  municipality_id: string;
  program_name: string;
  category: SubsidyCategoryType;
  fiscal_year: number;
  application_start?: string;
  application_end?: string;
  budget_total?: number;
  is_active: boolean;
  eligibility_notes?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  municipality?: Municipality;
  amounts?: SubsidyAmount[];
  required_documents?: SubsidyRequiredDocument[];
}

/**
 * 補助金額
 */
export interface SubsidyAmount {
  id: string;
  program_id: string;
  tank_capacity?: number;
  capacity_label?: string;
  subsidy_amount: number;
  max_amount?: number;
  conditions?: string;
  created_at: string;
}

/**
 * 必要書類
 */
export interface SubsidyRequiredDocument {
  id: string;
  program_id: string;
  document_order: number;
  document_name: string;
  description?: string;
  is_conditional: boolean;
  condition_note?: string;
  template_url?: string;
  created_at: string;
}

/**
 * 補助金申請
 */
export interface SubsidyApplication {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  municipality_id?: string;
  status: ApplicationStatus;
  application_date?: string;
  approval_date?: string;
  tank_capacity?: number;
  installation_address?: string;
  estimated_cost?: number;
  total_subsidy?: number;
  has_demolition: boolean;
  demolition_type?: DemolitionType;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  municipality?: Municipality;
  subsidies?: ApplicationSubsidy[];
  documents?: ApplicationDocument[];
}

/**
 * 申請対象補助金
 */
export interface ApplicationSubsidy {
  id: string;
  application_id: string;
  program_id: string;
  amount_id?: string;
  applied_amount: number;
  approved_amount?: number;
  created_at: string;
  // Joined data
  program?: SubsidyProgram;
}

/**
 * 申請書類チェックリスト
 */
export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_id: string;
  is_submitted: boolean;
  submitted_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  required_document?: SubsidyRequiredDocument;
}

/**
 * 補助金計算の入力パラメータ
 */
export interface SubsidyCalculationParams {
  municipality_id: string;
  tank_capacity: number;            // 人槽
  has_demolition: boolean;          // 解体あり
  demolition_type?: DemolitionType; // 撤去タイプ
  has_plumbing: boolean;            // 配管工事あり
  conversion_type: 'new' | 'conversion'; // 新規設置 or 転換
}

/**
 * 補助金計算結果
 */
export interface SubsidyCalculationResult {
  installation_subsidy: number;     // 浄化槽設置補助金
  removal_subsidy: number;          // 撤去（解体）補助金
  plumbing_subsidy: number;         // 配管工事補助金
  total_subsidy: number;            // 合計補助金額
  breakdown: SubsidyBreakdownItem[];
}

/**
 * 補助金内訳
 */
export interface SubsidyBreakdownItem {
  category: SubsidyCategoryType;
  label: string;
  amount: number;
  note?: string;
}

/**
 * 稲沢市の補助金デフォルトデータ
 */
export const INAZAWA_SUBSIDY_DATA = {
  municipality: {
    name: '稲沢市',
    prefecture: '愛知県',
    contact_department: '経済環境部 環境保全課',
    website_url: 'https://www.city.inazawa.aichi.jp/',
  },
  programs: {
    // 合併処理浄化槽設置
    installation: {
      program_name: '浄化槽設置整備事業補助金（設置）',
      category: 'septic_tank_installation' as SubsidyCategoryType,
      amounts: [
        { tank_capacity: 5, capacity_label: '5人槽', subsidy_amount: 332000 },
        { tank_capacity: 7, capacity_label: '6〜7人槽', subsidy_amount: 414000 },
        { tank_capacity: 10, capacity_label: '8〜10人槽', subsidy_amount: 548000 },
      ],
    },
    // 転換（単独→合併）
    conversion: {
      program_name: '浄化槽設置整備事業補助金（転換）',
      category: 'septic_tank_conversion' as SubsidyCategoryType,
      amounts: [
        { tank_capacity: 5, capacity_label: '5人槽', subsidy_amount: 332000 },
        { tank_capacity: 7, capacity_label: '6〜7人槽', subsidy_amount: 414000 },
        { tank_capacity: 10, capacity_label: '8〜10人槽', subsidy_amount: 548000 },
      ],
    },
    // 単独処理浄化槽撤去（解体）
    tank_removal: {
      program_name: '浄化槽設置整備事業補助金（単独処理浄化槽撤去）',
      category: 'tank_removal' as SubsidyCategoryType,
      amounts: [
        { tank_capacity: null, capacity_label: '撤去費', subsidy_amount: 120000, max_amount: 120000 },
      ],
    },
    // くみ取り便槽撤去
    cesspool_removal: {
      program_name: '浄化槽設置整備事業補助金（くみ取り便槽撤去）',
      category: 'cesspool_removal' as SubsidyCategoryType,
      amounts: [
        { tank_capacity: null, capacity_label: '撤去費', subsidy_amount: 90000, max_amount: 90000 },
      ],
    },
    // 配管工事
    plumbing: {
      program_name: '浄化槽設置整備事業補助金（配管工事）',
      category: 'plumbing_work' as SubsidyCategoryType,
      amounts: [
        { tank_capacity: null, capacity_label: '配管工事費', subsidy_amount: 300000, max_amount: 300000 },
      ],
    },
  },
  // 稲沢市の必要書類リスト（画像から読み取り + 一般的な浄化槽補助金申請書類）
  required_documents: [
    { order: 1, name: '浄化槽設置届出書の写し又は建築確認検査証及び浄化槽確認書の写し', description: '事業期間内に設置届出したもの', is_conditional: false },
    { order: 2, name: '位置見取図・設置大系図を含む図面', description: '設置場所の地図・配置図', is_conditional: false },
    { order: 3, name: '賃貸人の承諾書', description: '住宅等を借りている場合に限る', is_conditional: true, condition_note: '住宅等を借りている場合に限る' },
    { order: 4, name: '浄化槽工事の見積書又は契約書の写し', description: '浄化槽工事業者の見積額がわかるもの', is_conditional: false },
    { order: 5, name: '浄化槽法第86条第2号電気関係管理者の届出書の写し', description: '電気関係の届出', is_conditional: false },
    { order: 6, name: '浄化槽工事業者の登録証の写し', description: '施工業者の登録証明', is_conditional: false },
    { order: 7, name: '浄化槽の維持管理に関する契約書の写し又は誓約書', description: '保守点検・清掃の契約', is_conditional: false },
    { order: 8, name: '土地の登記事項証明書（発行後3ヶ月以内）', description: '設置場所の土地の登記情報', is_conditional: false },
    { order: 9, name: '住民票の写し（発行後3ヶ月以内）', description: '申請者の住民票', is_conditional: false },
    { order: 10, name: '市税の滞納がないことの証明書', description: '市税完納証明', is_conditional: false },
    { order: 11, name: '（一社）全国浄化槽連合会の合併処理浄化槽確認証の写し', description: '浄化槽の認定証', is_conditional: false },
    { order: 12, name: '交付申請書兼同意書（汚水処理施設整備区域外であることの確認）', description: '下水道計画区域外であることの確認', is_conditional: false },
    { order: 13, name: '用紙の大きさは、日本産業規格A4とする', description: '※ 備考：用紙サイズの指定', is_conditional: false },
  ],
  // 解体（撤去）時の追加必要書類
  demolition_documents: [
    { order: 14, name: '既存浄化槽（便槽）の撤去に係る見積書又は契約書の写し', description: '撤去工事の見積もり', is_conditional: true, condition_note: '既存浄化槽・便槽を撤去する場合' },
    { order: 15, name: '既存浄化槽（便槽）の撤去前の写真', description: '撤去前の現況写真', is_conditional: true, condition_note: '既存浄化槽・便槽を撤去する場合' },
    { order: 16, name: '既存浄化槽（便槽）の撤去工事完了届', description: '撤去工事完了後に提出', is_conditional: true, condition_note: '既存浄化槽・便槽を撤去する場合（工事完了後）' },
  ],
} as const;
