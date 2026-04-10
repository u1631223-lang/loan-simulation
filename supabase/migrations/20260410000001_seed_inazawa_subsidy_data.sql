-- ============================================================
-- 稲沢市 浄化槽補助金データ初期投入 (Seed Data)
-- ============================================================

-- 1. 自治体登録
INSERT INTO public.municipalities (id, name, prefecture, contact_department, website_url, notes)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '稲沢市',
  '愛知県',
  '経済環境部 環境保全課',
  'https://www.city.inazawa.aichi.jp/',
  '浄化槽設置整備事業補助金を実施'
)
ON CONFLICT (name, prefecture) DO UPDATE SET
  contact_department = EXCLUDED.contact_department,
  website_url = EXCLUDED.website_url,
  notes = EXCLUDED.notes;

-- 2. 補助金制度登録

-- 2-1. 浄化槽設置（新規）
INSERT INTO public.subsidy_programs (id, municipality_id, program_name, category, fiscal_year, is_active, eligibility_notes)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '浄化槽設置整備事業補助金（設置）',
  'septic_tank_installation',
  2026,
  true,
  '下水道事業計画区域外で合併処理浄化槽を新たに設置する場合'
);

-- 2-2. 浄化槽転換（単独→合併）
INSERT INTO public.subsidy_programs (id, municipality_id, program_name, category, fiscal_year, is_active, eligibility_notes)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '浄化槽設置整備事業補助金（転換）',
  'septic_tank_conversion',
  2026,
  true,
  '単独処理浄化槽又はくみ取り便槽から合併処理浄化槽に転換する場合'
);

-- 2-3. 単独処理浄化槽撤去（解体）
INSERT INTO public.subsidy_programs (id, municipality_id, program_name, category, fiscal_year, is_active, eligibility_notes)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  '浄化槽設置整備事業補助金（単独処理浄化槽撤去）',
  'tank_removal',
  2026,
  true,
  '合併処理浄化槽への転換に伴い、既存の単独処理浄化槽を撤去する場合'
);

-- 2-4. くみ取り便槽撤去
INSERT INTO public.subsidy_programs (id, municipality_id, program_name, category, fiscal_year, is_active, eligibility_notes)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '浄化槽設置整備事業補助金（くみ取り便槽撤去）',
  'cesspool_removal',
  2026,
  true,
  '合併処理浄化槽への転換に伴い、既存のくみ取り便槽を撤去する場合'
);

-- 2-5. 配管工事
INSERT INTO public.subsidy_programs (id, municipality_id, program_name, category, fiscal_year, is_active, eligibility_notes)
VALUES (
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  '浄化槽設置整備事業補助金（配管工事）',
  'plumbing_work',
  2026,
  true,
  '合併処理浄化槽の設置に伴う宅内配管工事'
);

-- 3. 補助金額登録

-- 浄化槽設置（新規）の金額
INSERT INTO public.subsidy_amounts (program_id, tank_capacity, capacity_label, subsidy_amount) VALUES
  ('10000000-0000-0000-0000-000000000001', 5, '5人槽', 332000),
  ('10000000-0000-0000-0000-000000000001', 7, '6〜7人槽', 414000),
  ('10000000-0000-0000-0000-000000000001', 10, '8〜10人槽', 548000);

-- 浄化槽転換の金額
INSERT INTO public.subsidy_amounts (program_id, tank_capacity, capacity_label, subsidy_amount) VALUES
  ('10000000-0000-0000-0000-000000000002', 5, '5人槽', 332000),
  ('10000000-0000-0000-0000-000000000002', 7, '6〜7人槽', 414000),
  ('10000000-0000-0000-0000-000000000002', 10, '8〜10人槽', 548000);

-- 単独処理浄化槽撤去（解体）の金額
INSERT INTO public.subsidy_amounts (program_id, tank_capacity, capacity_label, subsidy_amount, max_amount)
VALUES ('10000000-0000-0000-0000-000000000003', NULL, '撤去費', 120000, 120000);

-- くみ取り便槽撤去の金額
INSERT INTO public.subsidy_amounts (program_id, tank_capacity, capacity_label, subsidy_amount, max_amount)
VALUES ('10000000-0000-0000-0000-000000000004', NULL, '撤去費', 90000, 90000);

-- 配管工事の金額
INSERT INTO public.subsidy_amounts (program_id, tank_capacity, capacity_label, subsidy_amount, max_amount)
VALUES ('10000000-0000-0000-0000-000000000005', NULL, '配管工事費', 300000, 300000);

-- 4. 必要書類登録（浄化槽設置用 - 全プログラム共通）

-- 設置補助金の必要書類
INSERT INTO public.subsidy_required_documents (program_id, document_order, document_name, description, is_conditional, condition_note) VALUES
  ('10000000-0000-0000-0000-000000000001', 1, '浄化槽設置届出書の写し又は建築確認検査証及び浄化槽確認書の写し', '事業期間内に設置届出したもの', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 2, '位置見取図・設置大系図を含む図面', '設置場所の地図・配置図', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 3, '賃貸人の承諾書', '住宅等を借りている場合に限る', true, '住宅等を借りている場合に限る'),
  ('10000000-0000-0000-0000-000000000001', 4, '浄化槽工事の見積書又は契約書の写し', '浄化槽工事業者の見積額がわかるもの', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 5, '浄化槽法第86条第2号電気関係管理者の届出書の写し', '電気関係の届出', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 6, '浄化槽工事業者の登録証の写し', '施工業者の登録証明', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 7, '浄化槽の維持管理に関する契約書の写し又は誓約書', '保守点検・清掃の契約', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 8, '土地の登記事項証明書（発行後3ヶ月以内）', '設置場所の土地の登記情報', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 9, '住民票の写し（発行後3ヶ月以内）', '申請者の住民票', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 10, '市税の滞納がないことの証明書', '市税完納証明', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 11, '（一社）全国浄化槽連合会の合併処理浄化槽確認証の写し', '浄化槽の認定証', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 12, '交付申請書兼同意書（汚水処理施設整備区域外であることの確認）', '下水道計画区域外であることの確認', false, NULL),
  ('10000000-0000-0000-0000-000000000001', 13, '※ 用紙の大きさは、日本産業規格A4とする', '用紙サイズの指定', false, NULL);

-- 撤去（解体）時の追加必要書類
INSERT INTO public.subsidy_required_documents (program_id, document_order, document_name, description, is_conditional, condition_note) VALUES
  ('10000000-0000-0000-0000-000000000003', 1, '既存浄化槽（便槽）の撤去に係る見積書又は契約書の写し', '撤去工事の見積もり', true, '既存浄化槽・便槽を撤去する場合'),
  ('10000000-0000-0000-0000-000000000003', 2, '既存浄化槽（便槽）の撤去前の写真', '撤去前の現況写真', true, '既存浄化槽・便槽を撤去する場合'),
  ('10000000-0000-0000-0000-000000000003', 3, '既存浄化槽（便槽）の撤去工事完了届', '撤去工事完了後に提出', true, '既存浄化槽・便槽を撤去する場合（工事完了後）');

-- 5. 梅村様の申請データ（サンプル）
INSERT INTO public.subsidy_applications (
  customer_name,
  municipality_id,
  status,
  has_demolition,
  demolition_type,
  notes
)
VALUES (
  '梅村',
  '00000000-0000-0000-0000-000000000001',
  'preparing',
  true,
  'single_tank',
  '解体の補助金申請も追加が必要。当初は浄化槽設置のみで進めていたが、解体（撤去）の補助金も申請可能であることが判明。'
);
