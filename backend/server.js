const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/insta_clone';

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    loginId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String, required: true }
  },
  { timestamps: true }
);

const profileSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    bio: { type: String, default: '' },
    postsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    ownerUsername: { type: String, required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, default: '' },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    location: { type: String, default: '' }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Post = mongoose.model('Post', postSchema);

const PROFILE_USERNAME = 'KASHISH';

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const normalizedLoginId = String(loginId || '').trim();
    if (!normalizedLoginId) {
      return res.status(400).json({ message: 'loginId is required' });
    }

    const safePassword = String(password || '');
    const user = await User.findOneAndUpdate(
      { loginId: normalizedLoginId },
      {
        $set: {
          password: safePassword,
          displayName: normalizedLoginId
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
    );

    return res.json({
      authenticated: true,
      visitor: {
        id: user._id,
        loginId: user.loginId,
        displayName: user.displayName
      },
      redirectToProfile: PROFILE_USERNAME
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/profile/public', async (req, res) => {
  try {
    let profile = await Profile.findOne({ username: PROFILE_USERNAME }).lean();
    if (!profile) {
      const createdProfile = await Profile.create({
        username: PROFILE_USERNAME,
        displayName: 'Your Name',
        avatarUrl: 'https://i.pravatar.cc/300?img=12',
        bio: 'Creator | Lifestyle | Travel',
        postsCount: 0,
        followersCount: 12450,
        followingCount: 345
      });
      profile = createdProfile.toObject();
    }
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: 'Profile fetch failed', error: error.message });
  }
});

app.get('/api/profile/public/posts', async (req, res) => {
  try {
    const posts = await Post.find({ ownerUsername: PROFILE_USERNAME }).sort({ createdAt: -1 }).lean();
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: 'Posts fetch failed', error: error.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const visitorCount = await User.countDocuments();
    if (visitorCount === 0) {
      await User.insertMany([
        { loginId: 'guest1', password: 'guest123', displayName: 'Guest One' },
        { loginId: 'guest2', password: 'guest123', displayName: 'Guest Two' }
      ]);
    }

    const profile = await Profile.findOne({ username: PROFILE_USERNAME });
    if (!profile) {
      await Profile.create({
        username: PROFILE_USERNAME,
        displayName: 'Your Name',
        avatarUrl: 'https://i.pravatar.cc/300?img=12',
        bio: 'Creator | Lifestyle | Travel',
        postsCount: 3,
        followersCount: 12450,
        followingCount: 345
      });
    }

    const postsCount = await Post.countDocuments({ ownerUsername: PROFILE_USERNAME });
    if (postsCount === 0) {
      await Post.insertMany([
        {
          ownerUsername: PROFILE_USERNAME,
          imageUrl: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?auto=format&fit=crop&w=900&q=80',
          caption: 'City mornings and coffee.',
          likesCount: 2421,
          commentsCount: 65,
          location: 'Mumbai'
        },
        {
          ownerUsername: PROFILE_USERNAME,
          imageUrl: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=900&q=80',
          caption: 'Slow days are the best days.',
          likesCount: 1932,
          commentsCount: 41,
          location: 'Goa'
        },
        {
          ownerUsername: PROFILE_USERNAME,
          imageUrl: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
          caption: 'Weekend dump.',
          likesCount: 3188,
          commentsCount: 109,
          location: 'Delhi'
        }
      ]);
    }

    return res.json({ seeded: true });
  } catch (error) {
    return res.status(500).json({ message: 'Seed failed', error: error.message });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Mongo connection failed:', error.message);
    process.exit(1);
  });
