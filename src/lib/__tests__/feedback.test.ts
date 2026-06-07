import { submitFeedback } from '@/lib/feedback';

describe('submitFeedback', () => {
  it('returns false (graceful no-op) when Supabase env is unset', async () => {
    // jest 환경엔 EXPO_PUBLIC_SUPABASE_URL/ANON_KEY 미설정 → 네트워크 호출 없이 false
    const ok = await submitFeedback({
      anonId: 'anon-test',
      destCode: 'JP',
      itemKey: 'lighter',
      aiVerdict: 'danger',
      userVerdict: 'warning',
    });
    expect(ok).toBe(false);
  });
});
