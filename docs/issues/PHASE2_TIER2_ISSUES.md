# Phase 2 (Tier 2): AI機能統合 - Issue List

**目標**: 「プロ有料版（¥4,980/月）」として競合との決定的差別化
**期間**: 6ヶ月
**優先度**: Phase 1完了後に着手

---

## 📊 概要

### 達成目標

- ✅ AIヒアリングアシスタント（対話型データ収集）
- ✅ 音声入力対応（Whisper API）
- ✅ AI分析レポート自動生成
- ✅ 家計簿API連携（実績データ取得）
- ✅ 顧客ポータル（PWA）
- ✅ ライフイベントAI予測

### KPI

| 指標 | 目標値 |
|------|--------|
| 無料版登録ユーザー | 2,000名 |
| ライト版ユーザー | 300名 |
| プロ版ユーザー | 200名 |
| 月次収益（MRR） | ¥1,390,000 |
| NPS | 50以上 |

### 全体工数

| 合計期間 | 約6ヶ月（24週間） |
|---------|-----------------|
| 総Issue数 | 6件 |

---

## 🎫 Issue一覧

| Issue | タイトル | 優先度 | 期間 | サブエージェント | 依存 |
|-------|---------|--------|------|----------------|------|
| ISSUE-201 | AIヒアリングアシスタント | 🔴 Critical | 5週間 | ❌ | Phase 1完了 |
| ISSUE-202 | 音声入力（Whisper API） | 🟡 High | 3週間 | ✅ | 201 |
| ISSUE-203 | AI分析レポート生成 | 🔴 Critical | 4週間 | ❌ | 201 |
| ISSUE-204 | 家計簿API連携 | 🟡 High | 4週間 | ✅ | Phase 1完了 |
| ISSUE-205 | 顧客ポータル（PWA） | 🟡 High | 5週間 | ❌ | Phase 1完了 |
| ISSUE-206 | ライフイベントAI予測 | 🟢 Medium | 3週間 | ✅ | 201 |

### 並列実行戦略

```
Week 1-5:   ISSUE-201 (AI Hearing) || ISSUE-204 (家計簿API) || ISSUE-205 (顧客ポータル)
Week 6-8:   ISSUE-202 (音声入力)
Week 9-12:  ISSUE-203 (AI分析レポート) || ISSUE-206 (AI予測)
Week 13-24: 統合テスト・デバッグ・ユーザーフィードバック対応
```

---

## ISSUE-201: AIヒアリングアシスタント 🔴 Critical

### 📋 概要

チャット形式でFPが顧客情報を効率的に収集できるAIアシスタントを実装します。Google Gemini 1.5 Flashを使用し、自然な対話で年齢・家族構成・年収・ライフプランの希望を聞き出します。

**背景**:
- 既存FPツールではヒアリングシートを手入力する必要があり、時間がかかる
- 顧客も硬い質問形式だと心理的ハードルが高い
- AIとの対話形式にすることで、気軽にライフプランを作成できる

### 🎯 タスク詳細

#### 1. Google Gemini API統合

```bash
npm install @google/generative-ai
```

```typescript
// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
export const genAI = new GoogleGenerativeAI(apiKey);

// Gemini 1.5 Flash: 高速・低コスト（ヒアリング用）
export const flashModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
    responseMimeType: 'application/json',
  },
});

// Gemini 1.5 Pro: 高精度（分析レポート用）
export const proModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.5,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
  },
});
```

#### 2. ヒアリング型定義

```typescript
// src/types/hearing.ts
export interface HearingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface HearingData {
  // 基本情報
  age?: number;
  occupation?: string;
  annualIncome?: number;
  currentSavings?: number;

  // 家族構成
  married?: boolean;
  spouseAge?: number;
  spouseIncome?: number;
  children?: Array<{
    name: string;
    birthYear: number;
  }>;

  // 住宅
  housingStatus?: 'owned' | 'rented' | 'planning';
  loanAmount?: number;
  loanYears?: number;
  loanInterestRate?: number;

  // ライフプラン希望
  retirementAge?: number;
  goals?: string[];
  concerns?: string[];
}

export interface HearingResponse {
  nextQuestion: {
    question: string;
    suggestedAnswers?: string[];
    category: 'basic' | 'family' | 'finance' | 'housing' | 'goals';
  };
  extractedData: Partial<HearingData>;
  progress: number; // 0-100%
  isComplete: boolean;
}
```

#### 3. AIヒアリングサービス

```typescript
// src/services/ai/hearingService.ts
import { flashModel } from '@/lib/gemini';
import { HearingMessage, HearingData, HearingResponse } from '@/types/hearing';

const SYSTEM_PROMPT = `あなたは経験豊富なファイナンシャルプランナーのヒアリングアシスタントです。

【あなたの役割】
顧客から以下の情報を自然な会話形式で聞き出してください：
1. 基本情報（年齢・職業・年収・貯蓄額）
2. 家族構成（配偶者・子供の有無と年齢）
3. 住宅状況（持ち家・賃貸・住宅購入予定）
4. 住宅ローン（借入額・返済期間・金利）
5. ライフプランの希望（教育・老後・その他の目標）
6. 不安・懸念事項

【対応ルール】
1. 一度に1〜2個の質問に絞る（情報過多を避ける）
2. 回答に応じて共感・励ましの言葉を添える
3. 専門用語は避け、わかりやすい言葉を使う
4. 数値は具体的に聞く（「300万円くらいですか？」等）
5. プライバシーに配慮し、答えたくない場合はスキップ可能と伝える

【出力形式】
JSON形式で以下を返してください：
{
  "nextQuestion": {
    "question": "次の質問内容",
    "suggestedAnswers": ["選択肢1", "選択肢2", ...],
    "category": "basic" | "family" | "finance" | "housing" | "goals"
  },
  "extractedData": {
    // ユーザーの回答から抽出したデータ
  },
  "progress": 0〜100,
  "isComplete": false | true
}`;

export async function processHearingMessage(
  conversationHistory: HearingMessage[],
  userMessage: string,
  currentData: Partial<HearingData>
): Promise<HearingResponse> {
  const history = conversationHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const chat = flashModel.startChat({
    history,
    systemInstruction: SYSTEM_PROMPT,
  });

  const prompt = `【現在の収集済みデータ】
${JSON.stringify(currentData, null, 2)}

【ユーザーの最新発言】
${userMessage}

上記を踏まえ、次の質問と抽出データを返してください。`;

  const result = await chat.sendMessage(prompt);
  const responseText = result.response.text();

  // JSON抽出（Markdown codeblockがある場合に対応）
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
  const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;

  return JSON.parse(jsonText) as HearingResponse;
}
```

#### 4. ヒアリングチャットUI

```typescript
// src/components/Hearing/HearingChat.tsx
import { useState, useRef, useEffect } from 'react';
import { HearingMessage, HearingData } from '@/types/hearing';
import { processHearingMessage } from '@/services/ai/hearingService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

export function HearingChat() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<HearingMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！ライフプランニングのお手伝いをさせていただきます。まずは、お名前と現在の年齢を教えていただけますか？',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [hearingData, setHearingData] = useState<Partial<HearingData>>({});
  const [progress, setProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: HearingMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await processHearingMessage(messages, inputValue, hearingData);

      // 抽出データを更新
      setHearingData((prev) => ({ ...prev, ...response.extractedData }));
      setProgress(response.progress);

      // AIの返答を追加
      const assistantMessage: HearingMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.nextQuestion.question,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // ヒアリング完了時
      if (response.isComplete) {
        showToast('ヒアリングが完了しました！', 'success');
        await saveHearingData();
      }
    } catch (error) {
      console.error('Error processing message:', error);
      showToast('メッセージの処理中にエラーが発生しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveHearingData = async () => {
    if (!user) return;

    try {
      // life_plans テーブルに保存
      const { data, error } = await supabase
        .from('life_plans')
        .insert({
          user_id: user.id,
          name: `${hearingData.age}歳のライフプラン`,
          current_age: hearingData.age || 30,
          retirement_age: hearingData.retirementAge || 65,
          life_expectancy: 100,
          data: hearingData,
        })
        .select()
        .single();

      if (error) throw error;

      showToast('ライフプランを保存しました', 'success');
      // TODO: ダッシュボードにリダイレクト
    } catch (error) {
      console.error('Error saving hearing data:', error);
      showToast('保存に失敗しました', 'error');
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">AIライフプランヒアリング</h1>
        <div className="mt-2">
          <div className="w-full bg-blue-400 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-1">進捗: {progress}%</p>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
```

### ✅ 完了条件

- [ ] Gemini API統合
- [ ] ヒアリングロジック実装
- [ ] チャットUI実装
- [ ] データ抽出精度90%以上
- [ ] 進捗表示機能
- [ ] life_plansテーブルへの保存
- [ ] レスポンスタイム3秒以内
- [ ] エラーハンドリング
- [ ] テスト作成（E2Eテスト含む）

### 🔧 技術スタック

- Google Gemini 1.5 Flash API
- React
- Supabase

### 📁 新規ファイル

```
src/
├── lib/
│   └── gemini.ts
├── services/
│   └── ai/
│       └── hearingService.ts
├── components/
│   └── Hearing/
│       ├── HearingChat.tsx
│       └── HearingProgress.tsx
└── types/
    └── hearing.ts
```

### 🚫 サブエージェント委任: 不可

**理由**: AI統合の中核機能であり、プロンプトエンジニアリングの調整が必要

---

## ISSUE-202: 音声入力（Whisper API） 🟡 High

### 📋 概要

FPと顧客の対話を音声で録音し、自動的にテキスト化してヒアリングデータに反映します。

### 🎯 タスク詳細

#### 1. OpenAI Whisper API統合

```bash
npm install openai
```

```typescript
// src/services/ai/whisperService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // 本番環境ではバックエンド経由推奨
});

export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ja',
      response_format: 'text',
    });

    return transcription;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
```

#### 2. 音声録音コンポーネント

```typescript
// src/components/Hearing/VoiceRecorder.tsx
import { useState, useRef } from 'react';
import { transcribeAudio } from '@/services/ai/whisperService';
import { useToast } from '@/hooks/useToast';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
}

export function VoiceRecorder({ onTranscriptComplete }: VoiceRecorderProps) {
  const { showToast } = useToast();
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

        setTranscribing(true);
        try {
          const transcript = await transcribeAudio(audioFile);
          onTranscriptComplete(transcript);
          showToast('音声をテキスト化しました', 'success');
        } catch (error) {
          showToast('音声認識に失敗しました', 'error');
        } finally {
          setTranscribing(false);
        }

        // ストリームを停止
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      showToast('録音を開始しました', 'info');
    } catch (error) {
      console.error('Error starting recording:', error);
      showToast('マイクへのアクセスが許可されていません', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={transcribing}
        className={`w-16 h-16 rounded-full ${
          recording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white flex items-center justify-center disabled:opacity-50`}
      >
        {transcribing ? (
          <span className="text-xs">処理中</span>
        ) : recording ? (
          <span className="text-2xl">⏹</span>
        ) : (
          <span className="text-2xl">🎤</span>
        )}
      </button>
      <p className="text-sm text-gray-600">
        {transcribing ? 'テキスト化中...' : recording ? '録音中...' : '録音開始'}
      </p>
    </div>
  );
}
```

### ✅ 完了条件

- [ ] Whisper API統合
- [ ] ブラウザ音声録音実装
- [ ] VoiceRecorderコンポーネント実装
- [ ] HearingChatへの統合
- [ ] 日本語認識精度95%以上
- [ ] エラーハンドリング
- [ ] マイク権限処理
- [ ] テスト作成

### 🔧 技術スタック

- OpenAI Whisper API
- Web Audio API
- MediaRecorder API

### 📁 新規ファイル

```
src/
├── services/
│   └── ai/
│       └── whisperService.ts
└── components/
    └── Hearing/
        └── VoiceRecorder.tsx
```

### ✅ サブエージェント委任: 可能

---

## ISSUE-203: AI分析レポート自動生成 🔴 Critical

### 📋 概要

キャッシュフロー分析をAIが自動で文章化し、課題・改善提案を生成します。Gemini 1.5 Proを使用します。

### 🎯 タスク詳細

```typescript
// src/services/ai/analysisService.ts
import { proModel } from '@/lib/gemini';
import { MonthlyCashFlow } from '@/utils/cashFlowCalculator';
import { HearingData } from '@/types/hearing';

export interface AnalysisReport {
  summary: string;
  challenges: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export async function generateAnalysisReport(
  cashFlow: MonthlyCashFlow[],
  hearingData: HearingData
): Promise<AnalysisReport> {
  const shortages = cashFlow.filter((cf) => cf.savings < 0);
  const peak = cashFlow.reduce((max, cf) => (cf.savings > max.savings ? cf : max), cashFlow[0]);
  const bottom = cashFlow.reduce((min, cf) => (cf.savings < min.savings ? cf : min), cashFlow[0]);

  const prompt = `以下のライフプラン情報を分析し、総合評価・課題・改善提案を日本語で生成してください。

【顧客情報】
- 年齢: ${hearingData.age}歳
- 年収: ${hearingData.annualIncome?.toLocaleString()}円
- 貯蓄: ${hearingData.currentSavings?.toLocaleString()}円
- 家族構成: ${hearingData.married ? '既婚' : '独身'}、子供${hearingData.children?.length || 0}人
- 住宅ローン: ${hearingData.loanAmount ? `${(hearingData.loanAmount / 10000).toLocaleString()}万円` : 'なし'}

【キャッシュフロー分析】
- 貯蓄ピーク: ${(peak.savings / 10000).toLocaleString()}万円 (${peak.year}年、${peak.age}歳)
- 貯蓄最低: ${(bottom.savings / 10000).toLocaleString()}万円 (${bottom.year}年、${bottom.age}歳)
- 資金ショート: ${shortages.length}ヶ月${shortages.length > 0 ? `（${shortages[0].year}年から発生）` : ''}

【出力形式】
JSON形式で以下を返してください：
{
  "summary": "300文字程度の総合評価",
  "challenges": ["課題1", "課題2", "課題3"],
  "recommendations": ["提案1", "提案2", "提案3"],
  "riskLevel": "low" | "medium" | "high"
}`;

  const result = await proModel.generateContent(prompt);
  const responseText = result.response.text();

  // JSON抽出
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
  const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;

  return JSON.parse(jsonText) as AnalysisReport;
}
```

### ✅ 完了条件

- [ ] Gemini 1.5 Pro統合
- [ ] 分析ロジック実装
- [ ] レポート生成UI
- [ ] PDF出力への統合
- [ ] 分析精度検証（専門家レビュー）
- [ ] テスト作成

### 🚫 サブエージェント委任: 不可

---

## ISSUE-204: 家計簿API連携 🟡 High

### 📋 概要

MoneyForward ME、Moneytreeと連携し、実際の月次支出データを自動取得します。

*(実装詳細は省略)*

### ✅ 完了条件

- [ ] MoneyForward ME API連携
- [ ] Moneytree API連携
- [ ] OAuth認証実装
- [ ] データ同期機能
- [ ] カテゴリ自動分類

### ✅ サブエージェント委任: 可能

---

## ISSUE-205: 顧客ポータル（PWA） 🟡 High

### 📋 概要

顧客が自分のライフプランをスマホで閲覧・編集できるPWAを実装します。

*(実装詳細は省略)*

### ✅ 完了条件

- [ ] PWA設定（manifest.json、Service Worker）
- [ ] オフライン対応
- [ ] プッシュ通知
- [ ] 顧客向けUIデザイン
- [ ] FPとのチャット機能

### 🚫 サブエージェント委任: 不可

---

## ISSUE-206: ライフイベントAI予測 🟢 Medium

### 📋 概要

年齢・年収・家族構成から統計的に結婚・出産時期を推定します。

*(実装詳細は省略)*

### ✅ 完了条件

- [ ] 厚労省統計データ統合
- [ ] AI予測ロジック
- [ ] 予測結果表示UI
- [ ] ライフイベント自動追加機能

### ✅ サブエージェント委任: 可能

---

## 📝 Phase 2完了後のチェックリスト

- [ ] 全6 Issueクローズ
- [ ] AI機能統合テスト
- [ ] ユーザー受け入れテスト（UAT）
- [ ] 本番環境デプロイ
- [ ] プロ版（¥4,980/月）リリース
- [ ] MRR ¥1,390,000達成
- [ ] NPS 50以上

---

**Next Phase**: [PHASE3_TIER3_ISSUES.md](./PHASE3_TIER3_ISSUES.md)
