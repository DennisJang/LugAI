// 크래시/에러 리포팅(Sentry) — DSN이 설정되고 Expo Go가 아닐 때만 활성화.
// EXPO_PUBLIC_SENTRY_DSN 미설정 시 완전 비활성(개발/기본).
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initMonitoring(): void {
  if (!DSN) return;
  try {
    // Expo Go에서는 네이티브 모듈이 링크되지 않으므로 건너뜀
    const Constants = require('expo-constants').default;
    if (Constants?.appOwnership === 'expo') return;

    const Sentry = require('@sentry/react-native');
    Sentry.init({ dsn: DSN, tracesSampleRate: 0.2, enableAutoSessionTracking: true });
  } catch {
    // 모니터링 초기화 실패가 앱 동작을 막지 않도록 무시
  }
}
