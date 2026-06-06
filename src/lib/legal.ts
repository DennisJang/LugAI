import data from './legal-content.json';

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
export const PRIVACY = data.privacy as LegalDocData;
export const TERMS = data.terms as LegalDocData;
