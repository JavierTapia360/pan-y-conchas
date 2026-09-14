'use client';
export default function Page() { return <main className="not-found"><b>OFFLINE</b><h1>You’re offline.<br />No tienes conexión.</h1><button className="button button-red" onClick={() => location.reload()}>Try again / Reintentar</button></main>; }
