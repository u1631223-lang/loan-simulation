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
  // customer_guide: お客様向けのわかりやすい案内
  // how_to_get: どこで・どうやって入手するか
  // who_prepares: 'customer'=お客様, 'contractor'=工事業者, 'both'=両方
  // contractor_guide: 業者向けの案内（何をすればいいか）
  // contractor_timing: いつまでに用意するか
  required_documents: [
    {
      order: 1,
      name: '浄化槽設置届出書の写し又は建築確認検査証及び浄化槽確認書の写し',
      description: '事業期間内に設置届出したもの',
      is_conditional: false,
      customer_guide: '浄化槽を設置するための届出書のコピーです',
      how_to_get: '工事業者が手続きします。届出済みの書類のコピーをもらってください',
      who_prepares: 'contractor' as const,
      contractor_guide: '県に提出した浄化槽設置届出書のコピー、又は建築確認申請時の浄化槽確認書のコピーを用意',
      contractor_timing: '届出後・確認済み後すぐ',
    },
    {
      order: 2,
      name: '位置見取図・設置大系図を含む図面',
      description: '設置場所の地図・配置図',
      is_conditional: false,
      customer_guide: 'お家の敷地のどこに浄化槽を置くか、の図面です',
      how_to_get: '工事業者が作成します。お客様の準備は不要です',
      who_prepares: 'contractor' as const,
      contractor_guide: '案内図（住宅地図等）、配置図（敷地内の浄化槽位置）、設置大系図（配管経路含む）を作成。A4にまとめる',
      contractor_timing: '設計段階で作成',
    },
    {
      order: 3,
      name: '賃貸人の承諾書',
      description: '住宅等を借りている場合に限る',
      is_conditional: true,
      condition_note: '住宅等を借りている場合に限る',
      customer_guide: '借家にお住まいの場合のみ必要です。大家さんの「工事してOK」という書面です',
      how_to_get: '大家さん（家主さん）に書いてもらってください',
      who_prepares: 'customer' as const,
      contractor_guide: 'お客様が借家の場合、大家さんの承諾書が必要。市の様式があるか環境保全課に確認を',
      contractor_timing: '申請前にお客様に依頼',
    },
    {
      order: 4,
      name: '浄化槽工事の見積書又は契約書の写し',
      description: '浄化槽工事業者の見積額がわかるもの',
      is_conditional: false,
      customer_guide: '浄化槽工事の見積もり or 契約書のコピーです',
      how_to_get: '工事業者からもらった見積書・契約書をコピーしてください',
      who_prepares: 'contractor' as const,
      contractor_guide: '自社の見積書又は契約書のコピーを用意。本体・工事費・配管費等の内訳が明記されていること',
      contractor_timing: '契約締結後すぐ',
    },
    {
      order: 5,
      name: '浄化槽法第86条第2号電気関係管理者の届出書の写し',
      description: '電気関係の届出',
      is_conditional: false,
      customer_guide: '浄化槽のブロアー（送風機）等の電気工事に関する届出です',
      how_to_get: '工事業者が手続きします。お客様の準備は不要です',
      who_prepares: 'contractor' as const,
      contractor_guide: 'ブロアー等の電気設備に関する届出（県知事宛て）のコピー。電気工事業者に確認して取得',
      contractor_timing: '工事着手前',
    },
    {
      order: 6,
      name: '浄化槽工事業者の登録証の写し',
      description: '施工業者の登録証明',
      is_conditional: false,
      customer_guide: '工事業者が「ちゃんと登録された業者です」という証明です',
      how_to_get: '工事業者からコピーをもらってください',
      who_prepares: 'contractor' as const,
      contractor_guide: '浄化槽工事業の登録証（県知事登録）のコピーを用意。有効期限内であること確認',
      contractor_timing: '常時準備しておく',
    },
    {
      order: 7,
      name: '浄化槽の維持管理に関する契約書の写し又は誓約書',
      description: '保守点検・清掃の契約',
      is_conditional: false,
      customer_guide: '設置後の点検・お手入れを定期的にやりますよ、という契約書です',
      how_to_get: '保守点検業者と契約するか、工事業者に紹介してもらってください',
      who_prepares: 'both' as const,
      contractor_guide: '保守点検業者（自社 or 提携先）との契約書コピー、又は「法定検査・保守点検・清掃を行う」誓約書を用意。お客様に署名いただく',
      contractor_timing: '工事契約時に一緒に手配',
    },
    {
      order: 8,
      name: '土地の登記事項証明書（発行後3ヶ月以内）',
      description: '設置場所の土地の登記情報',
      is_conditional: false,
      customer_guide: '設置場所の土地が誰のものかを証明する書類です',
      how_to_get: '法務局の窓口 or オンライン（登記ねっと）で取得できます。手数料600円',
      who_prepares: 'customer' as const,
      contractor_guide: 'お客様に取得を依頼。発行後3ヶ月以内のもの。法務局窓口 or オンライン（登記ねっと）で取得可能',
      contractor_timing: '申請の1ヶ月前にお客様に依頼',
    },
    {
      order: 9,
      name: '住民票の写し（発行後3ヶ月以内）',
      description: '申請者の住民票',
      is_conditional: false,
      customer_guide: 'ご本人の住民票です',
      how_to_get: '市役所の窓口 or コンビニ（マイナンバーカード利用）で取得。手数料300円程度',
      who_prepares: 'customer' as const,
      contractor_guide: 'お客様に取得を依頼。発行後3ヶ月以内。マイナンバーカードがあればコンビニ交付可',
      contractor_timing: '申請の1ヶ月前にお客様に依頼',
    },
    {
      order: 10,
      name: '市税の滞納がないことの証明書',
      description: '市税完納証明',
      is_conditional: false,
      customer_guide: '市の税金を滞りなく払っていますよ、という証明です',
      how_to_get: '稲沢市役所の税務課窓口で発行してもらえます。手数料300円程度',
      who_prepares: 'customer' as const,
      contractor_guide: 'お客様に取得を依頼。稲沢市役所 税務課窓口で発行。滞納があると補助金申請不可なので事前確認推奨',
      contractor_timing: '申請の1ヶ月前にお客様に依頼',
    },
    {
      order: 11,
      name: '（一社）全国浄化槽連合会の合併処理浄化槽確認証の写し',
      description: '浄化槽の認定証',
      is_conditional: false,
      customer_guide: '設置する浄化槽が国の基準を満たしている、という認定書です',
      how_to_get: '工事業者が浄化槽メーカーから取り寄せます。お客様の準備は不要です',
      who_prepares: 'contractor' as const,
      contractor_guide: '設置する浄化槽の型式に対応した確認証をメーカー or 代理店から取得。型式適合認定品であること確認',
      contractor_timing: '浄化槽発注時にメーカーに依頼',
    },
    {
      order: 12,
      name: '交付申請書兼同意書（汚水処理施設整備区域外であることの確認）',
      description: '下水道計画区域外であることの確認',
      is_conditional: false,
      customer_guide: 'お住まいの場所が下水道の計画エリア外であることの確認書です',
      how_to_get: '市役所の環境保全課で用紙をもらって記入・提出してください',
      who_prepares: 'customer' as const,
      contractor_guide: '市の環境保全課で用紙を入手し、お客様に記入・押印いただく。下水道計画区域内の場合は補助対象外なので事前に確認必須',
      contractor_timing: '申請準備の最初に確認（区域外であることの確認が最優先）',
    },
    {
      order: 13,
      name: '用紙の大きさは、日本産業規格A4とする',
      description: '※ 備考：用紙サイズの指定',
      is_conditional: false,
      customer_guide: '全ての書類はA4サイズの用紙で提出してください',
      how_to_get: '',
      who_prepares: 'customer' as const,
      contractor_guide: '全書類をA4で統一。図面が大きい場合はA4に折り込む',
      contractor_timing: '',
    },
  ],
  // 解体（撤去）時の追加必要書類
  demolition_documents: [
    {
      order: 14,
      name: '既存浄化槽（便槽）の撤去に係る見積書又は契約書の写し',
      description: '撤去工事の見積もり',
      is_conditional: true,
      condition_note: '既存浄化槽・便槽を撤去する場合',
      customer_guide: '古い浄化槽や便槽を取り壊す工事の見積もりです',
      how_to_get: '解体工事業者から見積書・契約書をもらってください',
      who_prepares: 'contractor' as const,
      contractor_guide: '撤去工事の見積書又は契約書コピーを用意。設置工事と別業者の場合は別途見積もりが必要',
      contractor_timing: '撤去工事の契約時',
    },
    {
      order: 15,
      name: '既存浄化槽（便槽）の撤去前の写真',
      description: '撤去前の現況写真',
      is_conditional: true,
      condition_note: '既存浄化槽・便槽を撤去する場合',
      customer_guide: '工事を始める前の「今の状態」の写真です',
      how_to_get: '工事開始前にスマホで撮影しておいてください。業者にお願いしてもOK',
      who_prepares: 'both' as const,
      contractor_guide: '撤去工事着手前に現況写真を撮影。全景・蓋まわり・内部の3点以上。日付入りが望ましい',
      contractor_timing: '撤去工事の着手前（当日朝でもOK）',
    },
    {
      order: 16,
      name: '既存浄化槽（便槽）の撤去工事完了届',
      description: '撤去工事完了後に提出',
      is_conditional: true,
      condition_note: '既存浄化槽・便槽を撤去する場合（工事完了後）',
      customer_guide: '解体工事が終わったら提出する届出です',
      how_to_get: '工事完了後に市役所の環境保全課に届出してください',
      who_prepares: 'both' as const,
      contractor_guide: '撤去工事完了後、環境保全課へ完了届を提出。完了後の写真（埋め戻し後）も添付するとスムーズ',
      contractor_timing: '撤去工事完了後、速やかに',
    },
  ],
} as const;
