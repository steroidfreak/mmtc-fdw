import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Helpers from './pages/Helpers.jsx';
import HelperDetail from './pages/HelperDetail.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Verify from './pages/Verify.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import { useAuth } from './auth.jsx';
import MyLeads from './pages/MyLeads.jsx';

import AdminRoute from './components/AdminRoute.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import HelpersAdmin from './pages/admin/HelpersAdmin.jsx';
import RegisteredUsersAdmin from './pages/admin/RegisteredUsersAdmin.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import ChatWidget from './components/ChatWidget.jsx';

export default function App() {
  const { me, logout } = useAuth();

  return (
    <div className="app-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary app-header">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">MMTC</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/helpers">Helpers</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/myleads">My Leads</Link>
              </li>
              {(me?.role === 'staff' || me?.role === 'admin') && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/helpers">Admin</Link>
                </li>
              )}
              {me ? (
                <>
                  <li className="nav-item">
                    <span className="navbar-text me-2">Hi, {me.name}</span>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-light btn-sm" onClick={logout}>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/signup">Sign up</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/helpers" element={<Helpers />} />
          <Route path="/helpers/:id" element={<HelperDetail />} />
          <Route path="/myleads" element={<MyLeads />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          >
            <Route path="helpers" element={<HelpersAdmin />} />
            <Route path="users" element={<RegisteredUsersAdmin />} />
          </Route>
        </Routes>
        <WhatsAppButton />
        <ChatWidget />
      </main>
    </div>
  );
}
