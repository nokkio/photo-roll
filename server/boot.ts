import { User, Photo, Like } from '@nokkio/magic';
import { NotAuthorizedError } from '@nokkio/errors';

export default async function () {
  User.beforeCreate('RESTRICT_TO_ENDPOINTS');
  User.beforeDelete('RESTRICT_TO_ENDPOINTS');
  User.beforeUpdate('RESTRICT_TO_ENDPOINTS');

  User.beforeFind(async ({ query, isTrusted }) => {
    if (isTrusted) {
      return query;
    }

    if (!query.id) {
      throw new NotAuthorizedError();
    }

    return query;
  });

  Photo.beforeCreate(async ({ fields, userId }) => {
    if (!userId || fields.userId !== userId) {
      throw new NotAuthorizedError();
    }

    return fields;
  });

  Photo.beforeUpdate('RESTRICT_TO_ENDPOINTS');
  Photo.beforeDelete('RESTRICT_TO_ENDPOINTS');

  Like.beforeCreate(async ({ userId, fields }) => {
    if (!userId || fields.userId !== userId) {
      throw new NotAuthorizedError();
    }

    return fields;
  });

  Like.beforeUpdate('RESTRICT_TO_ENDPOINTS');

  Like.beforeDelete(async ({ record, userId }) => {
    if (record.userId !== userId) {
      throw new NotAuthorizedError();
    }
  });
}
