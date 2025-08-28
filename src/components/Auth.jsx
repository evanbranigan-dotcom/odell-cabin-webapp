import { useState, useEffect } from 'react';
import { sendSignInLinkToEmail, signInWithEmailLink, signOut, onAuthStateChanged, isSignInWithEmailLink } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Auth({ children }) {
  const [user, setUser] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Check if this is an email link sign-in
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          // Clear the URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
          setError('Failed to sign in with email link: ' + error.message);
          setLoading(false);
        });
    }

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

  const handleSendSignInLink = async (e) => {
    e.preventDefault();
    setError('');
    
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (error) {
      setError('Failed to send sign in link: ' + error.message);
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
    if (emailSent) {
      return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
          <h2>Check Your Email</h2>
          <p>We've sent a sign-in link to <strong>{email}</strong></p>
          <p>Click the link in your email to sign in to the cabin app.</p>
          <button 
            onClick={() => setEmailSent(false)} 
            style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }}
          >
            Send Another Link
          </button>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
        <h2>Cabin Owner Login</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Enter your email address and we'll send you a secure sign-in link.
        </p>
        <form onSubmit={handleSendSignInLink}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', fontSize: '16px' }}>
            Send Sign-In Link
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