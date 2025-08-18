import { useState } from 'react';
import api from '../api';
import { useAuth } from '../auth';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const nav = useNavigate();
    const { login } = useAuth();

    async function submit(e) {
        e.preventDefault();
        setErr('');
        try {
            const { data } = await api.post('/auth/register', { name, email, phone, password });
            login(data.token);
            nav('/helpers');
        } catch (e) {
            setErr(e?.response?.data?.error || 'Signup failed');
        }
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 360 }}>
            <h1>Create Employer Account</h1>
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            {err && <p style={{ color: 'crimson' }}>{err}</p>}
            <button type="submit">Sign up</button>
        </form>
    );
}
