import React from 'react';

import { usePhotos } from '@nokkio/magic';
import { useAuth } from '@nokkio/auth';

import Photo from '../components/Photo';

export function getTitle() {
  return 'Photo Roll';
}

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  const photos = usePhotos({
    sort: '-createdAt',
    limit: 10,
    with: isAuthenticated
      ? {
          user: true,
          likes: { filter: { userId: user.id } },
        }
      : ['user'],
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
