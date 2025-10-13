import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

export function initGA() {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID is not set');
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gtagOptions: {
      send_page_view: false, // ページビューは手動で送信
    },
  });
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

// 住宅ローン計算アプリ専用のイベント
export function trackCalculation(
  repaymentType: 'equal-payment' | 'equal-principal',
  principal: number,
  _years: number
) {
  trackEvent('Calculation', 'Execute', repaymentType, principal);
}

export function trackHistorySave() {
  trackEvent('History', 'Save', 'Calculation Result');
}

export function trackHistoryDelete() {
  trackEvent('History', 'Delete', 'All Items');
}
