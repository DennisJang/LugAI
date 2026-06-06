import { LegalDoc } from '@/components/LegalDoc';
import { useLocale } from '@/lib/i18n';
import { getPrivacy } from '@/lib/legal';

export default function PrivacyScreen() {
  const locale = useLocale();
  return <LegalDoc doc={getPrivacy(locale)} />;
}
