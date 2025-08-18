import { useState } from 'react';
import api from '../api';
import { useAuth } from '../auth.jsx';

export default function InterviewModal({ open, onClose, helper }) {
    const { me } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [err, setErr] = useState('');

    if (!open) return null;

    async function submit() {
        setErr('');
        if (!me) { setErr('Please login first.'); return; }
        if (!phone && !email) { setErr('Provide phone or email'); return; }
        try {
            await api.post('/leads', {
                helperId: helper._id,
                preferredTime,
                message: message || `Interview request for ${helper.name}`,
                contact: { name, phone, email }
            });
            setSent(true);
        } catch (e) {
            setErr(e?.response?.data?.error || 'Failed to submit');
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50
        }}>
            <div style={{ background: '#fff', padding: 16, maxWidth: 520, width: '100%', borderRadius: 8 }}>
                <h3>Book Interview — {helper.name}</h3>
                {sent ? (
                    <>
                        <p>Thanks! Our team will contact you shortly.</p>
                        <button onClick={onClose}>Close</button>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'grid', gap: 8 }}>
                            <input placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} />
                            <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
                            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                            <input type="datetime-local" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} />
                            <textarea placeholder="Message (optional)" value={message} onChange={e => setMessage(e.target.value)} />
                            {err && <p style={{ color: 'crimson' }}>{err}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button onClick={submit}>Submit</button>
                            <button onClick={onClose} style={{ opacity: 0.75 }}>Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
