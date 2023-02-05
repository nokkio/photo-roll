export async function beforeFind({ query, userId }) {
  if (userId && query.userId) {
    return query;
  }

  return {
    ...query,
    isPublic: true,
  };
}

export async function beforeCreate({ fields, userId }) {
  if (!userId) {
    throw new Error('unauthorized');
  }

  return {
    ...fields,
    userId,
  };
}
