import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

let initialized = false;

export function initGA() {
  if (initialized) return;
  if (!GA_MEASUREMENT_ID) return;

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gtagOptions: {
      send_page_view: false, // ページビューは手動で送信
    },
  });
  initialized = true;
}

export function trackPageView(path: string, title?: string) {
  if (!GA_MEASUREMENT_ID) return;

  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title || document.title,
  });
}

export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
) {
  if (!GA_MEASUREMENT_ID) return;

  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

/**
 * 借入金額（円）を 1000 万円単位のレンジ文字列に丸める。
 * 例) 32,000,000 → "30M-40M"。
 * GA の label には PII となりうる正確な金額を載せず、集計用バケットだけを送る。
 */
const bucketPrincipal = (principal: number): string => {
  if (!Number.isFinite(principal) || principal <= 0) return 'unknown';
  const tier = Math.floor(principal / 10_000_000); // 1000万円ごと
  const lo = tier * 10;
  const hi = lo + 10;
  return `${lo}M-${hi}M`;
};

export function trackCalculation(
  repaymentType: 'equal-payment' | 'equal-principal',
  principal: number,
  _years: number
) {
  // value には金額そのものを入れず、バケット ID のみを label に載せる。
  trackEvent('Calculation', 'Execute', `${repaymentType}/${bucketPrincipal(principal)}`);
}

export function trackHistorySave() {
  trackEvent('History', 'Save', 'Calculation Result');
}

export function trackHistoryDelete() {
  trackEvent('History', 'Delete', 'All Items');
}
