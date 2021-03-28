const path = require('path');
const os = require('os');

module.exports = async function ({ User, utils }) {
  const avatarPath = path.resolve(
    os.homedir(),
    'Dropbox',
    'profile-cropped.jpg',
  );

  await User.create({
    username: 'brad',
    password: '1',
    avatar: utils.imageFromFile(avatarPath),
  });
};
