import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const { user, profile, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  // ── Full-screen loading spinner while session is being resolved ──
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  // ── Not authenticated — show auth pages ──
  if (!user) {
    return showSignUp
      ? <SignUp onSwitchToSignIn={() => setShowSignUp(false)} />
      : <SignIn onSwitchToSignUp={() => setShowSignUp(true)} />;
  }

  // ── Authenticated — show role-appropriate dashboard ──
  return (
    <div className="min-h-screen">
      <Navbar />
      {profile?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}

export default App;
