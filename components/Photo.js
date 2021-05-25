import React from 'react';

import { useAuth } from '@nokkio/auth';
import { Img } from '@nokkio/image';
import { Link } from '@nokkio/router';

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

export default function Photo({ photo }) {
  const { isAuthenticated } = useAuth();

  function toggleLike(e) {
    e.stopPropagation();
    e.preventDefault();

    // Currently a bug in Nokkio causing the parent "with" clause to
    // not filter, so do a bit of extra checking here.
    if (photo.likes.length === 1) {
      const like = photo.likes[0];
      like.delete();
    } else {
      photo.createLike();
    }
  }

  return (
    <Link to={`/photos/${photo.id}`} className="block bg-white shadow">
      <div className="p-6 flex space-x-2 font-medium items-center">
        <Img
          className="rounded-full w-8 h-8 border-2 border-indigo-700"
          image={photo.user.avatar}
          width={48}
        />
        <span>{photo.user.username}</span>
      </div>
      <div>
        <Img image={photo.image} className="w-full" />
      </div>
      <div className="p-3 space-y-1">
        {isAuthenticated ? (
          <button
            onClick={toggleLike}
            className="flex uppercase text-xs items-center space-x-1 text-gray-400"
          >
            <Heart /> <span>{photo.likesCount}</span>
          </button>
        ) : (
          <p className="flex uppercase text-xs items-center space-x-1 text-gray-400">
            <Heart /> <span>{photo.likesCount}</span>
          </p>
        )}
        <p>{photo.caption}</p>
        <p className="uppercase text-xs text-gray-400">
          {new Intl.DateTimeFormat('default', { dateStyle: 'medium' }).format(
            new Date(photo.createdAt),
          )}
        </p>
      </div>
    </Link>
  );
}
