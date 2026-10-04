'use client';

import { LanguageProvider, Tx, useT } from '@/lib/i18n';
import type { L } from '@/lib/types';
import type rawData from '@/lib/amazon-analytics.json';
import LanguageToggle from '../LanguageToggle';
import { ScrollProgress, useSiteMotion } from '../Motion';
import { IconArrowRight } from '../Icons';
import { SectionHeader } from '../Sections';
import { BarList, Columns, GroupedColumns, Heatmap, LineChart, compact, fmt, setNumLocale } from './Charts';

type Data = typeof rawData;

const inr = (n: number) => `₹${compact(n)}`;
const pct = (n: number, d = 1) => `${fmt(n, d)}%`;
const pval = (p: number) => (p < 0.001 ? '< 0.001' : fmt(p, 3));

const TOC: { id: string; label: L }[] = [
  { id: 'fixes', label: { en: 'Corrections', id: 'Koreksi' } },
  { id: 'data', label: { en: 'Data', id: 'Data' } },
  { id: 'sales', label: { en: 'Sales', id: 'Penjualan' } },
  { id: 'failed', label: { en: 'Failed orders', id: 'Order gagal' } },
  { id: 'tests', label: { en: 'Hypothesis tests', id: 'Uji hipotesis' } },
  { id: 'model', label: { en: 'Model', id: 'Model' } },
  { id: 'conclusions', label: { en: 'Conclusions', id: 'Kesimpulan' } },
];

function Panel({ title, sub, children, wide, takeaway }: { title: L; sub?: L; children: React.ReactNode; wide?: boolean; takeaway?: L }) {
  return (
    <section className={`panel${wide ? ' panel--wide' : ''}`}>
      <Tx v={title} as="h3" className="panel__title" />
      {sub && <Tx v={sub} as="p" className="panel__sub" />}
      {children}
      {takeaway && <Tx v={takeaway} as="p" className="takeaway" />}
    </section>
  );
}

function Pill({ kind, children }: { kind: 'sig' | 'weak' | 'no'; children: React.ReactNode }) {
  return <span className={`pill pill--${kind}`}>{children}</span>;
}

function Report({ d }: { d: Data }) {
  const { t, locale } = useT();
  setNumLocale(locale);
  useSiteMotion([locale]);

  const shipped = d.raw_rows - d.duplicates - d.failed_rows;
  const setShare = (d.categories[0].revenue / d.revenue) * 100;
  const wk = d.weekly_revenue;
  const firstHalf = wk.slice(0, 5).reduce((s, w) => s + w.revenue, 0) / 5;
  const lastHalf = wk.slice(-4).reduce((s, w) => s + w.revenue, 0) / 4;
  const weeklyDrop = ((lastHalf - firstHalf) / firstHalf) * 100;
  const merchant = d.failed_by_fulfilment.find((f) => f.fulfilment === 'Merchant')!;
  const amazon = d.failed_by_fulfilment.find((f) => f.fulfilment === 'Amazon')!;
  const promoMerchant = d.promo_by_fulfilment.find((f) => f.fulfilment === 'Merchant')!.promo_share;
  const promoAmazon = d.promo_by_fulfilment.find((f) => f.fulfilment === 'Amazon')!.promo_share;
  const b2b = d.segment_promo.find((s) => s.segment === 'B2B')!;
  const b2c = d.segment_promo.find((s) => s.segment === 'B2C')!;
  const plccShare = (d.promo_tags_top[0].count / d.promo_tag_total) * 100;
  const shipShare = (d.promo_tags_top[1].count / d.promo_tag_total) * 100;
  const months: Record<string, L> = {
    April: { en: 'April', id: 'April' },
    May: { en: 'May', id: 'Mei' },
    June: { en: 'June', id: 'Juni' },
  };
  const dateFmt = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short' });

  const fixes: { title: L; was: L; now: L }[] = [
    {
      title: { en: 'Duplicate check always returned 0', id: 'Cek duplikat selalu menghasilkan 0' },
      was: {
        en: "df.duplicated() ran with the 'index' column, a unique row number, so no row could ever be a duplicate.",
        id: "df.duplicated() dijalankan bersama kolom 'index' yang selalu unik, jadi tidak mungkin ada duplikat.",
      },
      now: {
        en: `Checked without 'index': ${d.duplicates} duplicate rows found and removed.`,
        id: `Dicek tanpa 'index': ${d.duplicates} baris duplikat ditemukan dan dihapus.`,
      },
    },
    {
      title: { en: 'March is a single day', id: 'Maret hanya satu hari' },
      was: {
        en: 'The monthly trend plotted March next to April–June, but March only holds 31 March (171 rows), so it looked like a collapse.',
        id: 'Tren bulanan menampilkan Maret di samping April–Juni, padahal Maret hanya berisi 31 Maret (171 baris), sehingga tampak seperti anjlok.',
      },
      now: {
        en: 'Date format set explicitly (MM-DD-YY); March excluded from trends; weekly trend uses full weeks only.',
        id: 'Format tanggal dibuat eksplisit (MM-DD-YY); Maret dikeluarkan dari tren; tren mingguan hanya memakai minggu penuh.',
      },
    },
    {
      title: { en: '“Discount” was not a discount', id: '“Diskon” ternyata bukan diskon' },
      was: {
        en: 'Any order with promotion-ids was labelled Discounted.',
        id: 'Setiap order dengan promotion-ids diberi label Discounted.',
      },
      now: {
        en: `${pct(plccShare)} of promotion tags are “PLCC Free-Financing” (card instalments) and ${pct(shipShare)} are free shipping. The feature is renamed Promo.`,
        id: `${pct(plccShare)} tag promosi adalah “PLCC Free-Financing” (cicilan kartu) dan ${pct(shipShare)} gratis ongkir. Fitur diganti nama menjadi Promo.`,
      },
    },
    {
      title: { en: 'Perfect multicollinearity in OLS', id: 'Multikolinearitas sempurna di OLS' },
      was: {
        en: 'fulfilled-by is “Easy Ship” for every Merchant order and empty for every Amazon order, so it duplicates Fulfilment. The OLS was singular: Fulfilment coefficient 4.7 × 10¹³.',
        id: 'fulfilled-by bernilai “Easy Ship” untuk semua order Merchant dan kosong untuk semua order Amazon, jadi identik dengan Fulfilment. OLS menjadi singular: koefisien Fulfilment 4,7 × 10¹³.',
      },
      now: {
        en: 'fulfilled-by dropped. The coefficient is now 27.8 (p = 0.27), and an empty value means fulfilled by Amazon, not “other couriers”.',
        id: 'fulfilled-by dihapus. Koefisien kini 27,8 (p = 0,27), dan nilai kosong berarti dipenuhi Amazon, bukan “kurir lain”.',
      },
    },
    {
      title: { en: 'ANOVA assumptions not checked', id: 'Asumsi ANOVA tidak dicek' },
      was: {
        en: 'One-way ANOVA on non-normal data with unequal variances, without an effect size.',
        id: 'ANOVA satu arah pada data tidak normal dengan varians tidak sama, tanpa effect size.',
      },
      now: {
        en: `Levene and Kruskal-Wallis added; η² = ${fmt(d.tests.anova.eta_sq, 3)}, so category explains ${pct(d.tests.anova.eta_sq * 100)} of order value.`,
        id: `Ditambah Levene dan Kruskal-Wallis; η² = ${fmt(d.tests.anova.eta_sq, 3)}, jadi kategori menjelaskan ${pct(d.tests.anova.eta_sq * 100)} variasi nilai order.`,
      },
    },
    {
      title: { en: 'Chi-square read as a real association', id: 'Chi-square dibaca sebagai asosiasi nyata' },
      was: {
        en: 'p = 0.013 was reported as “a significant association between B2B and discounts”.',
        id: 'p = 0,013 dilaporkan sebagai “asosiasi signifikan antara B2B dan diskon”.',
      },
      now: {
        en: `Cramér's V = ${fmt(d.tests.chi2.cramers_v, 4)}: negligible. With 106K rows almost any gap is “significant”.`,
        id: `Cramér's V = ${fmt(d.tests.chi2.cramers_v, 4)}: dapat diabaikan. Dengan 106 ribu baris, selisih sekecil apa pun jadi “signifikan”.`,
      },
    },
    {
      title: { en: "Cohen's d sign and thresholds", id: "Tanda dan ambang Cohen's d" },
      was: {
        en: 'd = −0.24 (A − B, opposite to the Δ shown) and labelled “medium”.',
        id: 'd = −0,24 (A − B, berlawanan dengan Δ yang ditampilkan) dan diberi label “sedang”.',
      },
      now: {
        en: `d = +${fmt(d.ab.Amount.d, 2)} (B − A), which is small on Cohen's scale (0.2 / 0.5 / 0.8). Qty: d = ${fmt(d.ab.Qty.d, 2)}, negligible.`,
        id: `d = +${fmt(d.ab.Amount.d, 2)} (B − A), tergolong kecil menurut skala Cohen (0,2 / 0,5 / 0,8). Qty: d = ${fmt(d.ab.Qty.d, 2)}, dapat diabaikan.`,
      },
    },
    {
      title: { en: 'The A/B test was confounded', id: 'A/B test terkonfound' },
      was: {
        en: `Promo vs no promo compared directly: +₹${fmt(d.ab.raw_diff)} per order.`,
        id: `Promo vs tanpa promo dibandingkan langsung: +₹${fmt(d.ab.raw_diff)} per order.`,
      },
      now: {
        en: `Promo is not random: ${pct(promoMerchant)} of Merchant orders have one vs ${pct(promoAmazon)} of Amazon orders. Compared within Fulfilment × Category, the gap is +₹${fmt(d.ab.adjusted_diff, 1)}.`,
        id: `Promo tidak acak: ${pct(promoMerchant)} order Merchant memilikinya vs ${pct(promoAmazon)} order Amazon. Dibandingkan di dalam Fulfilment × Kategori, selisihnya +₹${fmt(d.ab.adjusted_diff, 1)}.`,
      },
    },
    {
      title: { en: 'Tuned feature-importance chart used baseline values', id: 'Grafik feature importance tuned memakai nilai baseline' },
      was: {
        en: 'Bar colours and value labels were read from the baseline model (top_10) instead of the tuned one.',
        id: 'Warna bar dan label nilai diambil dari model baseline (top_10), bukan model tuned.',
      },
      now: { en: 'Chart reads the tuned model’s importances.', id: 'Grafik membaca importance dari model tuned.' },
    },
    {
      title: { en: 'Failed orders were never analysed', id: 'Order gagal tidak pernah dianalisis' },
      was: {
        en: 'df_failed was created and then left unused.',
        id: 'df_failed dibuat lalu tidak dipakai.',
      },
      now: {
        en: `Failed rate by fulfilment and category added: ${pct(d.failed_rate)} overall.`,
        id: `Ditambah failed rate per fulfilment dan kategori: ${pct(d.failed_rate)} secara keseluruhan.`,
      },
    },
  ];

  const tests: { name: string; q: L; result: string; verdict: L; kind: 'sig' | 'weak' | 'no' }[] = [
    {
      name: 'Shapiro-Wilk',
      q: { en: 'Is order value normally distributed?', id: 'Apakah nilai order berdistribusi normal?' },
      result: `W = ${fmt(d.tests.shapiro.w_a, 3)} / ${fmt(d.tests.shapiro.w_b, 3)}, p ${pval(d.tests.shapiro.p_a)}`,
      verdict: { en: 'Not normal → use non-parametric tests', id: 'Tidak normal → pakai uji non-parametrik' },
      kind: 'no',
    },
    {
      name: 'ANOVA + Kruskal-Wallis',
      q: { en: 'Does order value differ by category?', id: 'Apakah nilai order berbeda antar kategori?' },
      result: `H = ${compact(d.tests.anova.h)}, p ${pval(d.tests.anova.p_kruskal)}, η² = ${fmt(d.tests.anova.eta_sq, 2)}`,
      verdict: { en: 'Yes, large effect', id: 'Ya, efek besar' },
      kind: 'sig',
    },
    {
      name: 'Chi-square',
      q: { en: 'Are B2B buyers more likely to get a promo?', id: 'Apakah pembeli B2B lebih sering dapat promo?' },
      result: `χ² = ${fmt(d.tests.chi2.chi2, 2)}, p = ${fmt(d.tests.chi2.p, 3)}, V = ${fmt(d.tests.chi2.cramers_v, 3)}`,
      verdict: { en: 'Significant but negligible', id: 'Signifikan tapi dapat diabaikan' },
      kind: 'weak',
    },
    {
      name: 'Mann-Whitney U (Amount)',
      q: { en: 'Do promo orders have higher value?', id: 'Apakah order ber-promo bernilai lebih tinggi?' },
      result: `p ${pval(d.ab.Amount.p_mwu)}, d = ${fmt(d.ab.Amount.d, 2)}`,
      verdict: { en: 'Small, mostly confounding', id: 'Kecil, sebagian besar confounding' },
      kind: 'weak',
    },
    {
      name: 'Mann-Whitney U (Qty)',
      q: { en: 'Do promo orders contain more items?', id: 'Apakah order ber-promo berisi lebih banyak item?' },
      result: `p ${pval(d.ab.Qty.p_mwu)}, d = ${fmt(d.ab.Qty.d, 2)}`,
      verdict: { en: 'Negligible (1.00 vs 1.00)', id: 'Dapat diabaikan (1,00 vs 1,00)' },
      kind: 'no',
    },
  ];

  const rb = d.rf_baseline;
  const rt = d.rf_tuned;
  const featName: Record<string, L> = {
    Category: { en: 'Category', id: 'Kategori' },
    Size: { en: 'Size', id: 'Ukuran' },
    Qty: { en: 'Qty', id: 'Qty' },
    Promo: { en: 'Promo', id: 'Promo' },
    Month_cos: { en: 'Month (cos)', id: 'Bulan (cos)' },
    Month_sin: { en: 'Month (sin)', id: 'Bulan (sin)' },
    B2B: { en: 'B2B', id: 'B2B' },
    Fulfilment: { en: 'Fulfilment', id: 'Fulfilment' },
    'ship-service-level': { en: 'Service level', id: 'Level layanan' },
    'Sales Channel': { en: 'Sales channel', id: 'Kanal penjualan' },
  };

  return (
    <>
      <a href="#content" className="skip-link">
        {t({ en: 'Skip to content', id: 'Langsung ke konten' })}
      </a>
      <ScrollProgress />
      <header className="rpt-header">
        <div className="container rpt-header__inner">
          <a href="/#projects" className="rpt-header__back">
            <IconArrowRight size={14} /> Aldreine Vanda
          </a>
          <nav className="rpt-toc" aria-label={t({ en: 'Report sections', id: 'Bagian laporan' })}>
            {TOC.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {t(s.label)}
              </a>
            ))}
          </nav>
          <LanguageToggle />
        </div>
      </header>

      <main id="content" tabIndex={-1} className="rpt">
        <div className="container">
          {/* ── Hero ─────────────────────────────────────────────── */}
          <section className="rpt-hero" aria-labelledby="rpt-title">
            <Tx v={{ en: 'Data analytics case study', id: 'Studi kasus data analytics' }} className="eyebrow" />
            <h1 id="rpt-title" className="rpt-hero__title">
              {t({ en: 'Amazon India fashion sales', id: 'Penjualan fashion Amazon India' })}
            </h1>
            <Tx
              as="p"
              className="rpt-hero__lede"
              v={{
                en: `${fmt(d.raw_rows)} orders from ${dateFmt(d.date_min)} to ${dateFmt(d.date_max)} 2022. What sells, why orders fail, whether promotions matter, and how well order value can be predicted. The original notebook had ten analytical errors; every number on this page comes from the corrected version.`,
                id: `${fmt(d.raw_rows)} order dari ${dateFmt(d.date_min)} sampai ${dateFmt(d.date_max)} 2022. Apa yang laku, mengapa order gagal, apakah promosi berpengaruh, dan seberapa baik nilai order bisa diprediksi. Notebook awal memuat sepuluh kesalahan analisis; semua angka di halaman ini berasal dari versi yang sudah diperbaiki.`,
              }}
            />
            <div className="rpt-hero__meta tags">
              {['Python', 'pandas', 'SciPy', 'statsmodels', 'scikit-learn'].map((s) => (
                <span key={s} className="tag">
                  {s}
                </span>
              ))}
            </div>

            <dl className="kpis">
              <div className="kpi">
                <Tx as="dt" className="kpi__label" v={{ en: 'Completed orders', id: 'Order berhasil' }} />
                <dd className="kpi__value">{fmt(d.clean_rows)}</dd>
                <Tx as="dd" className="kpi__note" v={{ en: `of ${fmt(d.raw_rows)} raw rows`, id: `dari ${fmt(d.raw_rows)} baris mentah` }} />
              </div>
              <div className="kpi">
                <Tx as="dt" className="kpi__label" v={{ en: 'Revenue', id: 'Pendapatan' }} />
                <dd className="kpi__value">{inr(d.revenue)}</dd>
                <Tx as="dd" className="kpi__note" v={{ en: `${pct(setShare, 0)} from Sets`, id: `${pct(setShare, 0)} dari Set` }} />
              </div>
              <div className="kpi">
                <Tx as="dt" className="kpi__label" v={{ en: 'Median order', id: 'Median order' }} />
                <dd className="kpi__value">₹{fmt(d.amount_median)}</dd>
                <Tx as="dd" className="kpi__note" v={{ en: `${pct(d.qty1_share)} are a single item`, id: `${pct(d.qty1_share)} hanya satu item` }} />
              </div>
              <div className="kpi">
                <Tx as="dt" className="kpi__label" v={{ en: 'Failed orders', id: 'Order gagal' }} />
                <dd className="kpi__value">{pct(d.failed_rate)}</dd>
                <Tx as="dd" className="kpi__note" v={{ en: 'cancelled, returned or lost', id: 'batal, retur, atau hilang' }} />
              </div>
            </dl>
          </section>

          {/* ── Koreksi ──────────────────────────────────────────── */}
          <section className="rpt-section" id="fixes" aria-labelledby="fixes-title">
            <SectionHeader
              id="fixes"
              heading={{ en: 'Corrections', id: 'Koreksi' }}
              title={{ en: 'Ten errors found in the original notebook, and what changed.', id: 'Sepuluh kesalahan di notebook awal, dan apa yang berubah.' }}
            />
            <ol className="fixes">
              {fixes.map((f, i) => (
                <li key={i} className="fix">
                  <span className="fix__n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <Tx as="p" className="fix__title" v={f.title} />
                    <p className="fix__was">
                      <Tx className="fix__tag" v={{ en: 'Before', id: 'Sebelum' }} />
                      {t(f.was)}
                    </p>
                  </div>
                  <p className="fix__now">
                    <Tx className="fix__tag" v={{ en: 'After', id: 'Sesudah' }} />
                    {t(f.now)}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* ── Data ─────────────────────────────────────────────── */}
          <section className="rpt-section" id="data" aria-labelledby="data-title">
            <SectionHeader
              id="data"
              heading={{ en: 'The data', id: 'Datanya' }}
              title={{ en: 'From raw export to a clean modelling set.', id: 'Dari ekspor mentah ke data siap model.' }}
            />
            <div className="rpt-grid rpt-grid--2">
              <Panel
                title={{ en: 'Cleaning funnel', id: 'Alur pembersihan' }}
                sub={{ en: 'Rows kept at each step', id: 'Baris yang tersisa di tiap langkah' }}
                takeaway={{
                  en: `Pending orders stay in the clean set because they have not failed; ${fmt(shipped - d.clean_rows)} more rows are dropped for a missing or zero amount.`,
                  id: `Order pending tetap masuk karena belum gagal; ${fmt(shipped - d.clean_rows)} baris lain dibuang karena amount kosong atau nol.`,
                }}
              >
                <div className="funnel">
                  {[
                    { l: { en: 'Raw rows', id: 'Baris mentah' }, v: d.raw_rows },
                    { l: { en: 'Duplicates removed', id: 'Duplikat dihapus' }, v: d.duplicates, loss: true },
                    { l: { en: 'Failed orders split off', id: 'Order gagal dipisahkan' }, v: d.failed_rows, loss: true },
                    { l: { en: 'Shipped or pending', id: 'Terkirim atau pending' }, v: shipped },
                    { l: { en: 'Clean, amount > 0', id: 'Bersih, amount > 0' }, v: d.clean_rows },
                  ].map((r) => (
                    <div key={r.l.en} className={`funnel__row${r.loss ? ' funnel__row--loss' : ''}`}>
                      <Tx className="funnel__label" v={r.l} />
                      <span className="funnel__value">
                        {r.loss ? '−' : ''}
                        {fmt(r.v)}
                      </span>
                      <span className="funnel__bar" style={{ width: `${Math.max(0.8, (r.v / d.raw_rows) * 100)}%` }} />
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel
                title={{ en: 'Order value distribution', id: 'Distribusi nilai order' }}
                sub={{ en: 'Number of orders per ₹100 band (₹2,500+ grouped)', id: 'Jumlah order per rentang ₹100 (₹2.500+ digabung)' }}
                takeaway={{
                  en: `Right-skewed (skewness ${fmt(d.amount_skew, 2)}): median ₹${fmt(d.amount_median)}, mean ₹${fmt(d.amount_mean)}, range ₹${fmt(d.amount_min)}–₹${fmt(d.amount_max)}.`,
                  id: `Condong ke kanan (skewness ${fmt(d.amount_skew, 2)}): median ₹${fmt(d.amount_median)}, rata-rata ₹${fmt(d.amount_mean)}, rentang ₹${fmt(d.amount_min)}–₹${fmt(d.amount_max)}.`,
                }}
              >
                <Columns
                  caption={t({ en: 'Histogram of order value', id: 'Histogram nilai order' })}
                  data={d.amount_hist.map((h) => ({ label: String(h.from), value: h.count }))}
                  xLabel={(_, i) => (i % 5 === 0 ? `₹${compact(i * 100)}` : null)}
                  tipTitle={(p) => `₹${fmt(+p.label)}–₹${fmt(+p.label + 99)}`}
                  tipLine={(p) => `${fmt(p.value)} ${t({ en: 'orders', id: 'order' })}`}
                />
              </Panel>
            </div>
          </section>

          {/* ── Penjualan ────────────────────────────────────────── */}
          <section className="rpt-section" id="sales" aria-labelledby="sales-title">
            <SectionHeader
              id="sales"
              heading={{ en: 'What sells', id: 'Apa yang laku' }}
              title={{ en: 'Two categories carry the business, and demand cooled after early May.', id: 'Dua kategori menopang bisnis, dan permintaan melemah setelah awal Mei.' }}
            />
            <div className="rpt-grid rpt-grid--2">
              <Panel
                title={{ en: 'Revenue by category', id: 'Pendapatan per kategori' }}
                takeaway={{
                  en: `Set and kurta sell almost the same number of units (${compact(d.categories[0].units)} vs ${compact(d.categories[1].units)}), but a Set's median price is ₹${fmt(d.categories[0].median)} against ₹${fmt(d.categories[1].median)}, so Sets bring in ${pct(setShare, 0)} of revenue.`,
                  id: `Set dan kurta terjual hampir sama banyak (${compact(d.categories[0].units)} vs ${compact(d.categories[1].units)} unit), tetapi median harga Set ₹${fmt(d.categories[0].median)} dibanding ₹${fmt(d.categories[1].median)}, sehingga Set menyumbang ${pct(setShare, 0)} pendapatan.`,
                }}
              >
                <BarList
                  caption={t({ en: 'Revenue by category', id: 'Pendapatan per kategori' })}
                  rows={d.categories.map((c, i) => ({
                    key: c.category,
                    label: c.category,
                    value: c.revenue,
                    display: inr(c.revenue),
                    highlight: i === 0,
                    note: `${fmt(c.units)} units · median ₹${fmt(c.median)}`,
                  }))}
                />
              </Panel>
              <Panel
                title={{ en: 'Weekly revenue', id: 'Pendapatan mingguan' }}
                sub={{ en: 'Full weeks, Monday 4 April to Sunday 26 June', id: 'Minggu penuh, Senin 4 April sampai Minggu 26 Juni' }}
                takeaway={{
                  en: `The last four weeks average ${pct(Math.abs(weeklyDrop), 0)} less revenue than the first five.`,
                  id: `Rata-rata empat minggu terakhir ${pct(Math.abs(weeklyDrop), 0)} lebih rendah daripada lima minggu pertama.`,
                }}
              >
                <LineChart
                  caption={t({ en: 'Weekly revenue', id: 'Pendapatan mingguan' })}
                  points={wk.map((w) => ({ label: dateFmt(w.week), value: w.revenue }))}
                  tipTitle={(p) => `${t({ en: 'Week of', id: 'Minggu' })} ${p.label}`}
                  tipLine={(p) => `₹${fmt(p.value)}`}
                />
              </Panel>
              <Panel
                title={{ en: 'Units sold per month, top 3 categories', id: 'Unit terjual per bulan, 3 kategori teratas' }}
                sub={{ en: 'March left out: it holds a single day', id: 'Maret tidak dimasukkan: hanya berisi satu hari' }}
                takeaway={{
                  en: 'Set fell 30% from April to June and kurta 22%, while Western Dress grew 24%.',
                  id: 'Set turun 30% dari April ke Juni dan kurta 22%, sedangkan Western Dress naik 24%.',
                }}
              >
                <GroupedColumns
                  caption={t({ en: 'Units per month by category', id: 'Unit per bulan per kategori' })}
                  series={d.monthly_categories}
                  groups={d.monthly.map((m) => ({ label: t(months[m.month]), values: d.monthly_categories.map((c) => (m.values as Record<string, number>)[c]) }))}
                />
              </Panel>
              <Panel
                title={{ en: 'Units sold by size', id: 'Unit terjual per ukuran' }}
                takeaway={{
                  en: 'Demand sits in M to XL; 4XL and above together sell fewer units than XS.',
                  id: 'Permintaan terpusat di M sampai XL; 4XL ke atas jika digabung terjual lebih sedikit daripada XS.',
                }}
              >
                <Columns
                  caption={t({ en: 'Units by size', id: 'Unit per ukuran' })}
                  data={d.sizes.map((s) => ({ label: s.size, value: s.units }))}
                  tipTitle={(p) => p.label}
                  tipLine={(p) => `${fmt(p.value)} ${t({ en: 'units', id: 'unit' })}`}
                />
              </Panel>
              <Panel
                wide
                title={{ en: 'Median order value by category and size (₹)', id: 'Median nilai order per kategori dan ukuran (₹)' }}
                sub={{ en: 'Darker is pricier. Hatched cells have no orders.', id: 'Makin gelap makin mahal. Sel bergaris tidak memiliki order.' }}
                takeaway={{
                  en: 'Price is set by category, and from XS to 3XL it barely moves. Only Set and kurta come in 4XL–6XL, and there the price jumps by about 70% (a Set goes from ₹788 to ₹1,325), which is why Size still matters in the model.',
                  id: 'Harga ditentukan oleh kategori, dan dari XS sampai 3XL hampir tidak berubah. Hanya Set dan kurta yang tersedia dalam 4XL–6XL, dan di sana harga naik sekitar 70% (Set dari ₹788 menjadi ₹1.325), karena itu Size tetap berpengaruh di model.',
                }}
              >
                <Heatmap
                  caption={t({ en: 'Median order value by category and size', id: 'Median nilai order per kategori dan ukuran' })}
                  cols={d.heatmap.sizes}
                  rows={d.heatmap.rows.map((r) => ({ label: r.category, values: r.values }))}
                  tip={(row, col, v) => `${row} · ${col}: ₹${fmt(v)}`}
                />
              </Panel>
              <Panel
                wide
                title={{ en: 'Revenue by shipping state, top 8', id: 'Pendapatan per negara bagian tujuan, 8 teratas' }}
                takeaway={{
                  en: `The top five states take ${pct(d.state_top5_share, 0)} of revenue.`,
                  id: `Lima negara bagian teratas menyumbang ${pct(d.state_top5_share, 0)} pendapatan.`,
                }}
              >
                <BarList
                  caption={t({ en: 'Revenue by state', id: 'Pendapatan per negara bagian' })}
                  rows={d.top_states.map((s) => ({ key: s.state, label: s.state, value: s.revenue, display: inr(s.revenue) }))}
                />
              </Panel>
            </div>
          </section>

          {/* ── Order gagal ──────────────────────────────────────── */}
          <section className="rpt-section" id="failed" aria-labelledby="failed-title">
            <SectionHeader
              id="failed"
              heading={{ en: 'Failed orders', id: 'Order gagal' }}
              title={{ en: 'One order in six never reaches the buyer.', id: 'Satu dari enam order tidak sampai ke pembeli.' }}
            />
            <div className="rpt-grid rpt-grid--2">
              <Panel
                title={{ en: 'Failed rate by fulfilment', id: 'Failed rate per fulfilment' }}
                takeaway={{
                  en: `Merchant-fulfilled orders fail ${pct(merchant.rate)} of the time against ${pct(amazon.rate)} for Amazon-fulfilled ones. That gap is larger than any gap between categories.`,
                  id: `Order yang dipenuhi Merchant gagal ${pct(merchant.rate)} dibanding ${pct(amazon.rate)} untuk order yang dipenuhi Amazon. Selisih ini lebih besar daripada selisih antar kategori mana pun.`,
                }}
              >
                <BarList
                  caption={t({ en: 'Failed rate by fulfilment', id: 'Failed rate per fulfilment' })}
                  max={25}
                  rows={d.failed_by_fulfilment.map((f) => ({
                    key: f.fulfilment,
                    label: f.fulfilment,
                    value: f.rate,
                    display: pct(f.rate),
                    highlight: f.fulfilment === 'Merchant',
                    note: `${fmt(f.orders)} orders`,
                  }))}
                />
              </Panel>
              <Panel
                title={{ en: 'Failed rate by category', id: 'Failed rate per kategori' }}
                sub={{ en: 'Categories with at least 100 orders', id: 'Kategori dengan minimal 100 order' }}
                takeaway={{
                  en: 'Every category fails between 13% and 17%, so the cause is in fulfilment and delivery, not in the product mix.',
                  id: 'Semua kategori gagal antara 13% dan 17%, jadi penyebabnya ada di fulfilment dan pengiriman, bukan di jenis produk.',
                }}
              >
                <BarList
                  caption={t({ en: 'Failed rate by category', id: 'Failed rate per kategori' })}
                  max={25}
                  rows={d.failed_by_category
                    .filter((c) => c.orders >= 100)
                    .map((c) => ({ key: c.category, label: c.category, value: c.rate, display: pct(c.rate), note: `${fmt(c.orders)} orders` }))}
                />
              </Panel>
            </div>
          </section>

          {/* ── Uji hipotesis ────────────────────────────────────── */}
          <section className="rpt-section" id="tests" aria-labelledby="tests-title">
            <SectionHeader
              id="tests"
              heading={{ en: 'Hypothesis tests', id: 'Uji hipotesis' }}
              title={{ en: 'With 106K rows, effect size matters more than the p-value.', id: 'Dengan 106 ribu baris, effect size lebih penting daripada p-value.' }}
            />
            <div className="rpt-grid rpt-grid--2">
              <Panel wide title={{ en: 'All tests at α = 0.05', id: 'Semua uji pada α = 0,05' }}>
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th scope="col">{t({ en: 'Test', id: 'Uji' })}</th>
                        <th scope="col">{t({ en: 'Question', id: 'Pertanyaan' })}</th>
                        <th scope="col">{t({ en: 'Result', id: 'Hasil' })}</th>
                        <th scope="col">{t({ en: 'Verdict', id: 'Kesimpulan' })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((x) => (
                        <tr key={x.name}>
                          <th scope="row">{x.name}</th>
                          <td>{t(x.q)}</td>
                          <td>{x.result}</td>
                          <td>
                            <Pill kind={x.kind}>{t(x.verdict)}</Pill>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel
                title={{ en: 'Do promotions raise order value?', id: 'Apakah promosi menaikkan nilai order?' }}
                sub={{ en: 'Mean order value, promo minus no promo', id: 'Rata-rata nilai order, promo dikurangi tanpa promo' }}
                takeaway={{
                  en: `Most of the raw gap comes from who gets promotions: ${pct(promoMerchant)} of Merchant orders carry one, against ${pct(promoAmazon)} of Amazon orders. Comparing like with like leaves +₹${fmt(d.ab.adjusted_diff, 1)}, about 2% of a typical order. The OLS coefficient for Promo agrees (+₹11.3).`,
                  id: `Sebagian besar selisih mentah berasal dari siapa yang mendapat promo: ${pct(promoMerchant)} order Merchant memilikinya, dibanding ${pct(promoAmazon)} order Amazon. Jika dibandingkan setara, tersisa +₹${fmt(d.ab.adjusted_diff, 1)}, sekitar 2% dari order biasa. Koefisien OLS untuk Promo sejalan (+₹11,3).`,
                }}
              >
                <div className="compare">
                  <div className="compare__cell">
                    <Tx className="kpi__label" v={{ en: 'Raw difference', id: 'Selisih mentah' }} />
                    <span className="compare__value">+₹{fmt(d.ab.raw_diff, 1)}</span>
                  </div>
                  <div className="compare__cell">
                    <Tx className="kpi__label" v={{ en: 'Within fulfilment × category', id: 'Di dalam fulfilment × kategori' }} />
                    <span className="compare__value">+₹{fmt(d.ab.adjusted_diff, 1)}</span>
                  </div>
                </div>
                <BarList
                  caption={t({ en: 'Promo effect per stratum', id: 'Efek promo per strata' })}
                  max={60}
                  rows={d.ab.strata.map((s) => ({
                    key: s.category,
                    label: `${s.category}`,
                    value: Math.abs(s.diff),
                    display: `${s.diff >= 0 ? '+' : '−'}₹${fmt(Math.abs(s.diff))}`,
                    highlight: s.diff < 0,
                    note: `Amazon-fulfilled · n = ${fmt(s.n)}`,
                  }))}
                />
                <Tx
                  as="p"
                  className="panel__sub"
                  v={{
                    en: 'Amazon-fulfilled orders by category (Merchant orders almost all have a promo, so they have no comparison group). Highlighted bars are negative.',
                    id: 'Order yang dipenuhi Amazon per kategori (hampir semua order Merchant ber-promo, jadi tidak ada kelompok pembanding). Bar yang disorot bernilai negatif.',
                  }}
                />
              </Panel>
              <Panel
                title={{ en: 'B2B vs B2C promo share', id: 'Porsi promo B2B vs B2C' }}
                takeaway={{
                  en: `B2B buyers get a promo on ${pct(b2b.promo_share)} of orders and B2C buyers on ${pct(b2c.promo_share)}. The chi-square p-value is below 0.05, but Cramér's V of ${fmt(d.tests.chi2.cramers_v, 3)} says there is no practical link. B2B is also only ${pct(d.b2b_units_share, 2)} of units.`,
                  id: `Pembeli B2B mendapat promo pada ${pct(b2b.promo_share)} order dan B2C pada ${pct(b2c.promo_share)}. P-value chi-square di bawah 0,05, tetapi Cramér's V sebesar ${fmt(d.tests.chi2.cramers_v, 3)} menunjukkan tidak ada hubungan praktis. B2B juga hanya ${pct(d.b2b_units_share, 2)} dari unit.`,
                }}
              >
                <BarList
                  caption={t({ en: 'Promo share by segment', id: 'Porsi promo per segmen' })}
                  max={100}
                  rows={d.segment_promo.map((s) => ({
                    key: s.segment,
                    label: s.segment,
                    value: s.promo_share,
                    display: pct(s.promo_share),
                    note: `${fmt(s.orders)} orders`,
                  }))}
                />
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th scope="col">{t({ en: 'Segment', id: 'Segmen' })}</th>
                        <th scope="col" className="num">
                          {t({ en: 'Promo', id: 'Promo' })}
                        </th>
                        <th scope="col" className="num">
                          {t({ en: 'No promo', id: 'Tanpa promo' })}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(d.tests.chi2.table).map(([k, v]) => (
                        <tr key={k}>
                          <th scope="row">{k}</th>
                          <td className="num">{fmt(v.promo)}</td>
                          <td className="num">{fmt(v.no_promo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </section>

          {/* ── Model ────────────────────────────────────────────── */}
          <section className="rpt-section" id="model" aria-labelledby="model-title">
            <SectionHeader
              id="model"
              heading={{ en: 'Predicting order value', id: 'Memprediksi nilai order' }}
              title={{ en: 'A Random Forest explains half the variance. Tuning barely moves it.', id: 'Random Forest menjelaskan separuh variansi. Tuning hampir tidak mengubahnya.' }}
            />
            <div className="rpt-grid rpt-grid--2">
              <Panel
                title={{ en: 'Test set performance', id: 'Performa di test set' }}
                sub={{
                  en: `80/20 split: ${fmt(d.train_rows)} training rows, ${fmt(d.test_rows)} test rows`,
                  id: `Split 80/20: ${fmt(d.train_rows)} baris latih, ${fmt(d.test_rows)} baris uji`,
                }}
                takeaway={{
                  en: `The tuned model (max_depth 10, max_features 0.5, no bootstrap) gains ${fmt(rt.r2 - rb.r2, 4)} R². The ceiling is the features: without the product's list price or SKU, category and size can only place an order within a price band.`,
                  id: `Model tuned (max_depth 10, max_features 0,5, tanpa bootstrap) hanya menambah ${fmt(rt.r2 - rb.r2, 4)} R². Batasnya ada pada fitur: tanpa harga katalog atau SKU, kategori dan ukuran hanya bisa menempatkan order dalam rentang harga.`,
                }}
              >
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th scope="col">{t({ en: 'Metric', id: 'Metrik' })}</th>
                        <th scope="col" className="num">
                          Baseline
                        </th>
                        <th scope="col" className="num">
                          Tuned
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['R²', fmt(rb.r2, 4), fmt(rt.r2, 4)],
                        ['MAE', `₹${fmt(rb.mae, 2)}`, `₹${fmt(rt.mae, 2)}`],
                        ['RMSE', `₹${fmt(rb.rmse, 2)}`, `₹${fmt(rt.rmse, 2)}`],
                        ['MAPE', pct(rb.mape, 2), pct(rt.mape, 2)],
                        [t({ en: 'CV R² (5-fold)', id: 'CV R² (5-fold)' }), `${fmt(rb.cv_mean, 4)} ± ${fmt(rb.cv_std, 4)}`, `${fmt(rt.cv_mean, 4)} ± ${fmt(rt.cv_std, 4)}`],
                      ].map(([m, a, b]) => (
                        <tr key={m}>
                          <th scope="row">{m}</th>
                          <td className="num">{a}</td>
                          <td className="num">{b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel
                title={{ en: 'Feature importance, tuned model', id: 'Feature importance, model tuned' }}
                sub={{ en: 'Mean decrease in impurity', id: 'Mean decrease in impurity' }}
                takeaway={{
                  en: `Category alone accounts for ${pct(rt.importance[0].value * 100, 0)} of the importance, consistent with the ANOVA and Kruskal-Wallis results.`,
                  id: `Kategori sendiri mencakup ${pct(rt.importance[0].value * 100, 0)} importance, konsisten dengan hasil ANOVA dan Kruskal-Wallis.`,
                }}
              >
                <BarList
                  caption={t({ en: 'Feature importance', id: 'Feature importance' })}
                  rows={rt.importance.map((f, i) => ({
                    key: f.feature,
                    label: t(featName[f.feature] ?? { en: f.feature }),
                    value: f.value,
                    display: fmt(f.value, 3),
                    highlight: i === 0,
                  }))}
                />
              </Panel>
            </div>
          </section>

          {/* ── Kesimpulan ───────────────────────────────────────── */}
          <section className="rpt-section" id="conclusions" aria-labelledby="conclusions-title">
            <SectionHeader
              id="conclusions"
              heading={{ en: 'Conclusions', id: 'Kesimpulan' }}
              title={{ en: 'What the corrected analysis supports.', id: 'Apa yang didukung oleh analisis yang sudah diperbaiki.' }}
            />
            <div className="conclusions">
              {[
                {
                  h: { en: 'Protect the Set line', id: 'Jaga lini Set' },
                  p: {
                    en: `Sets earn ${pct(setShare, 0)} of revenue at the highest volume, yet their units fell 30% from April to June. Stock and visibility for Sets are the largest lever.`,
                    id: `Set menghasilkan ${pct(setShare, 0)} pendapatan dengan volume tertinggi, tetapi unitnya turun 30% dari April ke Juni. Stok dan visibilitas Set adalah tuas terbesar.`,
                  },
                },
                {
                  h: { en: 'Fix Merchant fulfilment first', id: 'Benahi fulfilment Merchant dulu' },
                  p: {
                    en: `Merchant orders fail at ${pct(merchant.rate)} versus ${pct(amazon.rate)} for Amazon. Bringing them to Amazon's rate would save about ${fmt(Math.round((merchant.rate - amazon.rate) / 100 * merchant.orders))} orders in this quarter.`,
                    id: `Order Merchant gagal ${pct(merchant.rate)} dibanding ${pct(amazon.rate)} untuk Amazon. Menyamakan ke tingkat Amazon akan menyelamatkan sekitar ${fmt(Math.round((merchant.rate - amazon.rate) / 100 * merchant.orders))} order di kuartal ini.`,
                  },
                },
                {
                  h: { en: "Don't credit promotions with higher prices", id: 'Jangan anggap promosi menaikkan harga' },
                  p: {
                    en: `The promotions are mostly instalment financing and free shipping. Once fulfilment and category are held fixed, they add about ₹${fmt(d.ab.adjusted_diff, 1)} per order, and they do not change basket size.`,
                    id: `Promosi ini sebagian besar berupa cicilan dan gratis ongkir. Setelah fulfilment dan kategori disamakan, efeknya sekitar ₹${fmt(d.ab.adjusted_diff, 1)} per order, dan tidak mengubah jumlah item.`,
                  },
                },
                {
                  h: { en: 'Better features beat more tuning', id: 'Fitur lebih baik, bukan tuning lebih banyak' },
                  p: {
                    en: 'Tuning added under 0.01 R². To predict order value well, the model needs the product list price, SKU-level history or the discount amount, none of which is in this export.',
                    id: 'Tuning menambah kurang dari 0,01 R². Untuk memprediksi nilai order dengan baik, model membutuhkan harga katalog, riwayat per SKU, atau nominal diskon, yang tidak ada dalam ekspor ini.',
                  },
                },
              ].map((c) => (
                <article key={c.h.en} className="conclusion">
                  <Tx as="h3" v={c.h} />
                  <Tx as="p" v={c.p} />
                </article>
              ))}
            </div>

            <footer className="rpt-foot">
              <Tx
                as="p"
                v={{
                  en: 'Source: “Amazon Sale Report” (Kaggle, E-Commerce Sales Dataset), Amazon.in orders 31 March – 29 June 2022, amounts in INR.',
                  id: 'Sumber: “Amazon Sale Report” (Kaggle, E-Commerce Sales Dataset), order Amazon.in 31 Maret – 29 Juni 2022, nilai dalam INR.',
                }}
              />
              <Tx
                as="p"
                v={{
                  en: 'Analysis by Aldreine Vanda Kauntu for the Data Analytics final exam, BINUS University. Figures regenerated with scripts/amazon-analytics/build_data.py.',
                  id: 'Analisis oleh Aldreine Vanda Kauntu untuk UAS Data Analytics, BINUS University. Angka dihasilkan ulang dengan scripts/amazon-analytics/build_data.py.',
                }}
              />
            </footer>
          </section>
        </div>
      </main>
    </>
  );
}

export default function AmazonReport({ data }: { data: Data }) {
  return (
    <LanguageProvider>
      <Report d={data} />
    </LanguageProvider>
  );
}
