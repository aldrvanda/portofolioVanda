'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="site status-page" id="content">
      <h1 className="h2">Something broke while loading this page.</h1>
      <p className="body-lg muted">
        Reload to try again. You can also reach me directly at{' '}
        <a className="text-link" href="mailto:aldrvanda@gmail.com">
          aldrvanda@gmail.com
        </a>
        .
      </p>
      <button type="button" className="btn btn-primary" onClick={() => reset()}>
        Reload page
      </button>
    </main>
  );
}
