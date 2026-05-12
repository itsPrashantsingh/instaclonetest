import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function App() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('insta-visitor-auth') === 'true'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [profileLoading, setProfileLoading] = useState(false)

  const stories = useMemo(
    () => [
      { id: 1, name: 'yourprofile', image: 'https://i.pravatar.cc/120?img=12' },
      { id: 2, name: 'travel', image: 'https://i.pravatar.cc/120?img=32' },
      { id: 3, name: 'work', image: 'https://i.pravatar.cc/120?img=22' },
      { id: 4, name: 'daily', image: 'https://i.pravatar.cc/120?img=18' },
      { id: 5, name: 'fit', image: 'https://i.pravatar.cc/120?img=45' }
    ],
    []
  )

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchProfileAndPosts = async () => {
      setProfileLoading(true)
      setError('')
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch(`${API_URL}/api/profile/public`),
          fetch(`${API_URL}/api/profile/public/posts`)
        ])

        if (!profileRes.ok || !postsRes.ok) {
          throw new Error('Could not load profile feed')
        }

        const profileData = await profileRes.json()
        const postData = await postsRes.json()
        setProfile(profileData)
        setPosts(postData)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfileAndPosts()
  }, [isAuthenticated])

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('insta-visitor-auth', 'true')
      setIsAuthenticated(true)
      setLoginId('')
      setPassword('')
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('insta-visitor-auth')
    setIsAuthenticated(false)
    setProfile(null)
    setPosts([])
  }

  if (!isAuthenticated) {
    return (
      <main className="app-shell">
        <section className="phone-frame">
          <div className="login-panel">
            <h1 className="logo-wordmark">Instagram</h1>
            <form onSubmit={handleLogin} className="login-form">
              <input
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                placeholder="Phone number, username, or email"
                autoComplete="username"
                required
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
            {error ? <p className="error-text">{error}</p> : null}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="phone-frame feed-phone">
        <header className="top-nav">
          <h1 className="logo-wordmark smaller">Instagram</h1>
          <button type="button" className="logout-btn" onClick={logout}>
            Logout
          </button>
        </header>

        <section className="stories-row">
          {stories.map((story) => (
            <div className="story-item" key={story.id}>
              <img src={story.image} alt={story.name} />
              <span>{story.name}</span>
            </div>
          ))}
        </section>

        {profileLoading ? <div className="loader">Loading feed...</div> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <section className="profile-head">
          <img src={profile?.avatarUrl} alt={profile?.username || 'profile'} />
          <div className="stats">
            <div>
              <strong>{profile?.postsCount || 0}</strong>
              <span>posts</span>
            </div>
            <div>
              <strong>{profile?.followersCount || 0}</strong>
              <span>followers</span>
            </div>
            <div>
              <strong>{profile?.followingCount || 0}</strong>
              <span>following</span>
            </div>
          </div>
        </section>

        <section className="bio-block">
          <h2>{profile?.displayName || ''}</h2>
          <p>{profile?.bio || ''}</p>
        </section>

        <section className="feed-scroll">
          {posts.map((post) => (
            <article className="post-card" key={post._id}>
              <div className="post-head">
                <img src={profile?.avatarUrl} alt={profile?.username || 'profile'} />
                <div>
                  <p>{profile?.username}</p>
                  <span>{post.location}</span>
                </div>
              </div>
              <img src={post.imageUrl} alt={post.caption} className="post-image" />
              <div className="post-meta">
                <strong>{post.likesCount} likes</strong>
                <p>
                  <span>{profile?.username}</span> {post.caption}
                </p>
                <small>View all {post.commentsCount} comments</small>
              </div>
            </article>
          ))}
        </section>
        <nav className="bottom-tab">
          <span>Home</span>
          <span>Search</span>
          <span>Reels</span>
          <span>Profile</span>
        </nav>
      </section>
    </main>
  )
}

export default App
