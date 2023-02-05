import { Suspense } from 'react';

import { Photo, usePhotoLikes } from '@nokkio/magic';
import { usePageData } from '@nokkio/router';

import { default as PhotoComponent } from 'components/Photo';

export function getPageData({ params, auth }) {
  return Photo.findById(params.id, {
    with: auth
      ? {
          user: true,
          likes: { filter: { userId: auth.id } },
        }
      : ['user'],
    withCounts: ['likes'],
  });
}

export function getPageMetadata({ pageData }) {
  return {
    title: `Photo Roll: ${pageData.caption} by ${pageData.user.username}`,
  };
}

function RecentLikes({ id }) {
  const recentLikes = usePhotoLikes(id, {
    sort: '-createdAt',
    limit: 10,
    with: ['user'],
  });

  if (recentLikes.length === 0) {
    return null;
  }

  return (
    <div className="px-3">
      <h3 className="uppercase text-sm mb-1">Activity</h3>
      {recentLikes.map((like) => (
        <div key={like.id} className="text-sm text-gray-500">
          <span className="font-medium">
            {new Intl.DateTimeFormat('default', {
              dateStyle: 'short',
            }).format(like.createdAt)}
          </span>{' '}
          liked by <strong className="text-black">{like.user.username}</strong>
        </div>
      ))}
    </div>
  );
}

export default function PhotoRoute({ params }) {
  const photo = usePageData();

  return (
    <div className="space-y-6">
      <PhotoComponent key={photo.id} photo={photo} />
      <Suspense>
        <RecentLikes id={params.id} />
      </Suspense>
    </div>
  );
}
