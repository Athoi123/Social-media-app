import { useState, useEffect } from "react";

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000/api"
  : "https://social-media-app-suyl.onrender.com/api";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // NEW: State to track if we are looking at the 'feed' or the 'profile'
  const [currentView, setCurrentView] = useState("feed"); 
  const [profileData, setProfileData] = useState({ bio: "", profilePic: "" });

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [posts, setPosts] = useState([]);
  const [authForm, setAuthForm] = useState({ username: "", password: "", isLogin: true });
  const [postForm, setPostForm] = useState({ content: "", imageUrl: "" });
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 10) + 5; 
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 500); 
      }
      setProgress(currentProgress);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    const res = await fetch(`${API_URL}/posts`);
    const data = await res.json();
    setPosts(data);
  };

  // NEW: Function to fetch user profile
  const fetchProfile = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/profile`, { headers: authHeaders });
    const data = await res.json();
    if (res.ok) {
      setProfileData({ bio: data.bio || "No bio yet.", profilePic: data.profilePic || "" });
    }
  };

  useEffect(() => {
    fetchPosts();
    if (token) fetchProfile(); // Fetch profile when logged in
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authForm.isLogin ? "/login" : "/register";
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: authForm.username, password: authForm.password }),
    });
    const data = await res.json();
    
    if (res.ok) {
      if (authForm.isLogin) {
        setToken(data.token);
        setUsername(data.username);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
      } else {
        alert("Registered! Please log in.");
        setAuthForm({ ...authForm, isLogin: true });
      }
    } else {
      alert(data.error);
    }
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setCurrentView("feed");
    localStorage.clear();
  };

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // NEW: Handlers for Profile Updates
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newPic = reader.result;
        setProfileData({ ...profileData, profilePic: newPic });
        // Auto-save to backend
        await fetch(`${API_URL}/profile`, { method: "PUT", headers: authHeaders, body: JSON.stringify({ profilePic: newPic }) });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBio = async () => {
    await fetch(`${API_URL}/profile`, { method: "PUT", headers: authHeaders, body: JSON.stringify({ bio: profileData.bio }) });
    alert("Bio updated!");
  };

  // Regular Post handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPostForm({ ...postForm, imageUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/posts`, { method: "POST", headers: authHeaders, body: JSON.stringify(postForm) });
    setPostForm({ content: "", imageUrl: "" });
    fetchPosts();
  };

  const deletePost = async (id) => {
    await fetch(`${API_URL}/posts/${id}`, { method: "DELETE", headers: authHeaders });
    fetchPosts();
  };

  const toggleLike = async (id) => {
    await fetch(`${API_URL}/posts/${id}/like`, { method: "POST", headers: authHeaders });
    fetchPosts();
  };

  const addComment = async (e, id) => {
    e.preventDefault();
    await fetch(`${API_URL}/posts/${id}/comment`, { method: "POST", headers: authHeaders, body: JSON.stringify({ text: commentText }) });
    setCommentText("");
    fetchPosts();
  };

  if (isLoading) {
    return (
      <div className="splash-screen">
        <h1 className="splash-text">MEEEE</h1>
        <div className="loader-cylinder">
          <div className="loader-fill" style={{ width: `${progress}%` }}></div>
          <span className="loader-text">{progress}%</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: "400px", marginTop: "100px" }}>
        <div className="glass-card">
          <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "28px" }}>
            {authForm.isLogin ? "Welcome Back" : "Join the Network"}
          </h2>
          <form onSubmit={handleAuth}>
            <input className="cool-input" placeholder="Username" required onChange={e => setAuthForm({ ...authForm, username: e.target.value })} />
            <input className="cool-input" type="password" placeholder="Password" required onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
            <button className="btn-neon" style={{ width: "100%", marginTop: "10px" }} type="submit">
              {authForm.isLogin ? "Access Mainframe" : "Initialize Account"}
            </button>
          </form>
          <button className="btn-neon secondary" onClick={() => setAuthForm({ ...authForm, isLogin: !authForm.isLogin })}>
            Switch to {authForm.isLogin ? "Register" : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* HEADER WITH FACEBOOK-STYLE NAVIGATION */}
      <header className="header glass-card" style={{ padding: "15px 30px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* LEFT SIDE: LOGO */}
        <h2 style={{ cursor: "pointer", margin: 0 }} onClick={() => setCurrentView("feed")}>MEEEE</h2>

        {/* RIGHT SIDE: USER INFO & LOGOUT */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          
          {/* Clickable Mini-Profile */}
          <div 
            onClick={() => setCurrentView("profile")}
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "5px 15px", borderRadius: "30px", background: "rgba(255,255,255,0.1)", transition: "background 0.2s ease" }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            <img 
              src={profileData.profilePic || "https://via.placeholder.com/40"} 
              alt="Profile" 
              style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover", border: "2px solid #00f2fe" }} 
            />
            <span style={{ fontWeight: "600", fontSize: "15px", color: "#ffffff" }}>
              {username}
            </span>
          </div>

          <button className="btn-neon btn-small btn-delete" onClick={logout}>Disconnect</button>
        </div>
      </header>

      {/* --- PROFILE VIEW --- */}
      {currentView === "profile" && (
        <div className="glass-card" style={{ textAlign: "center", marginBottom: "40px" }}>
          {/* Profile Picture Display & Upload */}
          <div style={{ marginBottom: "20px" }}>
            <img 
              src={profileData.profilePic || "https://via.placeholder.com/150"} 
              alt="Profile" 
              style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover", border: "3px solid #00f2fe", marginBottom: "15px" }} 
            />
            <br />
            <input type="file" id="profileUpload" accept="image/*" style={{ display: "none" }} onChange={handleProfilePicChange} />
            <label htmlFor="profileUpload" className="btn-neon secondary btn-small" style={{ cursor: "pointer" }}>
              📷 Change Photo
            </label>
          </div>

          {/* Bio Update Section */}
          <div style={{ textAlign: "left", maxWidth: "400px", margin: "0 auto" }}>
            <label style={{ color: "#00f2fe", fontSize: "14px", fontWeight: "bold" }}>Your Caption / Bio:</label>
            <textarea 
              className="cool-input" 
              value={profileData.bio} 
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              style={{ minHeight: "80px", marginTop: "10px" }}
            />
            <button className="btn-neon btn-small" style={{ width: "100%" }} onClick={saveBio}>Save Caption</button>
          </div>
        </div>
      )}

      {/* --- MAIN FEED VIEW --- */}
      {currentView === "feed" && (
        <>
          <form onSubmit={createPost} className="glass-card" style={{ marginBottom: "40px" }}>
            <textarea className="cool-input" required placeholder="Transmit a message to the network..." value={postForm.content} onChange={e => setPostForm({ ...postForm, content: e.target.value })} />
            <input type="file" id="imageUpload" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
            <label htmlFor="imageUpload" className="btn-neon secondary btn-small" style={{ display: "inline-block", cursor: "pointer", marginBottom: "15px", width: "auto" }}>📁 Browse Computer</label>
            {postForm.imageUrl && (
              <div style={{ marginBottom: "15px" }}>
                 <p style={{ fontSize: "12px", color: "#00f2fe", marginBottom: "5px" }}>Image attached successfully!</p>
                 <img src={postForm.imageUrl} alt="preview" style={{ maxHeight: "100px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)" }} />
              </div>
            )}
            <button className="btn-neon" style={{ float: "right" }} type="submit">Broadcast Post</button>
            <div style={{ clear: "both" }}></div>
          </form>

          <div>
            {posts.map(post => (
              <div key={post._id} className="glass-card post">
                <h4 style={{ fontSize: "18px" }}>@{post.username}</h4>
                <p>{post.content}</p>
                {post.imageUrl && <img src={post.imageUrl} alt="post visual" className="post-image" />}
                <div style={{ marginTop: "15px" }}>
                  <button className="btn-neon btn-small" onClick={() => toggleLike(post._id)}>⚡ {post.likes.length} Boosts</button>
                  {post.username === username && <button className="btn-neon btn-small btn-delete" onClick={() => deletePost(post._id)}>Delete</button>}
                </div>
                <div className="comments-section">
                  {post.comments.map((c, i) => (
                    <div key={i} className="comment-bubble"><span className="comment-author">@{c.username}</span> <span>{c.text}</span></div>
                  ))}
                  <form className="comment-form" onSubmit={e => addComment(e, post._id)}>
                    <input className="cool-input" required placeholder="Add a reply..." onChange={e => setCommentText(e.target.value)} />
                    <button className="btn-neon btn-small" style={{ margin: "0", height: "48px" }} type="submit">Reply</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}