import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Auth({ children }) {
  const [user, setUser] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Check if user is approved
        const approvedUserDoc = await getDoc(doc(db, 'approved_users', user.email));
        if (approvedUserDoc.exists()) {
          setIsApproved(true);
        } else {
          setIsApproved(false);
          setError('Your email is not authorized to access this cabin app.');
        }
      } else {
        setUser(null);
        setIsApproved(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setError('');
    } catch (error) {
      setError('Failed to sign out: ' + error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
        <h2>Cabin Owner Login</h2>
        <form onSubmit={handleSignIn}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', fontSize: '16px' }}>
            Sign In
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Your email ({user.email}) is not authorized to access this cabin app.</p>
        <button onClick={handleSignOut} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Sign Out
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <span>Welcome, {user.email}!</span>
        <button 
          onClick={handleSignOut} 
          style={{ float: 'right', padding: '5px 10px' }}
        >
          Sign Out
        </button>
      </div>
      {children}
    </div>
  );
}