import React from 'react';

import { usePhotos } from '@nokkio/magic';
import { Img } from '@nokkio/image';

export function getTitle() {
  return 'Photo Roll';
}

function Heart() {
  return (
    <svg
      className="w-4 h-4 text-red-600"
      fill="currentColor"
      stroke="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function Photo({ photo }) {
  return (
    <div className="bg-white shadow">
      <div className="p-6 flex space-x-2 font-medium items-center">
        <Img
          className="rounded-full w-8 h-8 border-2 border-indigo-700"
          image={photo.user.avatar}
          width={48}
        />
        <span>{photo.user.username}</span>
      </div>
      <div>
        <Img image={photo.image} width={700} />
      </div>
      <div className="p-3 space-y-1">
        <p className="flex uppercase text-xs items-center space-x-1 text-gray-400">
          <Heart /> <span>0</span>
        </p>
        <p>{photo.caption}</p>
        <p className="uppercase text-xs text-gray-400">
          {new Intl.DateTimeFormat('default', { dateStyle: 'medium' }).format(
            new Date(photo.createdAt),
          )}
        </p>
      </div>
    </div>
  );
}

export default function Index() {
  const { photos } = usePhotos({
    sort: '-createdAt',
    limit: 10,
    with: ['user'],
  });

  if (photos.isLoading) {
    return (
      <div className="w-full bg-gray-50 text-gray-300 py-12 text-center">
        Loading...
      </div>
    );
  }

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
