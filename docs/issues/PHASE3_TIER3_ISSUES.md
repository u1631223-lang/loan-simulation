# Phase 3 (Tier 3): エンタープライズ機能 - Issue List

**目標**: 金融機関・大手不動産会社への導入（月額¥50,000〜）
**期間**: 12ヶ月
**優先度**: Phase 2完了後に着手

---

## 📊 概要

### 達成目標

- ✅ CRM統合（Salesforce/HubSpot/kintone）
- ✅ チーム機能（RBAC・承認フロー）
- ✅ コンプライアンス機能（監査ログ・金融庁対応）
- ✅ 金融商品DB（保険・投資信託・iDeCo）
- ✅ ホワイトラベル対応

### KPI

| 指標 | 目標値 |
|------|--------|
| 無料版登録ユーザー | 5,000名 |
| ライト版ユーザー | 800名 |
| プロ版ユーザー | 700名 |
| エンタープライズ顧客 | 10社 |
| 月次収益（MRR） | ¥4,770,000 |
| NPS | 60以上 |

### 全体工数

| 合計期間 | 約12ヶ月（48週間） |
|---------|-----------------|
| 総Issue数 | 5件 |

---

## 🎫 Issue一覧

| Issue | タイトル | 優先度 | 期間 | サブエージェント | 依存 |
|-------|---------|--------|------|----------------|------|
| ISSUE-301 | CRM統合 | 🔴 Critical | 8週間 | ❌ | Phase 2完了 |
| ISSUE-302 | チーム機能 | 🟡 High | 6週間 | ✅ | Phase 2完了 |
| ISSUE-303 | コンプライアンス | 🔴 Critical | 6週間 | ❌ | Phase 2完了 |
| ISSUE-304 | 金融商品DB | 🟡 High | 10週間 | ✅ | Phase 2完了 |
| ISSUE-305 | ホワイトラベル | 🟢 Medium | 4週間 | ✅ | Phase 2完了 |

### 並列実行戦略

```
Week 1-8:   ISSUE-301 (CRM統合)
Week 9-14:  ISSUE-302 (チーム機能) || ISSUE-303 (コンプライアンス)
Week 15-24: ISSUE-304 (金融商品DB)
Week 25-28: ISSUE-305 (ホワイトラベル)
Week 29-48: エンタープライズ営業・カスタマイズ対応
```

---

## ISSUE-301: CRM統合 🔴 Critical

### 📋 概要

Salesforce、HubSpot、kintoneと連携し、顧客情報の双方向同期・提案履歴の自動記録を実現します。

**背景**:
- 金融機関や大手企業はすでにCRMを利用しており、データを手動で移行するのは非効率
- 営業活動全体をCRMで管理したいニーズがある
- FPツールとCRMのシームレスな連携が求められる

### 🎯 タスク詳細

#### 1. Salesforce API統合

```bash
npm install jsforce
```

```typescript
// src/services/crm/salesforceService.ts
import jsforce from 'jsforce';

const SF_LOGIN_URL = import.meta.env.VITE_SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';
const SF_USERNAME = import.meta.env.VITE_SALESFORCE_USERNAME || '';
const SF_PASSWORD = import.meta.env.VITE_SALESFORCE_PASSWORD || '';
const SF_SECURITY_TOKEN = import.meta.env.VITE_SALESFORCE_SECURITY_TOKEN || '';

let conn: jsforce.Connection | null = null;

export async function connectSalesforce(): Promise<jsforce.Connection> {
  if (conn) return conn;

  conn = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL,
  });

  await conn.login(SF_USERNAME, SF_PASSWORD + SF_SECURITY_TOKEN);
  return conn;
}

export async function syncContactToSalesforce(lifePlan: any): Promise<string> {
  const connection = await connectSalesforce();

  // Contactオブジェクトに顧客情報を作成/更新
  const contact = {
    FirstName: lifePlan.clientName?.split(' ')[0] || '',
    LastName: lifePlan.clientName?.split(' ')[1] || '',
    Email: lifePlan.clientEmail || '',
    Phone: lifePlan.clientPhone || '',
    Birthdate: lifePlan.clientBirthdate || null,
    Annual_Income__c: lifePlan.data.annualIncome || 0, // カスタムフィールド
    Savings__c: lifePlan.data.currentSavings || 0, // カスタムフィールド
  };

  // 既存Contactを検索
  const existingContact = await connection.sobject('Contact').findOne({
    Email: contact.Email,
  });

  if (existingContact) {
    // 更新
    await connection.sobject('Contact').update({
      Id: existingContact.Id,
      ...contact,
    });
    return existingContact.Id;
  } else {
    // 新規作成
    const result = await connection.sobject('Contact').create(contact);
    return result.id;
  }
}

export async function createOpportunityInSalesforce(
  contactId: string,
  lifePlanId: string,
  summary: string
): Promise<string> {
  const connection = await connectSalesforce();

  const opportunity = {
    Name: `ライフプラン提案 - ${lifePlanId}`,
    ContactId: contactId,
    StageName: 'Proposal',
    CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30日後
    Description: summary,
    Type: 'Financial Planning',
  };

  const result = await connection.sobject('Opportunity').create(opportunity);
  return result.id;
}

export async function logActivityInSalesforce(
  contactId: string,
  activityType: string,
  subject: string,
  description: string
): Promise<void> {
  const connection = await connectSalesforce();

  await connection.sobject('Task').create({
    WhoId: contactId,
    Subject: subject,
    Description: description,
    ActivityDate: new Date().toISOString().split('T')[0],
    Status: 'Completed',
    Priority: 'Normal',
  });
}
```

#### 2. HubSpot API統合

```bash
npm install @hubspot/api-client
```

```typescript
// src/services/crm/hubspotService.ts
import { Client } from '@hubspot/api-client';

const hubspotClient = new Client({
  accessToken: import.meta.env.VITE_HUBSPOT_ACCESS_TOKEN || '',
});

export async function syncContactToHubSpot(lifePlan: any): Promise<string> {
  const properties = {
    email: lifePlan.clientEmail || '',
    firstname: lifePlan.clientName?.split(' ')[0] || '',
    lastname: lifePlan.clientName?.split(' ')[1] || '',
    phone: lifePlan.clientPhone || '',
    annual_income: lifePlan.data.annualIncome || 0,
    savings: lifePlan.data.currentSavings || 0,
  };

  try {
    // 既存Contact検索
    const searchResult = await hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'email',
              operator: 'EQ',
              value: properties.email,
            },
          ],
        },
      ],
    });

    if (searchResult.results.length > 0) {
      // 更新
      const contactId = searchResult.results[0].id;
      await hubspotClient.crm.contacts.basicApi.update(contactId, { properties });
      return contactId;
    } else {
      // 新規作成
      const response = await hubspotClient.crm.contacts.basicApi.create({ properties });
      return response.id;
    }
  } catch (error) {
    console.error('Error syncing to HubSpot:', error);
    throw error;
  }
}

export async function createDealInHubSpot(
  contactId: string,
  lifePlanId: string,
  amount: number
): Promise<string> {
  const properties = {
    dealname: `ライフプラン提案 - ${lifePlanId}`,
    amount: amount.toString(),
    dealstage: 'presentationscheduled',
    pipeline: 'default',
  };

  const response = await hubspotClient.crm.deals.basicApi.create({
    properties,
    associations: [
      {
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
      },
    ],
  });

  return response.id;
}
```

#### 3. kintone API統合

```typescript
// src/services/crm/kintoneService.ts
import axios from 'axios';

const KINTONE_DOMAIN = import.meta.env.VITE_KINTONE_DOMAIN || '';
const KINTONE_API_TOKEN = import.meta.env.VITE_KINTONE_API_TOKEN || '';
const KINTONE_APP_ID = import.meta.env.VITE_KINTONE_APP_ID || '';

const kintoneClient = axios.create({
  baseURL: `https://${KINTONE_DOMAIN}/k/v1/`,
  headers: {
    'X-Cybozu-API-Token': KINTONE_API_TOKEN,
    'Content-Type': 'application/json',
  },
});

export async function syncContactToKintone(lifePlan: any): Promise<string> {
  const record = {
    顧客名: { value: lifePlan.clientName || '' },
    メールアドレス: { value: lifePlan.clientEmail || '' },
    電話番号: { value: lifePlan.clientPhone || '' },
    年収: { value: lifePlan.data.annualIncome?.toString() || '0' },
    貯蓄額: { value: lifePlan.data.currentSavings?.toString() || '0' },
  };

  try {
    // 既存レコード検索
    const searchResponse = await kintoneClient.get(`records.json`, {
      params: {
        app: KINTONE_APP_ID,
        query: `メールアドレス = "${lifePlan.clientEmail}"`,
      },
    });

    if (searchResponse.data.records.length > 0) {
      // 更新
      const recordId = searchResponse.data.records[0].$id.value;
      await kintoneClient.put('record.json', {
        app: KINTONE_APP_ID,
        id: recordId,
        record,
      });
      return recordId;
    } else {
      // 新規作成
      const response = await kintoneClient.post('record.json', {
        app: KINTONE_APP_ID,
        record,
      });
      return response.data.id;
    }
  } catch (error) {
    console.error('Error syncing to kintone:', error);
    throw error;
  }
}
```

#### 4. CRM統合管理UI

```typescript
// src/components/Settings/CRMIntegration.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

export function CRMIntegration() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedCRM, setSelectedCRM] = useState<'salesforce' | 'hubspot' | 'kintone' | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !selectedCRM) return;

    setSaving(true);
    try {
      // CRM設定を保存（Supabase Vaultに暗号化保存）
      const { error } = await supabase.from('crm_integrations').upsert({
        user_id: user.id,
        crm_type: selectedCRM,
        api_key: apiKey,
        domain,
        enabled: true,
      });

      if (error) throw error;

      showToast('CRM連携設定を保存しました', 'success');
    } catch (error) {
      console.error('Error saving CRM integration:', error);
      showToast('保存に失敗しました', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">CRM連携設定</h2>

      {/* CRM選択 */}
      <div className="grid grid-cols-3 gap-4">
        {['salesforce', 'hubspot', 'kintone'].map((crm) => (
          <button
            key={crm}
            onClick={() => setSelectedCRM(crm as any)}
            className={`p-6 border-2 rounded-lg ${
              selectedCRM === crm ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <div className="text-4xl mb-2">
              {crm === 'salesforce' && '☁️'}
              {crm === 'hubspot' && '🔶'}
              {crm === 'kintone' && '🟦'}
            </div>
            <div className="font-semibold capitalize">{crm}</div>
          </button>
        ))}
      </div>

      {/* API設定フォーム */}
      {selectedCRM && (
        <div className="p-6 border rounded-lg space-y-4">
          <h3 className="font-semibold text-lg capitalize">{selectedCRM} 設定</h3>

          {selectedCRM === 'kintone' && (
            <div>
              <label className="block text-sm font-medium mb-1">ドメイン</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="your-domain.cybozu.com"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              {selectedCRM === 'salesforce' ? 'Access Token' : 'API Token'}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="APIトークンを入力"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      )}
    </div>
  );
}
```

### ✅ 完了条件

- [ ] Salesforce API統合
- [ ] HubSpot API統合
- [ ] kintone API統合
- [ ] 双方向同期機能
- [ ] CRM設定UI
- [ ] 自動同期スケジューラー
- [ ] エラーハンドリング
- [ ] セキュリティ監査
- [ ] テスト作成

### 🔧 技術スタック

- jsforce（Salesforce）
- @hubspot/api-client（HubSpot）
- Axios（kintone）
- Supabase（設定保存）

### 📁 新規ファイル

```
src/
├── services/
│   └── crm/
│       ├── salesforceService.ts
│       ├── hubspotService.ts
│       └── kintoneService.ts
└── components/
    └── Settings/
        └── CRMIntegration.tsx

supabase/
└── migrations/
    └── 20260101_crm_integrations.sql
```

### 🚫 サブエージェント委任: 不可

**理由**: 外部API統合の中核機能であり、エラーハンドリング・セキュリティが重要

---

## ISSUE-302: チーム機能 🟡 High

### 📋 概要

複数FPでの顧客情報共有、役割ベースのアクセス制御（RBAC）、承認フローを実装します。

### 🎯 タスク詳細

#### 1. データベース設計

```sql
-- organizations テーブル
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan_tier TEXT DEFAULT 'enterprise',
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

-- organization_members テーブル
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- life_plan_shares テーブル（顧客情報共有）
CREATE TABLE life_plan_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  life_plan_id UUID REFERENCES life_plans(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit', 'admin')),
  shared_by_user_id UUID REFERENCES users(id),
  shared_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(life_plan_id, shared_with_user_id)
);

-- approval_requests テーブル（承認フロー）
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  life_plan_id UUID REFERENCES life_plans(id) ON DELETE CASCADE,
  requested_by_user_id UUID REFERENCES users(id),
  approved_by_user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);
```

#### 2. RBAC実装

```typescript
// src/utils/rbac.ts
export type Role = 'owner' | 'admin' | 'member' | 'viewer';
export type Permission = 'view' | 'edit' | 'admin';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['view', 'edit', 'admin'],
  admin: ['view', 'edit', 'admin'],
  member: ['view', 'edit'],
  viewer: ['view'],
};

export function hasPermission(role: Role, requiredPermission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(requiredPermission);
}

export function canEditLifePlan(userRole: Role, lifePlanPermission: Permission): boolean {
  return (
    hasPermission(userRole, 'edit') &&
    (lifePlanPermission === 'edit' || lifePlanPermission === 'admin')
  );
}
```

#### 3. チーム管理UI

```typescript
// src/components/Team/TeamManagement.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
}

export function TeamManagement() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    // 実装
  };

  const handleInvite = async () => {
    // メール招待機能
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    // 役割変更
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">チーム管理</h2>

      {/* メンバー招待 */}
      <div className="p-4 border rounded-lg space-y-4">
        <h3 className="font-semibold">新しいメンバーを招待</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="メールアドレス"
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="admin">管理者</option>
            <option value="member">メンバー</option>
            <option value="viewer">閲覧のみ</option>
          </select>
          <button
            onClick={handleInvite}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            招待
          </button>
        </div>
      </div>

      {/* メンバー一覧 */}
      <div className="space-y-2">
        <h3 className="font-semibold">メンバー（{members.length}名）</h3>
        {members.map((member) => (
          <div key={member.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{member.full_name}</h4>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>
            <select
              value={member.role}
              onChange={(e) => handleRoleChange(member.id, e.target.value)}
              className="px-3 py-1 border rounded"
              disabled={member.role === 'owner'}
            >
              <option value="owner">オーナー</option>
              <option value="admin">管理者</option>
              <option value="member">メンバー</option>
              <option value="viewer">閲覧のみ</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### ✅ 完了条件

- [ ] 組織・メンバーテーブル設計
- [ ] RBAC実装
- [ ] チーム管理UI
- [ ] メンバー招待機能
- [ ] 承認フロー実装
- [ ] RLS（Row Level Security）設定
- [ ] テスト作成

### ✅ サブエージェント委任: 可能

---

## ISSUE-303: コンプライアンス機能 🔴 Critical

### 📋 概要

監査ログ、金融庁規制対応、適合性原則チェックを実装します。

*(実装詳細は省略)*

### ✅ 完了条件

- [ ] 監査ログテーブル設計
- [ ] 全操作ログ記録
- [ ] 金融庁規制レポート
- [ ] 適合性原則チェック
- [ ] ログ閲覧UI

### 🚫 サブエージェント委任: 不可

---

## ISSUE-304: 金融商品DB 🟡 High

### 📋 概要

生命保険・医療保険・投資信託・iDeCo・NISAの商品データベースを構築します。

*(実装詳細は省略)*

### ✅ 完了条件

- [ ] 商品DBテーブル設計
- [ ] 商品検索機能
- [ ] シミュレーション連携
- [ ] 税制優遇計算
- [ ] 商品管理UI

### ✅ サブエージェント委任: 可能

---

## ISSUE-305: ホワイトラベル対応 🟢 Medium

### 📋 概要

企業ブランドでの提供、ロゴ・カラーテーマのカスタマイズ、独自ドメイン設定を実装します。

*(実装詳細は省略)*

### ✅ 完了条件

- [ ] ブランディング設定DB
- [ ] ロゴアップロード機能
- [ ] カラーテーマカスタマイズ
- [ ] 独自ドメイン設定
- [ ] PDFテンプレートカスタマイズ

### ✅ サブエージェント委任: 可能

---

## 📝 Phase 3完了後のチェックリスト

- [ ] 全5 Issueクローズ
- [ ] エンタープライズ機能統合テスト
- [ ] セキュリティ監査
- [ ] 本番環境デプロイ
- [ ] エンタープライズ版リリース
- [ ] 企業顧客10社獲得
- [ ] MRR ¥4,770,000達成
- [ ] SLA 99.9%達成
- [ ] NPS 60以上

---

## 🎉 全Phase完了後の最終目標

### 3年後の到達点

| 指標 | 目標 | 説明 |
|------|------|------|
| **総ユーザー数** | 6,510名 | 無料5,000 + ライト800 + プロ700 + 企業10社 |
| **年間売上（ARR）** | ¥148,800,000 | 月次MRR ¥12,400,000 × 12ヶ月 |
| **純利益** | +¥75,000,000 | 売上 - 費用（開発費+マーケ費） |
| **市場シェア** | Top 3 | 国内FPツール市場でトップ3入り |
| **NPS** | 60以上 | 顧客満足度・推奨度 |

**Next Step**: エンタープライズ営業・国際展開・M&A検討

---

**前Phase**: [PHASE2_TIER2_ISSUES.md](./PHASE2_TIER2_ISSUES.md)
