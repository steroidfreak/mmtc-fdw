import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setMsg('Password reset successful. Redirecting to login...');
      setTimeout(() => nav('/login'), 1500);
    } catch (e) {
      setMsg(e?.response?.data?.error || 'Reset failed');
    }
  }

  if (!token) return <p>Invalid reset token.</p>;

  return (
    <form onSubmit={submit} style={{ maxWidth: 360 }}>
      <h1>Reset Password</h1>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {msg && <p>{msg}</p>}
      <button type="submit">Reset Password</button>
    </form>
  );
}
