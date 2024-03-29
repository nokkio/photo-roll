import { Link } from '@nokkio/router';
import type { PageMetadataFunction } from '@nokkio/router';

export const getPageMetadata: PageMetadataFunction = () => {
  return { title: 'Not found', http: { status: 404 } };
};

export default function NotFound() {
  return (
    <div className="w-full bg-gray-50 text-gray-500 py-12 text-center">
      Sorry, you appear to be lost.{' '}
      <Link className="underline" to="/">
        Head back home
      </Link>
      .
    </div>
  );
}
