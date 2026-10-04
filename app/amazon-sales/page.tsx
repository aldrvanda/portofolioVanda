import type { Metadata } from 'next';
import AmazonReport from '@/components/amazon/AmazonReport';
import data from '@/lib/amazon-analytics.json';
import './amazon.css';

export const metadata: Metadata = {
  title: 'Amazon India Sales Analysis — Aldreine Vanda Kauntu',
  description:
    'Analysis of 128,975 Amazon India orders (Apr–Jun 2022): what sells, why orders fail, hypothesis tests, and a Random Forest price model.',
  alternates: { canonical: '/amazon-sales' },
};

export default function Page() {
  return <AmazonReport data={data} />;
}
