import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, History, BarChart3, Activity, LogOut, User, BookOpen } from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './pages/Dashboard';
import PredictionForm from './pages/PredictionForm';
import PatientHistory from './pages/PatientHistory';
import Analytics from './pages/Analytics';
import Learn from './pages/Learn';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin text-secondary w-12 h-12 mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
};

const LoginPage = () => {
  const { login } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Activity className="text-secondary w-10 h-10" />
          <h1 className="text-2xl font-bold text-white">OncoPredict AI</h1>
        </div>
        
        <p className="text-slate-400 mb-8">
          Clinical Decision Support System for Breast Cancer Risk Analysis
        </p>
        
        <button
          onClick={login}
          className="w-full bg-secondary hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <User size={20} />
          Sign in with Google
        </button>
        
        <p className="text-xs text-slate-500 mt-6">
          Authorized personnel only. Medical credentials required.
        </p>
      </div>
    </div>
  );
};

const Navbar = ({ user, onLogout }) => (
  <nav className="bg-primary border-b border-slate-800 w-64 min-h-screen flex flex-col p-4 fixed left-0 top-0">
    <div className="flex items-center gap-2 mb-10 px-2">
      <Activity className="text-secondary w-8 h-8" />
      <h1 className="text-xl font-bold text-white tracking-tight">OncoPredict AI</h1>
    </div>
    
    <div className="flex flex-col gap-2">
      <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
      <NavLink to="/predict" icon={<FlaskConical size={20} />} label="New Prediction" />
      <NavLink to="/history" icon={<History size={20} />} label="Patient History" />
      <NavLink to="/analytics" icon={<BarChart3 size={20} />} label="Advanced Analytics" />
      <NavLink to="/learn" icon={<BookOpen size={20} />} label="Feature Guide" />
    </div>

    <div className="mt-auto space-y-4">
      <div className="p-4 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400 mb-1">Model Status</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-slate-200 font-medium">Active & Ready</span>
        </div>
      </div>
      
      <div className="p-4 bg-slate-800/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <User size={16} className="text-secondary" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  </nav>
);

const NavLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

function AppContent() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Activity className="animate-spin text-secondary w-12 h-12" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-200">
      <Navbar user={user} onLogout={logout} />
      <main className="ml-64 p-8 w-full">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider">Breast Cancer Risk Analysis</h2>
            <p className="text-slate-400">Clinical Decision Support System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.displayName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <Activity size={20} className="text-secondary" />
              )}
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<PredictionForm />} />
          <Route path="/history" element={<PatientHistory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/learn" element={<Learn />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router basename="/Cancer-Analysis">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
