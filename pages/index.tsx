import { usePhotos } from '@nokkio/magic';
import { useAuth } from '@nokkio/auth';

import Photo from 'components/Photo';

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  const photos = usePhotos({
    sort: '-createdAt',
    limit: 10,
    with: {
      user: true,
      likes: isAuthenticated ? { filter: { userId: user.id } } : undefined,
    },
    withCounts: ['likes'],
  });

  if (photos.length === 0) {
    return (
      <div className="w-full bg-gray-50 text-gray-300 py-12 text-center">
        No photos yet.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {photos.map((photo) => (
        <Photo key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
