import React from 'react';

//import { usePhotos, deleteLike } from '@nokkio/magic';
//import { Img } from '@nokkio/image';
//import { useAuth } from '@nokkio/auth';

import { usePhoto } from '../../api/store';

export function getTitle() {
  return 'Photo';
}

function Button({ children, ...rest }) {
  return (
    <button className="disabled:text-gray-400 bg-white border p-2" {...rest}>
      {children}
    </button>
  );
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
      {photo.caption} - user: {photo.user.username} - likes: {photo.likesCount}
      {photo.likes.length > 0 && (
        <>
          <p>Likes:</p>
          <ul>
            {photo.likes.map((like) => (
              <li key={like.id}>
                {like.userId}{' '}
                <Button onClick={() => like.delete()}>delete</Button>
              </li>
            ))}
          </ul>
          <div className="flex space-x-2">
            {photo.likes.hasPrev() && (
              <Button onClick={() => photo.likes.prev()}>prev</Button>
            )}
            {photo.likes.hasNext() && (
              <Button onClick={() => photo.likes.next()}>next</Button>
            )}
          </div>
        </>
      )}
      {photo.likes.length === 0 && (
        <p>
          <Button onClick={() => photo.createLike()}>Like</Button>
        </p>
      )}
    </div>
  );
}

export default function PhotoScreen({ id }) {
  const photo = usePhoto(id, {
    with: { user: true, likes: { limit: 2 } },
    withCounts: ['likes'],
  });

  if (photo.isLoading) {
    return (
      <div className="w-full bg-gray-50 text-gray-300 py-12 text-center">
        Loading...
      </div>
    );
  }

  function setCaption() {
    photo.update({
      caption: 'hi hi ' + Date.now(),
    });
  }

  return (
    <div className="space-y-12">
      <Photo key={photo.id} photo={photo} />

      <div className="flex space-x-2">
        <Button onClick={setCaption}>set caption on first photo</Button>
      </div>
    </div>
  );
}
