import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Helpers from './pages/Helpers.jsx';
import HelperDetail from './pages/HelperDetail.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Verify from './pages/Verify.jsx';
import { useAuth } from './auth.jsx';
import MyLeads from './pages/MyLeads.jsx';

import AdminRoute from './components/adminRoute.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import HelpersAdmin from './pages/admin/HelpersAdmin.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';

export default function App() {
  const { me, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="app-header">
        <h2>MMTC</h2>
        <Link to="/">Home</Link>
        <Link to="/helpers">Helpers</Link>
        <Link to="/myleads">My Leads</Link>
        {(me?.role === 'staff' || me?.role === 'admin') && <Link to="/admin/helpers">Admin</Link>}
        {me ? (
          <>
            <span>Hi, {me.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/helpers" element={<Helpers />} />
          <Route path="/helpers/:id" element={<HelperDetail />} />
          <Route path="/myleads" element={<MyLeads />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          >
            <Route path="helpers" element={<HelpersAdmin />} />
          </Route>
        </Routes>
        <WhatsAppButton />
      </main>
    </div>
  );
}
