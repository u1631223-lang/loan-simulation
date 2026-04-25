/**
 * HeroPitch - トップ画面の訴求セクション
 *
 * 商談中の住宅営業・FP に向けて「何ができるツールか」を一目で伝える。
 * SEO のため見出し階層と意味的なマークアップを意識する。
 */

import React from 'react';

const features: Array<{ icon: string; title: string; body: string }> = [
  {
    icon: '⚡',
    title: '商談中の暗算をゼロに',
    body: '借入額・金利・期間を入れるだけで月々返済・総返済・利息を即座に算出。逆算もワンタップ。',
  },
  {
    icon: '💼',
    title: '年収から借入可能額',
    body: '返済負担率 30/35% 自動判定、連帯債務・連帯保証にも対応。アンカリングに最適。',
  },
  {
    icon: '📈',
    title: 'NISA 複利と並走',
    body: '繰上返済 vs NISA 投資のシミュレーションを 1 画面で比較できる。',
  },
  {
    icon: '📲',
    title: 'ホーム画面に追加で再開即可',
    body: '前回の入力を自動復元。iPad のショートカットからでも 1 から打ち直し不要。',
  },
];

export const HeroPitch: React.FC = () => {
  return (
    <section
      aria-label="サービス概要"
      className="bg-gradient-to-br from-primary/5 via-white to-amber-50 rounded-2xl border border-primary/10 p-6 sm:p-8 mb-8"
    >
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs sm:text-sm font-semibold tracking-wider text-primary/80 uppercase mb-2">
          For 住宅営業・独立系FP・IFA
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
          商談で迷わない、住宅ローン専用の業務電卓。
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-6">
          無料・登録不要。お客様の前で「年収から借入可能額」「金利上昇シナリオ」「繰上返済の効果」「NISA との比較」を即答。
          履歴と入力値はブラウザに残るので、商談を中断しても続きから再開できます。
        </p>
      </div>

      <ul
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto"
      >
        {features.map((f) => (
          <li
            key={f.title}
            className="flex items-start gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100"
          >
            <span aria-hidden className="text-2xl leading-none mt-0.5">
              {f.icon}
            </span>
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">{f.title}</p>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HeroPitch;
