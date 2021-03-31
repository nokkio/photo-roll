const path = require('path');
const { promises: fs } = require('fs');
const os = require('os');

function getRandomFrom(arr, number) {
  return arr
    .slice(0)
    .sort(() => Math.random() - 0.5)
    .slice(0, number);
}

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

module.exports = async function ({ User, Photo, Like, utils }) {
  const basePath = path.resolve(os.homedir(), 'Dropbox', 'demo-photos');
  const avatarPath = path.resolve(
    os.homedir(),
    'Dropbox',
    'profile-cropped.jpg',
  );

  const userIds = [];
  for (let i = 0; i < 20; i++) {
    const user = await User.create({
      username: `brad-${i}`,
      password: '1',
      avatar: utils.imageFromFile(avatarPath),
    });

    userIds.push(user.id);
  }

  const dir = path.resolve(basePath, 'bikes');
  const images = await fs.readdir(dir);

  for (image of images) {
    const [userId] = getRandomFrom(userIds, 1);

    const photo = await Photo.create({
      image: utils.imageFromFile(path.resolve(dir, image)),
      caption: image,
      userId,
    });

    const likeNumber = randomBetween(1, 10);

    for (let i = 0; i < likeNumber; i++) {
      await Like.create({
        userId: userIds[i + 1],
        photoId: photo.id,
      });
    }
  }
};
