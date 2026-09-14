import Link from 'next/link';
import { EditorialArrow } from '@/components/editorial-arrow';

export default function Page() {
  return (
    <main className="legal-page">
      <p className="section-kicker">CUATESFARMZ / ADMIN LOCAL</p>
      <h1>Sin inicio de sesión</h1>
      <p>
        Esta fase usa una herramienta local del navegador y no tiene
        autenticación ni backend.
      </p>
      <Link className="button button-red" href="/admin">
        Abrir Admin <EditorialArrow />
      </Link>
    </main>
  );
}
