import type { ScanItem } from './mockScan';
import type { ClaimDraft } from './store';

export const EMPTY_DRAFT: ClaimDraft = { values: {}, excluded: [] };

export function isIncluded(draft: ClaimDraft, itemId: string): boolean {
  return !draft.excluded.includes(itemId);
}

/** 신고에 포함된 항목들의 추정 가치 합. */
export function claimTotal(draft: ClaimDraft, items: ScanItem[]): number {
  return items.reduce((sum, it) => (isIncluded(draft, it.id) ? sum + (draft.values[it.id] || 0) : sum), 0);
}

export interface ClaimLabels {
  title: string;
  airline: string;
  flightNo: string;
  bagTag: string;
  lostDate: string;
  destination: string;
  items: string;
  total: string;
  disclaimer: string;
}

/** 항공사 분실신고(PIR)에 붙여 쓸 물품 목록 텍스트 생성(공유용). 순수 함수. */
export function buildClaimText(opts: {
  destinationName: string;
  draft: ClaimDraft;
  items: ScanItem[];
  labels: ClaimLabels;
}): string {
  const { destinationName, draft, items, labels } = opts;
  const lines: string[] = [`[${labels.title}]`];
  const meta = [
    draft.airline && `${labels.airline}: ${draft.airline}`,
    draft.flightNo && `${labels.flightNo}: ${draft.flightNo}`,
    draft.bagTag && `${labels.bagTag}: ${draft.bagTag}`,
    draft.lostDate && `${labels.lostDate}: ${draft.lostDate}`,
  ].filter(Boolean);
  if (meta.length) lines.push(meta.join(' · '));
  lines.push(`${labels.destination}: ${destinationName}`, '');
  lines.push(`${labels.items}:`);
  for (const it of items) {
    if (!isIncluded(draft, it.id)) continue;
    const v = draft.values[it.id];
    lines.push(`- ${it.emoji} ${it.name}${v ? ` — ${v.toLocaleString()}` : ''}`);
  }
  lines.push('', `${labels.total}: ${claimTotal(draft, items).toLocaleString()}`, '', labels.disclaimer);
  return lines.join('\n');
}
