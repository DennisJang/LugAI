import data from './legal-content.json';
import type { Locale } from './i18n';

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocData {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const SUPPORT_EMAIL = 'support@lugai.app';

// 단일 소스: legal-content.json (앱 화면 + docs/legal HTML 생성이 공유)
// ko는 한국어, 그 외(en/ja/zh)는 영어 약관으로 폴백
export function getPrivacy(locale: Locale): LegalDocData {
  return (locale === 'ko' ? data.ko.privacy : data.en.privacy) as LegalDocData;
}

export function getTerms(locale: Locale): LegalDocData {
  return (locale === 'ko' ? data.ko.terms : data.en.terms) as LegalDocData;
}
