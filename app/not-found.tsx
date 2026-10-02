import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="site status-page" id="content">
      <h1 className="h2">This page isn&apos;t in the dataset.</h1>
      <p className="body-lg muted">Error 404. The link may be mistyped, or the page has moved.</p>
      <Link href="/" className="btn btn-primary">
        Back to home
      </Link>
    </main>
  );
}
