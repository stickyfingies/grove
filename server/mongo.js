import mongoose from 'mongoose';
import md5 from 'md5';

const db = mongoose.connection;

const User = mongoose.model('User', {
  username: String,
  password: String,
  map: String,
  email: String,
  quest: String,
});

export const dbInit = () => {
  db.on('error', console.error);
  db.once('open', () => console.log('Successfully connected to MongoDB!'));

  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

// eslint-disable-next-line max-len
export const dbFindUser = async ({ username, password }) => User.findOne({ username, password: md5(password) }).exec();

export const dbNewUser = async ({ username, password, race }) => {
  const u = new User({
    username,
    password: md5(password),
    race,
    inventory: [],
    map: 'skjar-isles',
    level: 1,
    status: `u.${Date.now()}`,
  });
  return u.save();
};
