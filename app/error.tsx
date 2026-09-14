'use client';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="not-found"><b>500</b><h1>Something went wrong.<br />Algo salió mal.</h1><button className="button button-red" onClick={reset}>Retry / Reintentar</button></main>; }
