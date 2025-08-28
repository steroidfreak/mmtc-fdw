import { useState } from 'react';
import api from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMsg('If the email exists, a reset link has been sent.');
    } catch (e) {
      setMsg(e?.response?.data?.error || 'Request failed');
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360 }}>
      <h1>Forgot Password</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      {msg && <p>{msg}</p>}
      <button type="submit">Send reset link</button>
    </form>
  );
}
