import { Suspense } from 'react';

import { Photo, usePhotoLikes } from '@nokkio/magic';
import { usePageData } from '@nokkio/router';
import type { PageDataArgs, PageMetadataFunction } from '@nokkio/router';
import { createImageURL } from '@nokkio/image';

import { default as PhotoComponent } from 'components/Photo';

export function getPageData({ params, auth }: PageDataArgs) {
  return Photo.findById(params.id, {
    with: {
      user: true,
      likes: auth ? { filter: { userId: auth.id } } : undefined,
    },
    withCounts: ['likes'],
  });
}

export const getPageMetadata: PageMetadataFunction<typeof getPageData> = ({
  pageData,
}) => {
  if (!pageData) {
    return { title: 'Photo not found', http: { status: 404 } };
  }

  return {
    title: `Photo Roll: ${pageData.caption} by ${pageData.user.username}`,
    openGraph: {
      image: {
        ...createImageURL(pageData.image, { width: 1400 }),
        alt: pageData.caption,
      },
    },
  };
};

function RecentLikes({ id }: { id: string }) {
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

export default function PhotoRoute({ params }: { params: { id: string } }) {
  const photo = usePageData<typeof getPageData>();

  if (photo === null) {
    return <h1>Photo not found</h1>;
  }

  return (
    <div className="space-y-6">
      <PhotoComponent key={photo.id} photo={photo} />
      <Suspense>
        <RecentLikes id={params.id} />
      </Suspense>
    </div>
  );
}
