#!/usr/bin/env node

/**
 * 開発サーバー状況確認スクリプト
 * Usage: node scripts/check-dev-server.js
 */

const { exec } = require('child_process');
const http = require('http');

// 設定
const DEFAULT_PORT = 5173;
const SERVER_URL = `http://localhost:${DEFAULT_PORT}`;

console.log('🔍 開発サーバー状況確認\n');

// 1. プロセス確認
function checkProcess() {
  return new Promise((resolve) => {
    exec('ps aux | grep vite | grep -v grep', (error, stdout) => {
      if (stdout.trim()) {
        console.log('✅ Viteプロセスが実行中:');
        console.log(stdout.trim());
        resolve(true);
      } else {
        console.log('❌ Viteプロセスが見つかりません');
        resolve(false);
      }
    });
  });
}

// 2. ポート確認
function checkPort() {
  return new Promise((resolve) => {
    exec(`lsof -i :${DEFAULT_PORT}`, (error, stdout) => {
      if (stdout.trim()) {
        console.log(`✅ ポート${DEFAULT_PORT}が使用中:`);
        console.log(stdout.trim());
        resolve(true);
      } else {
        console.log(`❌ ポート${DEFAULT_PORT}は使用されていません`);
        resolve(false);
      }
    });
  });
}

// 3. HTTP接続確認
function checkHttpConnection() {
  return new Promise((resolve) => {
    const req = http.get(SERVER_URL, (res) => {
      console.log(`✅ HTTP接続成功: ${SERVER_URL}`);
      console.log(`   ステータス: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (error) => {
      console.log(`❌ HTTP接続失敗: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(3000, () => {
      console.log('❌ HTTP接続タイムアウト');
      req.destroy();
      resolve(false);
    });
  });
}

// メイン実行
async function main() {
  const processRunning = await checkProcess();
  const portInUse = await checkPort();
  const httpWorking = await checkHttpConnection();

  console.log('\n📊 総合結果:');
  if (processRunning && portInUse && httpWorking) {
    console.log('🟢 開発サーバーは正常に動作中です！');
    console.log(`🌐 アクセス先: ${SERVER_URL}`);
  } else {
    console.log('🔴 開発サーバーに問題があります');
    console.log('\n🔧 対処法:');
    if (!processRunning) {
      console.log('   npm run dev でサーバーを起動してください');
    }
    if (!portInUse) {
      console.log('   ポートが使用されていません');
    }
    if (!httpWorking) {
      console.log('   HTTP接続に失敗しています');
    }
  }
}

main().catch(console.error);
