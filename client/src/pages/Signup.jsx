import { useState } from 'react';
import api from '../api';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const [sent, setSent] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setErr('');
        try {
            await api.post('/auth/register', { name, email, phone, password });
            setSent(true);
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
            {sent ? (
                <p style={{ color: 'green' }}>Check your email to verify your account.</p>
            ) : (
                <button type="submit">Sign up</button>
            )}
        </form>
    );
}
