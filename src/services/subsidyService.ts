/**
 * Subsidy Service - 浄化槽補助金のSupabase CRUD操作
 *
 * 自治体の補助金制度データと顧客申請の管理
 */

import { supabase } from '@/lib/supabase';
import type {
  Municipality,
  SubsidyProgram,
  SubsidyAmount,
  SubsidyRequiredDocument,
  SubsidyApplication,
  ApplicationSubsidy,
  ApplicationDocument,
  ApplicationStatus,
} from '@/types/subsidy';

// ============================================================
// 自治体マスタ
// ============================================================

export async function getMunicipalities(): Promise<Municipality[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('municipalities')
    .select('*')
    .order('prefecture', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getMunicipalityByName(
  name: string,
  prefecture: string
): Promise<Municipality | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('municipalities')
    .select('*')
    .eq('name', name)
    .eq('prefecture', prefecture)
    .single();
  if (error) return null;
  return data;
}

export async function upsertMunicipality(
  municipality: Omit<Municipality, 'id' | 'created_at' | 'updated_at'>
): Promise<Municipality | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('municipalities')
    .upsert(municipality, { onConflict: 'name,prefecture' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// 補助金制度
// ============================================================

export async function getSubsidyPrograms(
  municipalityId: string,
  fiscalYear?: number
): Promise<SubsidyProgram[]> {
  if (!supabase) return [];
  let query = supabase
    .from('subsidy_programs')
    .select(`
      *,
      municipality:municipalities(*),
      amounts:subsidy_amounts(*),
      required_documents:subsidy_required_documents(*)
    `)
    .eq('municipality_id', municipalityId)
    .eq('is_active', true);

  if (fiscalYear) {
    query = query.eq('fiscal_year', fiscalYear);
  }

  const { data, error } = await query.order('category');
  if (error) throw error;
  return data || [];
}

export async function createSubsidyProgram(
  program: Omit<SubsidyProgram, 'id' | 'created_at' | 'updated_at' | 'municipality' | 'amounts' | 'required_documents'>
): Promise<SubsidyProgram | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('subsidy_programs')
    .insert(program)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// 補助金額
// ============================================================

export async function createSubsidyAmounts(
  amounts: Omit<SubsidyAmount, 'id' | 'created_at'>[]
): Promise<SubsidyAmount[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('subsidy_amounts')
    .insert(amounts)
    .select();
  if (error) throw error;
  return data || [];
}

// ============================================================
// 必要書類
// ============================================================

export async function createRequiredDocuments(
  docs: Omit<SubsidyRequiredDocument, 'id' | 'created_at'>[]
): Promise<SubsidyRequiredDocument[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('subsidy_required_documents')
    .insert(docs)
    .select();
  if (error) throw error;
  return data || [];
}

export async function getRequiredDocuments(
  programId: string
): Promise<SubsidyRequiredDocument[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('subsidy_required_documents')
    .select('*')
    .eq('program_id', programId)
    .order('document_order');
  if (error) throw error;
  return data || [];
}

// ============================================================
// 顧客補助金申請
// ============================================================

export async function getApplications(
  status?: ApplicationStatus
): Promise<SubsidyApplication[]> {
  if (!supabase) return [];
  let query = supabase
    .from('subsidy_applications')
    .select(`
      *,
      municipality:municipalities(*),
      subsidies:application_subsidies(
        *,
        program:subsidy_programs(*)
      ),
      documents:application_documents(
        *,
        required_document:subsidy_required_documents(*)
      )
    `);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getApplicationById(
  id: string
): Promise<SubsidyApplication | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('subsidy_applications')
    .select(`
      *,
      municipality:municipalities(*),
      subsidies:application_subsidies(
        *,
        program:subsidy_programs(*)
      ),
      documents:application_documents(
        *,
        required_document:subsidy_required_documents(*)
      )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createApplication(
  application: Omit<SubsidyApplication, 'id' | 'created_at' | 'updated_at' | 'municipality' | 'subsidies' | 'documents'>
): Promise<SubsidyApplication | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('subsidy_applications')
    .insert(application)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateApplication(
  id: string,
  updates: Partial<Omit<SubsidyApplication, 'id' | 'created_at' | 'updated_at' | 'municipality' | 'subsidies' | 'documents'>>
): Promise<SubsidyApplication | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('subsidy_applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('subsidy_applications')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ============================================================
// 申請対象補助金
// ============================================================

export async function addApplicationSubsidy(
  subsidy: Omit<ApplicationSubsidy, 'id' | 'created_at' | 'program'>
): Promise<ApplicationSubsidy | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('application_subsidies')
    .insert(subsidy)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// 申請書類チェックリスト
// ============================================================

export async function updateDocumentStatus(
  id: string,
  isSubmitted: boolean,
  submittedDate?: string
): Promise<ApplicationDocument | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('application_documents')
    .update({
      is_submitted: isSubmitted,
      submitted_date: submittedDate || null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createApplicationDocuments(
  docs: Omit<ApplicationDocument, 'id' | 'created_at' | 'updated_at' | 'required_document'>[]
): Promise<ApplicationDocument[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('application_documents')
    .insert(docs)
    .select();
  if (error) throw error;
  return data || [];
}

// ============================================================
// 稲沢市データの初期投入
// ============================================================

export async function seedInazawaData(): Promise<{
  municipality: Municipality | null;
  programs: SubsidyProgram[];
}> {
  if (!supabase) {
    return { municipality: null, programs: [] };
  }

  // 1. 自治体を登録
  const municipality = await upsertMunicipality({
    name: '稲沢市',
    prefecture: '愛知県',
    contact_department: '経済環境部 環境保全課',
    website_url: 'https://www.city.inazawa.aichi.jp/',
  });

  if (!municipality) return { municipality: null, programs: [] };

  const programs: SubsidyProgram[] = [];
  const currentFiscalYear = new Date().getFullYear();

  // 2. 各補助金制度を登録
  const programConfigs = [
    {
      program_name: '浄化槽設置整備事業補助金（設置）',
      category: 'septic_tank_installation' as const,
      amounts: [
        { tank_capacity: 5, capacity_label: '5人槽', subsidy_amount: 332000 },
        { tank_capacity: 7, capacity_label: '6〜7人槽', subsidy_amount: 414000 },
        { tank_capacity: 10, capacity_label: '8〜10人槽', subsidy_amount: 548000 },
      ],
    },
    {
      program_name: '浄化槽設置整備事業補助金（転換）',
      category: 'septic_tank_conversion' as const,
      amounts: [
        { tank_capacity: 5, capacity_label: '5人槽', subsidy_amount: 332000 },
        { tank_capacity: 7, capacity_label: '6〜7人槽', subsidy_amount: 414000 },
        { tank_capacity: 10, capacity_label: '8〜10人槽', subsidy_amount: 548000 },
      ],
    },
    {
      program_name: '浄化槽設置整備事業補助金（単独処理浄化槽撤去）',
      category: 'tank_removal' as const,
      amounts: [
        { tank_capacity: null, capacity_label: '撤去費', subsidy_amount: 120000, max_amount: 120000 },
      ],
    },
    {
      program_name: '浄化槽設置整備事業補助金（くみ取り便槽撤去）',
      category: 'cesspool_removal' as const,
      amounts: [
        { tank_capacity: null, capacity_label: '撤去費', subsidy_amount: 90000, max_amount: 90000 },
      ],
    },
    {
      program_name: '浄化槽設置整備事業補助金（配管工事）',
      category: 'plumbing_work' as const,
      amounts: [
        { tank_capacity: null, capacity_label: '配管工事費', subsidy_amount: 300000, max_amount: 300000 },
      ],
    },
  ];

  for (const config of programConfigs) {
    const program = await createSubsidyProgram({
      municipality_id: municipality.id,
      program_name: config.program_name,
      category: config.category,
      fiscal_year: currentFiscalYear,
      is_active: true,
    });

    if (program) {
      await createSubsidyAmounts(
        config.amounts.map((a) => ({
          program_id: program.id,
          ...a,
        }))
      );
      programs.push(program);
    }
  }

  return { municipality, programs };
}
