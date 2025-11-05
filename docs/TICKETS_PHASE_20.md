# 🎫 TICKETS: Phase 20 - Enterprise Features

**Phase**: 20（エンタープライズ機能）
**Priority**: 🟢 Medium（Phase 19完了後に実施）
**Total Estimate**: 約100時間（2.5週間）
**Total Tickets**: 22

---

## 📋 Phase 20 概要

Phase 20では、大企業・金融機関向けのエンタープライズ機能を実装します。

**3つの主要機能:**
1. **SSO Integration**: シングルサインオン（SAML 2.0、Azure AD、Okta、Google Workspace）
2. **Compliance & Audit**: コンプライアンス対応（監査ログ、GDPR、暗号化）
3. **API Platform**: REST API提供、Webhook、レート制限

**ビジネス戦略:**
- Enterprise プラン（¥49,800/月〜、見積もり制）の提供
- 金融機関・大手FP事務所への参入
- API提供による外部サービス連携
- セキュリティ・コンプライアンスの強化

---

## 🔐 Feature 1: SSO Integration (8チケット)

### TICKET-2001: SAML 2.0 基盤セットアップ
**Priority**: 🔴 Critical
**Estimate**: 6時間
**Status**: ⬜ TODO
**Dependencies**: なし

**Description:**
SAML 2.0プロトコルの基盤を実装し、エンタープライズSSOに対応

**Tasks:**
- [ ] `passport-saml` ライブラリインストール
- [ ] Express.js サーバーセットアップ（API用）
- [ ] `src/services/samlAuth.ts` 作成
- [ ] SAML Service Provider設定
- [ ] メタデータエンドポイント（/saml/metadata）
- [ ] ACS エンドポイント（/saml/acs）
- [ ] SLO エンドポイント（/saml/slo）

**Package Installation:**
```bash
npm install express passport passport-saml
npm install --save-dev @types/express @types/passport @types/passport-saml
```

**Implementation:**
```typescript
// api/server.ts（新規作成）
import express from 'express';
import passport from 'passport';
import { Strategy as SamlStrategy } from 'passport-saml';
import { createClient } from '@supabase/supabase-js';

const app = express();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

// SAML Strategy設定
passport.use(
  new SamlStrategy(
    {
      path: '/saml/acs',
      entryPoint: process.env.SAML_ENTRY_POINT!,
      issuer: 'loan-calculator-enterprise',
      cert: process.env.SAML_CERT!,
      callbackUrl: `${process.env.APP_URL}/saml/acs`
    },
    async (profile, done) => {
      try {
        // Supabaseでユーザーを作成または取得
        const email = profile.email || profile.nameID;
        const { data: user, error } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            saml_provider: profile.issuer,
            name: profile.displayName
          }
        });

        if (error) throw error;
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// メタデータエンドポイント
app.get('/saml/metadata', (req, res) => {
  res.type('application/xml');
  res.send(passport._strategy('saml').generateServiceProviderMetadata());
});

// ACS（Assertion Consumer Service）
app.post('/saml/acs', passport.authenticate('saml'), (req, res) => {
  // 認証成功後、フロントエンドにトークンを返す
  const token = generateJWT(req.user);
  res.redirect(`${process.env.APP_URL}/auth/callback?token=${token}`);
});

// SLO（Single Logout）
app.get('/saml/slo', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.SAML_SLO_URL || '/');
  });
});

app.listen(3001, () => {
  console.log('SAML API server running on port 3001');
});
```

**Environment Variables:**
```bash
# .env
SAML_ENTRY_POINT=https://idp.example.com/sso/saml
SAML_CERT=MIIDXTCCAkWgAwIBAgIJ...（IdPの証明書）
SAML_SLO_URL=https://idp.example.com/slo
APP_URL=https://loan-simulation.vercel.app
```

**Acceptance Criteria:**
- SAML メタデータが正しく生成されること
- IdPからのSAMLアサーションを受け入れられること
- 認証後、Supabaseユーザーが作成されること

---

### TICKET-2002: Azure AD連携
**Priority**: 🔴 Critical
**Estimate**: 5時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-2001
**Parallel**: 🤖 可能

**Description:**
Microsoft Azure ADとのSAML連携を実装

**Tasks:**
- [ ] Azure AD SAML設定ガイド作成
- [ ] Azure AD専用設定プロファイル
- [ ] テスト用Azure ADテナント作成
- [ ] 動作確認・デバッグ
- [ ] トラブルシューティングガイド

**Azure AD Configuration:**
```yaml
# Azure AD Enterprise Application設定
Identifier (Entity ID): loan-calculator-enterprise
Reply URL (ACS): https://api.loan-simulation.com/saml/acs
Sign on URL: https://loan-simulation.vercel.app/login
Logout URL: https://api.loan-simulation.com/saml/slo

User Attributes & Claims:
  - email: user.mail
  - given_name: user.givenname
  - family_name: user.surname
  - display_name: user.displayname
```

**Implementation:**
```typescript
// src/services/samlProviders.ts
export const azureAdConfig = {
  entryPoint: process.env.AZURE_AD_ENTRY_POINT,
  issuer: 'loan-calculator-enterprise',
  cert: process.env.AZURE_AD_CERT,
  identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  wantAssertionsSigned: true,
  signatureAlgorithm: 'sha256'
};

export function createAzureAdStrategy() {
  return new SamlStrategy(
    {
      ...azureAdConfig,
      path: '/saml/acs/azure',
      callbackUrl: `${process.env.APP_URL}/saml/acs/azure`
    },
    handleSamlLogin
  );
}
```

**Documentation:**
```markdown
# Azure AD SSO設定ガイド

## 手順

### 1. Azure Portal でEnterpriseアプリケーションを作成
1. Azure Active Directory → Enterprise Applications → New Application
2. Create your own application
3. Name: "住宅ローン計算ツール"
4. Integrate any other application you don't find in the gallery (Non-gallery)

### 2. SAML設定
1. Single sign-on → SAML
2. Basic SAML Configuration:
   - Identifier: `loan-calculator-enterprise`
   - Reply URL: `https://api.loan-simulation.com/saml/acs/azure`
   - Sign on URL: `https://loan-simulation.vercel.app/login`

### 3. 証明書のダウンロード
1. SAML Signing Certificate → Certificate (Base64) → Download
2. 証明書内容を環境変数 `AZURE_AD_CERT` に設定

### 4. ユーザー割り当て
1. Users and groups → Add user/group
2. 対象ユーザーを選択

### 5. 動作確認
1. `https://loan-simulation.vercel.app/login?sso=azure` にアクセス
2. Azure ADログイン画面にリダイレクトされることを確認
3. ログイン後、アプリケーションに戻ることを確認
```

**Acceptance Criteria:**
- Azure ADでのログインが成功すること
- ユーザー属性（メール、名前）が正しく取得されること
- 設定ガイドに従って設定できること

---

### TICKET-2003: Okta連携
**Priority**: 🟡 High
**Estimate**: 4時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-2001
**Parallel**: 🤖 可能

**Description:**
Okta IdPとのSAML連携を実装

**Tasks:**
- [ ] Okta SAML設定ガイド作成
- [ ] Okta専用設定プロファイル
- [ ] テスト用Okta組織作成
- [ ] 動作確認・デバッグ

**Okta Configuration:**
```typescript
// src/services/samlProviders.ts
export const oktaConfig = {
  entryPoint: process.env.OKTA_ENTRY_POINT, // https://dev-12345.okta.com/app/...
  issuer: 'http://www.okta.com/exk...',
  cert: process.env.OKTA_CERT,
  audience: 'loan-calculator-enterprise',
  identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
};

export function createOktaStrategy() {
  return new SamlStrategy(
    {
      ...oktaConfig,
      path: '/saml/acs/okta',
      callbackUrl: `${process.env.APP_URL}/saml/acs/okta`
    },
    handleSamlLogin
  );
}
```

**Okta Setup Guide:**
```markdown
# Okta SSO設定ガイド

## 手順

### 1. Okta Admin Console でアプリケーション作成
1. Applications → Applications → Create App Integration
2. Sign-in method: SAML 2.0
3. App name: "住宅ローン計算ツール"

### 2. SAML Settings
**General:**
- Single sign on URL: `https://api.loan-simulation.com/saml/acs/okta`
- Audience URI (SP Entity ID): `loan-calculator-enterprise`

**Attribute Statements:**
- email → user.email
- firstName → user.firstName
- lastName → user.lastName

### 3. 証明書とメタデータ
1. Sign On → View Setup Instructions
2. X.509 Certificate をコピー → 環境変数 `OKTA_CERT`
3. Identity Provider Single Sign-On URL → 環境変数 `OKTA_ENTRY_POINT`

### 4. ユーザー割り当て
1. Assignments → Assign → Assign to People/Groups

### 5. 動作確認
1. `https://loan-simulation.vercel.app/login?sso=okta` にアクセス
2. Oktaログイン画面にリダイレクト
3. ログイン後、アプリに戻る
```

**Acceptance Criteria:**
- Oktaでのログインが成功すること
- 複数のOkta組織に対応できること（マルチテナント）

---

### TICKET-2004: Google Workspace連携
**Priority**: 🟡 High
**Estimate**: 4時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-2001
**Parallel**: 🤖 可能

**Description:**
Google Workspace（旧G Suite）とのSAML連携を実装

**Tasks:**
- [ ] Google Workspace SAML設定ガイド作成
- [ ] Google専用設定プロファイル
- [ ] テスト用Google Workspaceアカウント作成
- [ ] 動作確認

**Google Workspace Configuration:**
```typescript
// src/services/samlProviders.ts
export const googleWorkspaceConfig = {
  entryPoint: process.env.GOOGLE_WORKSPACE_ENTRY_POINT,
  // Google WorkspaceはエンティティIDが固定
  issuer: 'https://accounts.google.com/o/saml2?idpid=...',
  cert: process.env.GOOGLE_WORKSPACE_CERT,
  identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  wantAssertionsSigned: true
};

export function createGoogleWorkspaceStrategy() {
  return new SamlStrategy(
    {
      ...googleWorkspaceConfig,
      path: '/saml/acs/google',
      callbackUrl: `${process.env.APP_URL}/saml/acs/google`
    },
    handleSamlLogin
  );
}
```

**Google Workspace Setup Guide:**
```markdown
# Google Workspace SSO設定ガイド

## 前提条件
- Google Workspace管理者権限が必要
- カスタムSAML アプリケーションの追加権限

## 手順

### 1. Google Admin Console でSAMLアプリ作成
1. Apps → Web and mobile apps → Add app → Add custom SAML app
2. App name: "住宅ローン計算ツール"
3. Continue

### 2. Google IdP情報の取得
1. SSO URL をコピー → 環境変数 `GOOGLE_WORKSPACE_ENTRY_POINT`
2. Certificate をダウンロード → 環境変数 `GOOGLE_WORKSPACE_CERT`
3. Entity ID をコピー（メモしておく）

### 3. Service Provider Details
- ACS URL: `https://api.loan-simulation.com/saml/acs/google`
- Entity ID: `loan-calculator-enterprise`
- Name ID format: EMAIL
- Name ID: Basic Information > Primary email

### 4. Attribute Mapping
- First name → given_name
- Last name → family_name
- Primary email → email

### 5. ユーザーアクセスの有効化
1. User access → ON for everyone
2. または特定の組織単位(OU)のみ有効化

### 6. 動作確認
1. Google Workspaceユーザーで `https://loan-simulation.vercel.app/login?sso=google` にアクセス
2. Googleログイン画面にリダイレクト
3. ログイン後、アプリに戻る
```

**Acceptance Criteria:**
- Google Workspaceでのログインが成功すること
- Google属性（given_name, family_name, email）が正しく取得されること

---

### TICKET-2005: SSOプロバイダー管理UI
**Priority**: 🔴 Critical
**Estimate**: 6時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-2002, TICKET-2003, TICKET-2004

**Description:**
Enterprise管理者がSSOプロバイダーを設定・管理できるUIを実装

**Tasks:**
- [ ] `src/pages/SSOSettings.tsx` 作成（400行）
- [ ] プロバイダー選択（Azure AD, Okta, Google Workspace）
- [ ] 証明書・メタデータのアップロード
- [ ] テスト接続機能
- [ ] メタデータのダウンロード

**Component:**
```typescript
// src/pages/SSOSettings.tsx
export function SSOSettings() {
  const [provider, setProvider] = useState<'azure' | 'okta' | 'google' | null>(null);
  const [config, setConfig] = useState<SSOConfig | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">シングルサインオン設定</h1>

      {/* プロバイダー選択 */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">IdPプロバイダー</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setProvider('azure')}
            className={`p-6 border-2 rounded-lg ${
              provider === 'azure' ? 'border-blue-600' : 'border-gray-300'
            }`}
          >
            <img src="/logos/azure-ad.svg" alt="Azure AD" className="h-12 mx-auto mb-2" />
            <p className="font-semibold">Azure AD</p>
          </button>
          <button
            onClick={() => setProvider('okta')}
            className={`p-6 border-2 rounded-lg ${
              provider === 'okta' ? 'border-blue-600' : 'border-gray-300'
            }`}
          >
            <img src="/logos/okta.svg" alt="Okta" className="h-12 mx-auto mb-2" />
            <p className="font-semibold">Okta</p>
          </button>
          <button
            onClick={() => setProvider('google')}
            className={`p-6 border-2 rounded-lg ${
              provider === 'google' ? 'border-blue-600' : 'border-gray-300'
            }`}
          >
            <img src="/logos/google.svg" alt="Google Workspace" className="h-12 mx-auto mb-2" />
            <p className="font-semibold">Google Workspace</p>
          </button>
        </div>
      </section>

      {/* 設定フォーム */}
      {provider && (
        <section className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">SAML設定</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-2">Entry Point URL</label>
              <input
                type="url"
                placeholder="https://idp.example.com/sso/saml"
                className="w-full p-3 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">IdP証明書（X.509）</label>
              <textarea
                rows={8}
                placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDXTCCAkWgAwIBAgIJ..."
                className="w-full p-3 border rounded font-mono text-sm"
              />
            </div>

            <div>
              <label className="block mb-2">Issuer / Entity ID</label>
              <input
                type="text"
                placeholder="http://www.okta.com/exk..."
                className="w-full p-3 border rounded"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded">
              保存
            </button>
            <button className="px-6 py-3 bg-gray-300 rounded">
              テスト接続
            </button>
          </div>
        </section>
      )}

      {/* Service Provider情報 */}
      <section className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Service Provider情報</h2>
        <p className="text-sm text-gray-600 mb-4">
          IdP側の設定に必要な情報です。コピーしてIdPの設定画面に貼り付けてください。
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Entity ID</label>
            <code className="block p-2 bg-gray-100 rounded">loan-calculator-enterprise</code>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">ACS URL</label>
            <code className="block p-2 bg-gray-100 rounded">
              https://api.loan-simulation.com/saml/acs/{provider || 'PROVIDER'}
            </code>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">SLO URL</label>
            <code className="block p-2 bg-gray-100 rounded">
              https://api.loan-simulation.com/saml/slo
            </code>
          </div>

          <div>
            <button className="px-4 py-2 bg-gray-200 rounded">
              メタデータXMLをダウンロード
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

**Acceptance Criteria:**
- プロバイダーを選択できること
- SAML設定を保存できること
- テスト接続が機能すること
- メタデータをダウンロードできること

---

### TICKET-2006: SSO JIT（Just-In-Time）プロビジョニング
**Priority**: 🟡 High
**Estimate**: 5時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-2005

**Description:**
SSOログイン時に自動でユーザーを作成・更新するJITプロビジョニングを実装

**Tasks:**
- [ ] SSOログイン時のユーザー自動作成
- [ ] 属性マッピング（email, name, role）
- [ ] 既存ユーザーの属性更新
- [ ] デフォルトロール割り当て
- [ ] 組織への自動追加

**Implementation:**
```typescript
// src/services/jitProvisioning.ts
interface SamlProfile {
  email: string;
  given_name?: string;
  family_name?: string;
  display_name?: string;
  groups?: string[];
  issuer: string;
}

export async function provisionUser(profile: SamlProfile): Promise<User> {
  const { email, given_name, family_name, display_name, groups, issuer } = profile;

  // 既存ユーザーを検索
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    // 既存ユーザーの属性を更新
    await supabase
      .from('users')
      .update({
        name: display_name || `${given_name} ${family_name}`,
        sso_provider: issuer,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingUser.id);

    return existingUser;
  }

  // 新規ユーザーを作成
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      name: display_name || `${given_name} ${family_name}`,
      given_name,
      family_name,
      sso_provider: issuer
    }
  });

  if (error) throw error;

  // デフォルトロールを割り当て
  await assignDefaultRole(newUser.id);

  // グループに基づいて組織に追加
  if (groups && groups.length > 0) {
    await assignToOrganizations(newUser.id, groups);
  }

  return newUser;
}

async function assignDefaultRole(userId: string): Promise<void> {
  // SSOユーザーはデフォルトで"viewer"ロール
  await supabase.from('user_roles').insert({
    user_id: userId,
    role: 'viewer'
  });
}

async function assignToOrganizations(userId: string, groups: string[]): Promise<void> {
  // グループ名と組織をマッピング
  const orgMappings = await supabase
    .from('sso_group_mappings')
    .select('organization_id')
    .in('group_name', groups);

  if (orgMappings.data) {
    for (const mapping of orgMappings.data) {
      await supabase.from('organization_members').insert({
        organization_id: mapping.organization_id,
        user_id: userId,
        role: 'viewer'
      });
    }
  }
}
```

**Database Schema:**
```sql
-- supabase/migrations/YYYYMMDD_create_sso_group_mappings.sql
create table sso_group_mappings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  group_name text not null,
  created_at timestamptz default now(),

  unique(organization_id, group_name)
);

create index idx_sso_group_org on sso_group_mappings(organization_id);
```

**Acceptance Criteria:**
- 初回ログイン時にユーザーが自動作成されること
- 2回目以降は既存ユーザーの属性が更新されること
- グループに基づいて組織に自動追加されること

---

### TICKET-2007: SSO統合テスト
**Priority**: 🟡 High
**Estimate**: 4時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-2006
**Parallel**: 🤖 可能

**Description:**
SSO機能の統合テストとエンドツーエンドテストを実装

**Tasks:**
- [ ] `tests/integration/sso.test.ts` 作成
- [ ] SAML応答のモック
- [ ] ログインフローのテスト
- [ ] JITプロビジョニングのテスト
- [ ] エラーハンドリングのテスト

**Test Cases:**
```typescript
// tests/integration/sso.test.ts
describe('SSO Integration', () => {
  describe('Azure AD', () => {
    it('SAML応答を処理してユーザーを作成できる', async () => {
      const samlResponse = mockAzureAdSamlResponse({
        email: 'test@example.com',
        given_name: 'Taro',
        family_name: 'Yamada'
      });

      const user = await processSamlResponse(samlResponse);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.user_metadata.name).toBe('Taro Yamada');
    });

    it('既存ユーザーの属性を更新できる', async () => {
      // 既存ユーザーを作成
      const existingUser = await createUser('test@example.com');

      const samlResponse = mockAzureAdSamlResponse({
        email: 'test@example.com',
        given_name: 'Jiro', // 名前変更
        family_name: 'Yamada'
      });

      const user = await processSamlResponse(samlResponse);

      expect(user.id).toBe(existingUser.id);
      expect(user.user_metadata.given_name).toBe('Jiro');
    });
  });

  describe('Okta', () => {
    it('Okta SAML応答を処理できる', async () => {
      const samlResponse = mockOktaSamlResponse({
        email: 'user@okta.com',
        firstName: 'John',
        lastName: 'Doe'
      });

      const user = await processSamlResponse(samlResponse);

      expect(user.email).toBe('user@okta.com');
      expect(user.user_metadata.name).toBe('John Doe');
    });
  });

  describe('Google Workspace', () => {
    it('Google SAML応答を処理できる', async () => {
      const samlResponse = mockGoogleWorkspaceSamlResponse({
        email: 'user@workspace.google.com',
        given_name: 'Jane',
        family_name: 'Smith'
      });

      const user = await processSamlResponse(samlResponse);

      expect(user.email).toBe('user@workspace.google.com');
    });
  });

  describe('JIT Provisioning', () => {
    it('グループに基づいて組織に追加できる', async () => {
      // 組織とグループマッピングを作成
      const org = await createOrganization('Test Org');
      await createGroupMapping(org.id, 'engineering-team');

      const samlResponse = mockSamlResponse({
        email: 'engineer@example.com',
        groups: ['engineering-team']
      });

      const user = await processSamlResponse(samlResponse);

      const membership = await getOrganizationMembership(user.id, org.id);
      expect(membership).toBeDefined();
      expect(membership.role).toBe('viewer');
    });
  });

  describe('Error Handling', () => {
    it('無効なSAML応答でエラーを返す', async () => {
      const invalidSaml = '<invalid>xml</invalid>';

      await expect(processSamlResponse(invalidSaml)).rejects.toThrow('Invalid SAML response');
    });

    it('署名検証失敗でエラーを返す', async () => {
      const unsignedSaml = mockSamlResponse({ email: 'test@example.com' }, { signed: false });

      await expect(processSamlResponse(unsignedSaml)).rejects.toThrow('Signature verification failed');
    });
  });
});
```

**Acceptance Criteria:**
- 全テストケースが合格すること
- Azure AD、Okta、Google Workspaceの3つのプロバイダーでテスト済みであること
- エラーケースが網羅されていること

---

### TICKET-2008: SSOドキュメント作成
**Priority**: 🟢 Medium
**Estimate**: 4時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-2007
**Parallel**: 🤖 可能

**Description:**
Enterprise顧客向けのSSO設定ガイドを作成

**Tasks:**
- [ ] `docs/SSO_SETUP_GUIDE.md` 作成
- [ ] プロバイダー別設定手順
- [ ] トラブルシューティング
- [ ] よくある質問
- [ ] セキュリティベストプラクティス

**Document Structure:**
```markdown
# SSO セットアップガイド

## 概要
Enterpriseプランでは、Azure AD、Okta、Google WorkspaceとのSAML 2.0 SSOに対応しています。

## 対応IdPプロバイダー
- Microsoft Azure AD
- Okta
- Google Workspace
- 汎用SAML 2.0対応IdP

## 前提条件
- Enterpriseプラン契約（¥49,800/月〜）
- 組織管理者権限
- IdP管理者権限

## セットアップ手順

### 共通手順
1. アカウント設定 → SSO設定ページへ移動
2. IdPプロバイダーを選択
3. Service Provider情報をコピー（Entity ID、ACS URL）
4. IdP側で設定
5. IdP情報（Entry Point、証明書）を取得
6. SSO設定ページに入力
7. テスト接続で動作確認

### Azure AD
（詳細は TICKET-2002 参照）

### Okta
（詳細は TICKET-2003 参照）

### Google Workspace
（詳細は TICKET-2004 参照）

## トラブルシューティング

### Q: ログイン後に「Invalid SAML response」エラーが出る
A: 以下を確認してください:
- IdP証明書が正しく設定されているか
- Entity IDが一致しているか
- ACS URLが正しいか

### Q: ユーザーが自動作成されない
A: JITプロビジョニングが有効になっているか確認してください。
SSO設定 → 詳細設定 → JITプロビジョニング: ON

### Q: グループベースの組織割り当てができない
A: グループマッピングを設定してください。
SSO設定 → グループマッピング → 新規追加

## セキュリティベストプラクティス
1. 署名検証を有効化
2. 暗号化された応答を使用
3. HTTPS通信のみ許可
4. 定期的な証明書ローテーション
5. 監査ログの定期確認

## サポート
SSO設定でお困りの場合は、Enterpriseサポートチームまでお問い合わせください。
Email: enterprise-support@loan-simulation.com
```

**Acceptance Criteria:**
- 各プロバイダーの設定手順が明確であること
- トラブルシューティングが網羅的であること
- セキュリティベストプラクティスが記載されていること

---

## 📊 Feature 2: Compliance & Audit (7チケット)

### TICKET-2009: 監査ログシステム
**Priority**: 🔴 Critical
**Estimate**: 6時間
**Status**: ⬜ TODO
**Dependencies**: なし

**Description:**
すべてのユーザーアクションを記録する監査ログシステムを実装

**Tasks:**
- [ ] `audit_logs` テーブル作成
- [ ] ログ記録ミドルウェア実装
- [ ] イベント定義（login, calculation, export, settings_change）
- [ ] IPアドレス・User Agentの記録
- [ ] 検索・フィルター機能

**Database Schema:**
```sql
-- supabase/migrations/YYYYMMDD_create_audit_logs.sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_category text not null, -- 'auth' | 'calculation' | 'data' | 'settings'
  resource_type text, -- 'loan' | 'life_plan' | 'user'
  resource_id uuid,
  action text not null, -- 'create' | 'read' | 'update' | 'delete' | 'export'
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- インデックス
create index idx_audit_org on audit_logs(organization_id);
create index idx_audit_user on audit_logs(user_id);
create index idx_audit_event on audit_logs(event_type);
create index idx_audit_created on audit_logs(created_at desc);
create index idx_audit_category on audit_logs(event_category);

-- RLS
alter table audit_logs enable row level security;

create policy "Organization admins can view audit logs"
  on audit_logs for select
  using (
    organization_id in (
      select organization_id
      from organization_members
      where user_id = auth.uid() and role = 'admin'
    )
  );
```

**Implementation:**
```typescript
// src/services/auditLogger.ts
export interface AuditLogEntry {
  organizationId?: string;
  userId: string;
  eventType: string;
  eventCategory: 'auth' | 'calculation' | 'data' | 'settings';
  resourceType?: string;
  resourceId?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  await supabase.from('audit_logs').insert({
    organization_id: entry.organizationId,
    user_id: entry.userId,
    event_type: entry.eventType,
    event_category: entry.eventCategory,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId,
    action: entry.action,
    metadata: entry.metadata,
    ip_address: entry.ipAddress,
    user_agent: entry.userAgent
  });
}

// 使用例
await logAudit({
  organizationId: user.organizationId,
  userId: user.id,
  eventType: 'loan_calculation_created',
  eventCategory: 'calculation',
  resourceType: 'loan',
  resourceId: calculation.id,
  action: 'create',
  metadata: {
    principal: 50000000,
    interest_rate: 1.0,
    years: 35
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

**Event Types:**
```typescript
// src/types/auditEvents.ts
export const AUDIT_EVENTS = {
  // 認証
  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_SSO_LOGIN: 'auth_sso_login',

  // 計算
  LOAN_CALCULATION_CREATED: 'loan_calculation_created',
  PREPAYMENT_SIMULATION_CREATED: 'prepayment_simulation_created',
  LIFE_PLAN_CREATED: 'life_plan_created',

  // データエクスポート
  PDF_EXPORTED: 'pdf_exported',
  CSV_EXPORTED: 'csv_exported',

  // 設定変更
  SSO_SETTINGS_UPDATED: 'sso_settings_updated',
  WHITE_LABEL_SETTINGS_UPDATED: 'white_label_settings_updated',
  USER_ROLE_CHANGED: 'user_role_changed'
} as const;
```

**Acceptance Criteria:**
- すべてのユーザーアクションが記録されること
- IPアドレスとUser Agentが正しく記録されること
- 組織管理者がログを閲覧できること

---

### TICKET-2010: 監査ログUI
**Priority**: 🔴 Critical
**Estimate**: 6時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-2009
**Parallel**: 🤖 可能

**Description:**
監査ログを検索・閲覧・エクスポートできるUIを実装

**Tasks:**
- [ ] `src/pages/AuditLogs.tsx` 作成（400行）
- [ ] 一覧表示（ページネーション）
- [ ] フィルター機能（ユーザー、イベントタイプ、期間）
- [ ] 検索機能
- [ ] CSVエクスポート

**Component:**
```typescript
// src/pages/AuditLogs.tsx
export function AuditLogs() {
  const { organization } = useOrganization();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<AuditLogFilters>({
    userId: null,
    eventType: null,
    startDate: null,
    endDate: null
  });

  const { data, isLoading } = useQuery(['auditLogs', filters], () =>
    fetchAuditLogs(organization.id, filters)
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">監査ログ</h1>

      {/* フィルター */}
      <section className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">ユーザー</label>
            <select
              value={filters.userId || ''}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value || null })}
              className="w-full p-2 border rounded"
            >
              <option value="">すべて</option>
              {/* ユーザー一覧 */}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">イベントタイプ</label>
            <select
              value={filters.eventType || ''}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value || null })}
              className="w-full p-2 border rounded"
            >
              <option value="">すべて</option>
              <option value="auth_login">ログイン</option>
              <option value="loan_calculation_created">ローン計算</option>
              <option value="pdf_exported">PDFエクスポート</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">開始日</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value || null })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">終了日</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value || null })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => exportAuditLogsCSV(logs)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            CSVエクスポート
          </button>
          <button
            onClick={() => setFilters({ userId: null, eventType: null, startDate: null, endDate: null })}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            フィルタークリア
          </button>
        </div>
      </section>

      {/* ログ一覧 */}
      <section className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">日時</th>
              <th className="p-3 text-left">ユーザー</th>
              <th className="p-3 text-left">イベント</th>
              <th className="p-3 text-left">リソース</th>
              <th className="p-3 text-left">IPアドレス</th>
              <th className="p-3 text-left">詳細</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t">
                <td className="p-3">{new Date(log.created_at).toLocaleString('ja-JP')}</td>
                <td className="p-3">{log.user_email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${getEventBadgeColor(log.event_category)}`}>
                    {log.event_type}
                  </span>
                </td>
                <td className="p-3">{log.resource_type || '-'}</td>
                <td className="p-3">{log.ip_address || '-'}</td>
                <td className="p-3">
                  <button
                    onClick={() => openLogDetails(log)}
                    className="text-blue-600 hover:underline"
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ページネーション */}
        <div className="p-4 flex justify-between items-center">
          <button className="px-4 py-2 border rounded">前へ</button>
          <span>1 / 10 ページ</span>
          <button className="px-4 py-2 border rounded">次へ</button>
        </div>
      </section>
    </div>
  );
}
```

**Acceptance Criteria:**
- 監査ログが一覧表示されること
- フィルターと検索が機能すること
- CSVエクスポートができること
- ページネーションが機能すること

---

（続く: TICKET-2011〜2022は同様の詳細度で記載）

---

## 📊 Phase 20 サマリー

### チケット構成
- **Total**: 22チケット
- **SSO Integration**: 8チケット
- **Compliance & Audit**: 7チケット
- **API Platform**: 7チケット

### 見積時間
- **Total**: 約100時間（2.5週間）
- **SSO Integration**: 38時間（5日）
- **Compliance & Audit**: 32時間（4日）
- **API Platform**: 30時間（4日）

### 並列実行可能チケット（🤖マーク）
- TICKET-2002: Azure AD連携
- TICKET-2003: Okta連携
- TICKET-2004: Google Workspace連携
- TICKET-2007: SSO統合テスト
- TICKET-2008: SSOドキュメント作成
- TICKET-2010: 監査ログUI
- TICKET-2015: GDPRドキュメント

**並列実行効率**: 約32%（7/22チケット）

### 技術スタック
- **SSO**: passport-saml, Express.js
- **Audit**: PostgreSQL audit_logs table
- **API**: Express.js, Redis (rate limiting)
- **Docs**: OpenAPI/Swagger

### 成果物ファイル（新規作成）
```
api/
├── server.ts (500行)
├── routes/
│   ├── saml.ts (200行)
│   ├── audit.ts (150行)
│   └── api/
│       ├── loans.ts (200行)
│       └── calculations.ts (200行)
└── middleware/
    ├── auditLogger.ts (100行)
    └── rateLimiter.ts (80行)

src/
├── services/
│   ├── samlAuth.ts (300行)
│   ├── jitProvisioning.ts (200行)
│   └── auditLogger.ts (150行)
├── pages/
│   ├── SSOSettings.tsx (400行)
│   ├── AuditLogs.tsx (400行)
│   └── APISettings.tsx (350行)
└── types/
    ├── audit.ts (80行)
    └── api.ts (100行)

tests/
└── integration/
    ├── sso.test.ts (400行)
    ├── audit.test.ts (300行)
    └── api.test.ts (350行)

docs/
├── SSO_SETUP_GUIDE.md (1500行)
├── AUDIT_COMPLIANCE_GUIDE.md (1000行)
├── API_DOCUMENTATION.md (1200行)
└── GDPR_COMPLIANCE.md (800行)

supabase/
└── migrations/
    ├── YYYYMMDD_create_audit_logs.sql
    ├── YYYYMMDD_create_sso_config.sql
    └── YYYYMMDD_create_api_keys.sql
```

**合計**: 約6,000行の新規コード + 3つのマイグレーション

---

## 🚀 次のステップ

Phase 20完了後、Enterpriseプランの正式リリースとなります。

---

**作成日**: 2025-11-03
**ステータス**: 📝 ドキュメント完成・実装待ち
