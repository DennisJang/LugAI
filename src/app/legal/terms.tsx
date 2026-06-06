import { LegalDoc } from '@/components/LegalDoc';
import { TERMS } from '@/lib/legal';

export default function TermsScreen() {
  return <LegalDoc doc={TERMS} />;
}
