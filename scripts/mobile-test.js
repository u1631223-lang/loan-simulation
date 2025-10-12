#!/usr/bin/env node

/**
 * モバイルテスト用スクリプト
 * Usage: node scripts/mobile-test.js
 */

import { exec } from 'child_process';
import os from 'os';

console.log('📱 モバイルテスト用情報\n');

// 1. ネットワーク情報取得
function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const networks = [];

  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(netInterface => {
      if (netInterface.family === 'IPv4' && !netInterface.internal) {
        networks.push({
          name: name,
          address: netInterface.address,
          netmask: netInterface.netmask
        });
      }
    });
  });

  return networks;
}

// 2. サーバー状況確認
function checkServer() {
  return new Promise((resolve) => {
    exec('lsof -i :5173', (error, stdout) => {
      if (stdout.trim()) {
        console.log('✅ 開発サーバーが起動中 (ポート5173)');
        resolve(true);
      } else {
        console.log('❌ 開発サーバーが起動していません');
        console.log('   npm run dev でサーバーを起動してください');
        resolve(false);
      }
    });
  });
}

// 3. QRコード生成（オプション）
function generateQR(url) {
  console.log('\n📱 スマホでアクセスする方法:');
  console.log('1. スマホとPCが同じWi-Fiに接続されていることを確認');
  console.log('2. スマホのブラウザで以下のURLにアクセス:');
  console.log(`   ${url}`);
  console.log('\n💡 ヒント:');
  console.log('   - URLをコピーしてスマホに送信');
  console.log('   - QRコードアプリでQRコードを生成可能');
  console.log('   - 開発者ツールでレスポンシブデザインをテスト');
}

// メイン実行
async function main() {
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    const networks = getNetworkInfo();
    
    if (networks.length > 0) {
      console.log('\n🌐 ネットワーク情報:');
      networks.forEach((network, index) => {
        const url = `http://${network.address}:5173`;
        console.log(`${index + 1}. ${network.name}: ${url}`);
      });
      
      // 最初のネットワークのURLを表示
      const primaryUrl = `http://${networks[0].address}:5173`;
      generateQR(primaryUrl);
      
      console.log('\n🔧 トラブルシューティング:');
      console.log('- アクセスできない場合:');
      console.log('  1. ファイアウォール設定を確認');
      console.log('  2. PCとスマホが同じネットワークか確認');
      console.log('  3. ポート5173が開放されているか確認');
      
    } else {
      console.log('❌ 外部アクセス可能なネットワークインターフェースが見つかりません');
    }
  }
}

main().catch(console.error);
