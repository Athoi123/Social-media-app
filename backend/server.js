require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// --- MODELS ---
const UserSchema = new mongoose.Schema({
   username: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   profilePic: { type: String, default: "" }, // Stores the Base64 image
   bio: { type: String, default: "Just joined the network." } // Stores the caption
});
const User = mongoose.model('User', UserSchema);

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  content: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    username: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
const Post = mongoose.model('Post', PostSchema);

// --- AUTH MIDDLEWARE ---
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered" });
  } catch (err) {
    console.error("Registration error details:", err);
    if (err.code === 11000) {
      res.status(400).json({ error: "Username is already taken" });
    } else {
      res.status(500).json({ error: `Registration failed: ${err.message || err}` });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Login error details:", err);
    res.status(500).json({ error: `Login failed: ${err.message || err}` });
  }
});


// --- PROFILE ROUTES ---
app.get('/api/profile', verifyToken, async (req, res) => {
   const user = await User.findById(req.user.id).select("-password"); // Don't send password back!
   res.json(user);
});

app.put('/api/profile', verifyToken, async (req, res) => {
   const user = await User.findById(req.user.id);
   if (req.body.profilePic) user.profilePic = req.body.profilePic;
   if (req.body.bio) user.bio = req.body.bio;
   await user.save();
   res.json(user);
});

// --- POST ROUTES (CRUD, Like, Comment) ---
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

app.post('/api/posts', verifyToken, async (req, res) => {
  const post = new Post({ ...req.body, userId: req.user.id, username: req.user.username });
  await post.save();
  res.json(post);
});

app.put('/api/posts/:id', verifyToken, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post.userId.toString() !== req.user.id) return res.status(403).json({ error: "Unauthorized" });
  post.content = req.body.content;
  post.imageUrl = req.body.imageUrl;
  await post.save();
  res.json(post);
});

app.delete('/api/posts/:id', verifyToken, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post.userId.toString() !== req.user.id) return res.status(403).json({ error: "Unauthorized" });
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

app.post('/api/posts/:id/like', verifyToken, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const index = post.likes.indexOf(req.user.id);
  if (index === -1) post.likes.push(req.user.id); // Like
  else post.likes.splice(index, 1); // Unlike
  await post.save();
  res.json(post);
});

app.post('/api/posts/:id/comment', verifyToken, async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.comments.push({ username: req.user.username, text: req.body.text });
  await post.save();
  res.json(post);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));