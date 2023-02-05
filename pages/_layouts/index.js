import React, { Suspense } from 'react';
import { Link, useLocation } from '@nokkio/router';

import './root.css';

function Loading() {
  return (
    <div className="w-full bg-gray-50 text-gray-300 py-12 text-center">
      Loading...
    </div>
  );
}

export default function PageLayout({ children }) {
  const n = useLocation();

  const shouldShowUploadButton = !['/login', '/register', '/upload'].includes(
    n.pathname,
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-2xl mx-auto">
        <header className="py-12 flex items-center justify-center">
          <h1 className="text-4xl font-bold hover:text-indigo-500">
            <Link to="/">Photo Roll</Link>
          </h1>
        </header>
        <div className="mx-2 md:mx-0">
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </div>
        <footer className="p-12 flex flex-col items-center justify-center text-sm text-gray-500">
          👋
          <p className="mt-1">
            Built with{' '}
            <a className="underline" href="https://nokk.io">
              nokk.io
            </a>
          </p>
        </footer>
      </main>
      {shouldShowUploadButton && (
        <Link
          to="/upload"
          className="text-xs absolute md:fixed top-4 right-4 border-2 border-indigo-700 text-indigo-700 transition hover:bg-indigo-700 px-4 py-2 rounded md:text-sm hover:text-indigo-50"
        >
          Upload
        </Link>
      )}
    </div>
  );
}
