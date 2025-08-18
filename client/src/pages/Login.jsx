import { useState } from 'react';
import api from '../api';
import { useAuth } from '../auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const nav = useNavigate();
    const { login } = useAuth();

    async function submit(e) {
        e.preventDefault();
        setErr('');
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token);
            nav('/helpers');
        } catch (e) {
            setErr(e?.response?.data?.error || 'Login failed');
        }
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 360 }}>
            <h1>Login</h1>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            {err && <p style={{ color: 'crimson' }}>{err}</p>}
            <button type="submit">Login</button>
        </form>
    );
}
