module.exports = function ({ defineModel, types }) {
  const User = defineModel('User', {
    username: types.string().unique(),
    password: types.password(),
    avatar: types.image(),
  });

  const Photo = defineModel('Photo', {
    image: types.image(),
    caption: types.text(),
    isPublic: types.bool(true),
  });

  const Like = defineModel('Like');

  User.hasMany(Photo);
  User.actAsAuth();

  Like.isOneToOneOf(Photo, User);

  return {
    User,
    Photo,
    Like,
  };
};
