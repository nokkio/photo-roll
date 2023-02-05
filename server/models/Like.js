export async function beforeCreate({ fields, userId }) {
  if (!userId) {
    throw new Error('unauthorized');
  }

  return {
    ...fields,
    userId,
  };
}

export async function beforeFind({ query }) {
  if (!query.photoId && !query.userId) {
    throw new Error('Unauthorized');
  }

  return query;
}
