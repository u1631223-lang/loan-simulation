/**
 * Google Gemini API クライアント
 *
 * AIを使った住宅ローンアドバイスの生成に使用します。
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// APIキーの取得（環境変数から）
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Gemini AIクライアントの初期化
let genAI: GoogleGenerativeAI | null = null;

/**
 * Gemini AIクライアントを取得
 * APIキーが設定されていない場合はnullを返す
 */
function getGeminiClient(): GoogleGenerativeAI | null {
  if (!apiKey) {
    console.warn('VITE_GEMINI_API_KEY is not set. AI features will be disabled.');
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

/**
 * AIアドバイスを生成
 *
 * @param prompt - AIに送信するプロンプト
 * @returns AI生成されたアドバイステキスト
 * @throws APIキー未設定、またはAPI呼び出しエラー
 */
export async function generateAdvice(prompt: string): Promise<string> {
  const client = getGeminiClient();

  if (!client) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY environment variable.');
  }

  try {
    // gemini-proモデルを使用
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    // コンテンツ生成
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);

    // エラーの種類に応じたメッセージ
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Gemini API key is invalid. Please check your API key configuration.');
      }
      if (error.message.includes('RATE_LIMIT')) {
        throw new Error('Gemini API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }

    throw new Error('Unknown error occurred while generating AI advice.');
  }
}

/**
 * Gemini APIが利用可能かチェック
 *
 * @returns APIキーが設定されている場合はtrue
 */
export function isGeminiAvailable(): boolean {
  return !!apiKey;
}

/**
 * テスト用のリクエスト
 * APIキーとモデルが正しく動作するか確認
 *
 * @returns テストが成功した場合はtrue
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const response = await generateAdvice('Hello, this is a test. Please respond with "OK".');
    return response.length > 0;
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}
