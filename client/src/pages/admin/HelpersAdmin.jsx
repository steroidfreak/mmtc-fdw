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

    // 🔢 pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
    const [loading, setLoading] = useState(false);

    async function load(p = page, l = limit) {
        setMsg('');
        setLoading(true);
        try {
            const res = await api.get('/admin/helpers', { params: { q, status, page: p, limit: l } });
            setItems(res.data?.data || []);
            setMeta(res.data?.meta || { page: p, pages: 1, total: 0, limit: l });
            setPage(res.data?.meta?.page || p);
            setLimit(res.data?.meta?.limit || l);
        } catch (e) {
            setMsg(e?.response?.data?.error || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(1, limit); /* eslint-disable-next-line */ }, []);

    // When filters change, start back at page 1
    function applyFilters() {
        setPage(1);
        load(1, limit);
    }

    async function createHelper(payload) {
        try { await api.post('/admin/helpers', payload); setOpenForm(false); setEditing(null); await load(page, limit); }
        catch (e) { alert(e?.response?.data?.error || 'Create failed'); }
    }

    async function updateHelper(id, payload) {
        try { await api.put(`/admin/helpers/${id}`, payload); setOpenForm(false); setEditing(null); await load(page, limit); }
        catch (e) { alert(e?.response?.data?.error || 'Update failed'); }
    }

    async function removeHelper(id) {
        if (!confirm('Delete this helper?')) return;
        try {
            await api.delete(`/admin/helpers/${id}`);
            // if we deleted the last item on the page, go back a page if possible
            const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
            setPage(nextPage);
            await load(nextPage, limit);
        } catch (e) {
            alert(e?.response?.data?.error || 'Delete failed');
        }
    }

    // Pagination controls
    const canPrev = page > 1;
    const canNext = page < (meta.pages || 1);

    const gotoFirst = () => { if (canPrev) { setPage(1); load(1, limit); } };
    const gotoPrev = () => { if (canPrev) { setPage(page - 1); load(page - 1, limit); } };
    const gotoNext = () => { if (canNext) { setPage(page + 1); load(page + 1, limit); } };
    const gotoLast = () => { if (canNext) { setPage(meta.pages); load(meta.pages, limit); } };

    function changeLimit(e) {
        const newLimit = Number(e.target.value) || 20;
        setLimit(newLimit);
        setPage(1);
        load(1, newLimit);
    }

    return (
        <div>
            {/* Filters + actions */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    placeholder="Search name"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    style={{ minWidth: 220 }}
                />
                <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="">Any</option>
                    <option value="available">Available</option>
                    <option value="not">Not available</option>
                </select>
                <button onClick={applyFilters} disabled={loading}>{loading ? 'Loading…' : 'Search'}</button>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label>Page size:</label>
                    <select value={limit} onChange={changeLimit}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <button onClick={() => { setEditing(null); setOpenForm(true); }}>+ New Helper</button>
                </div>
            </div>

            {msg && <p style={{ color: 'crimson' }}>{msg}</p>}

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                    <th align="left">Name</th>
                    <th align="left">Nationality</th>
                    <th>Age</th>
                    <th>Exp</th>
                    <th>Skills</th>
                    <th>Avail</th>
                    <th>Salary</th>
                    <th>Actions</th>
                </tr></thead>
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
                                        setEditing(r.data?.data);
                                        setOpenForm(true);
                                    }}
                                >Edit</button>
                                <button onClick={() => removeHelper(h._id)} style={{ marginLeft: 8 }}>Delete</button>
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

            {/* Pagination footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <button onClick={gotoFirst} disabled={!canPrev}>⏮ First</button>
                <button onClick={gotoPrev} disabled={!canPrev}>◀ Prev</button>
                <span style={{ opacity: .8 }}>
                    Page <b>{meta.page || 1}</b> of <b>{meta.pages || 1}</b>
                    {typeof meta.total === 'number' ? <> • Total: <b>{meta.total}</b></> : null}
                </span>
                <button onClick={gotoNext} disabled={!canNext}>Next ▶</button>
                <button onClick={gotoLast} disabled={!canNext}>Last ⏭</button>
            </div>

            {/* Create/Edit modal */}
            <HelperForm
                open={openForm}
                initial={editing}
                onClose={() => { setOpenForm(false); setEditing(null); }}
                onSubmit={(payload) => editing ? updateHelper(editing._id, payload) : createHelper(payload)}
            />
        </div>
    );
}
