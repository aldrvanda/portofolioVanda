import Portfolio from '@/components/Portfolio';
import { getContent } from '@/lib/content';

// Revalidate berkala sebagai cadangan; update utama lewat webhook /api/revalidate.
export const revalidate = 3600;

export default async function Page() {
  const content = await getContent();
  return <Portfolio content={content} />;
}
