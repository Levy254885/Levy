import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="wrap">
      <div className="notfound">
        <h1>404</h1>
        <p className="p">That page doesn&apos;t exist.</p>
        <Link className="btn" href="/">Back home</Link>
      </div>
    </main>
  );
}
