import { LegalDoc } from '@/components/LegalDoc';
import { useLocale } from '@/lib/i18n';
import { getTerms } from '@/lib/legal';

export default function TermsScreen() {
  const locale = useLocale();
  return <LegalDoc doc={getTerms(locale)} />;
}
