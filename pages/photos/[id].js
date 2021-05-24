import React from 'react';

import { usePhoto, usePhotoLikes } from '@nokkio/magic';
import { useAuth } from '@nokkio/auth';

import Photo from '../../components/Photo';

export function getTitle() {
  return 'Photo Roll';
}

export default function PhotoRoute({ id }) {
  const { isAuthenticated, user } = useAuth();

  const photo = usePhoto(id, {
    with: isAuthenticated
      ? {
          user: true,
          likes: { userId: user.id },
        }
      : ['user'],
    withCounts: ['likes'],
  });

  const recentLikes = usePhotoLikes(id, {
    sort: '-createdAt',
    limit: 10,
    with: ['user'],
  });

  if (photo.isLoading) {
    return (
      <div className="w-full bg-gray-50 text-gray-300 py-12 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Photo key={photo.id} photo={photo} />

      {!recentLikes.isLoading && recentLikes.length > 0 && (
        <div className="px-3">
          <h3 className="uppercase text-sm mb-1">Activity</h3>
          {recentLikes.map((like) => (
            <div key={like.id} className="text-sm text-gray-500">
              <span className="font-medium">
                {new Intl.DateTimeFormat('default', {
                  dateStyle: 'short',
                }).format(new Date(like.createdAt))}
              </span>{' '}
              liked by{' '}
              <strong className="text-black">{like.user.username}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
