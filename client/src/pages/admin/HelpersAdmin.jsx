// client/src/pages/admin/HelpersAdmin.jsx
import { useEffect, useState } from 'react';
import api from '../../api';
import HelperForm from './HelperForm.jsx';

export default function HelpersAdmin() {
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('');
    const [items, setItems] = useState([]);
    const [msg, setMsg] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(false);

    async function load() {
        setMsg('');
        setLoading(true);
        try {
            // ✅ backend returns { success, data, meta }, so use data
            const res = await api.get('/admin/helpers', { params: { q, status } });
            setItems(res.data?.data || []);
        } catch (e) {
            setMsg(e?.response?.data?.error || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

    async function createHelper(payload) {
        try {
            await api.post('/admin/helpers', payload);
            setOpenForm(false);
            setEditing(null);
            await load();
        } catch (e) {
            alert(e?.response?.data?.error || 'Create failed');
        }
    }

    async function updateHelper(id, payload) {
        try {
            await api.put(`/admin/helpers/${id}`, payload);
            setOpenForm(false);
            setEditing(null);
            await load();
        } catch (e) {
            alert(e?.response?.data?.error || 'Update failed');
        }
    }

    async function removeHelper(id) {
        if (!confirm('Delete this helper?')) return;
        try {
            await api.delete(`/admin/helpers/${id}`);
            await load();
        } catch (e) {
            alert(e?.response?.data?.error || 'Delete failed');
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                    placeholder="Search name"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />
                <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="">Any</option>
                    <option value="available">Available</option>
                    <option value="not">Not available</option>
                </select>
                <button onClick={load} disabled={loading}>
                    {loading ? 'Loading…' : 'Search'}
                </button>
                <button
                    onClick={() => {
                        setEditing(null);
                        setOpenForm(true);
                    }}
                >
                    + New Helper
                </button>
            </div>

            {msg && <p style={{ color: 'crimson' }}>{msg}</p>}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th align="left">Name</th>
                        <th align="left">Nationality</th>
                        <th>Age</th>
                        <th>Exp</th>
                        <th>Skills</th>
                        <th>Avail</th>
                        <th>Salary</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(items || []).map(h => (
                        <tr key={h._id} style={{ borderTop: '1px solid #eee' }}>
                            <td>{h.name}</td>
                            <td>{h.nationality}</td>
                            <td align="center">{h.age}</td>
                            <td align="center">{h.experience}</td>
                            <td>{Array.isArray(h.skills) ? h.skills.join(', ') : '-'}</td>
                            <td align="center">{h.availability ? 'Yes' : 'No'}</td>
                            <td align="center">{h.expectedSalary ?? '-'}</td>
                            <td>
                                <button
                                    onClick={async () => {
                                        const r = await api.get(`/admin/helpers/${h._id}`);
                                        // ✅ backend returns { success, data }, so use data
                                        setEditing(r.data?.data);
                                        setOpenForm(true);
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => removeHelper(h._id)}
                                    style={{ marginLeft: 8 }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!loading && (!items || items.length === 0) && (
                        <tr>
                            <td colSpan={8} style={{ padding: 12, color: '#666' }}>
                                No helpers found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <HelperForm
                open={openForm}
                initial={editing}
                onClose={() => {
                    setOpenForm(false);
                    setEditing(null);
                }}
                onSubmit={payload =>
                    editing ? updateHelper(editing._id, payload) : createHelper(payload)
                }
            />
        </div>
    );
}
