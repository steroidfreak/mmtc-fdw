import { useEffect, useState } from 'react';
import api from '../../api';
import RegisteredUserForm from './RegisteredUserForm.jsx';

export default function RegisteredUsersAdmin() {
    const [q, setQ] = useState('');
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const [openId, setOpenId] = useState(undefined); // null=create, string=edit, undefined=closed
    const [refreshKey, setRefreshKey] = useState(0);

    const page = meta.page || 1;
    const limit = meta.limit || 20;
    const canPrev = page > 1;
    const canNext = page < (meta.pages || 1);

    async function load(p = page, l = limit) {
        setLoading(true); setMsg('');
        try {
            const res = await api.get('/admin/users', { params: { q, page: p, limit: l } });
            setItems(res.data?.data || []);
            setMeta(res.data?.meta || { page: p, pages: 1, total: 0, limit: l });
        } catch (e) {
            setMsg(e?.response?.data?.error || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(1, meta.limit || 20); /* eslint-disable-next-line */ }, []);

    function applyFilters() { load(1, limit); }
    function changePageSize(e) { const newLimit = Number(e.target.value) || 20; load(1, newLimit); }

    async function removeUser(id) {
        if (!confirm('Delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
            await load(nextPage, limit);
        } catch (e) {
            alert(e?.response?.data?.error || 'Delete failed');
        }
    }

    function openCreate() { setOpenId(null); setRefreshKey(k => k + 1); }
    function openEdit(id) { setOpenId(id); setRefreshKey(k => k + 1); }
    function closeForm() { setOpenId(undefined); }
    function onSaved() { closeForm(); load(page, limit); }

    const gotoFirst = () => canPrev && load(1, limit);
    const gotoPrev = () => canPrev && load(page - 1, limit);
    const gotoNext = () => canNext && load(page + 1, limit);
    const gotoLast = () => canNext && load(meta.pages, limit);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Registered Users</h2>

            <div className="flex flex-wrap items-center gap-2">
                <input
                    className="border p-2 min-w-[220px]"
                    placeholder="Search name"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />
                <button className="border px-3 py-2" onClick={applyFilters} disabled={loading}>
                    {loading ? 'Loading…' : 'Search'}
                </button>
                <div className="ml-auto flex items-center gap-2">
                    <label>Page size:</label>
                    <select className="border p-2" value={limit} onChange={changePageSize}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={openCreate}>+ New User</button>
                </div>
            </div>

            {msg && <div className="text-red-600">{msg}</div>}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="[&>th]:text-left [&>th]:px-2 [&>th]:py-2 border-b">
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(items || []).map(u => (
                            <tr key={u._id} className="border-b hover:bg-gray-50">
                                <td className="px-2 py-2">{u.name}</td>
                                <td className="px-2 py-2">{u.email}</td>
                                <td className="px-2 py-2">{u.phone || '-'}</td>
                                <td className="px-2 py-2">{u.address || '-'}</td>
                                <td className="px-2 py-2">
                                    <button className="px-2 py-1 border rounded" onClick={() => openEdit(u._id)}>Edit</button>
                                    <button className="px-2 py-1 border rounded ml-2" onClick={() => removeUser(u._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!loading && (!items || items.length === 0) && (
                            <tr>
                                <td className="px-2 py-4 text-gray-600" colSpan={5}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-2">
                <button className="border px-2 py-1" onClick={gotoFirst} disabled={!canPrev}>⏮ First</button>
                <button className="border px-2 py-1" onClick={gotoPrev} disabled={!canPrev}>◀ Prev</button>
                <span className="opacity-80">
                    Page <b>{meta.page || 1}</b> of <b>{meta.pages || 1}</b>
                    {typeof meta.total === 'number' ? <> • Total: <b>{meta.total}</b></> : null}
                </span>
                <button className="border px-2 py-1" onClick={gotoNext} disabled={!canNext}>Next ▶</button>
                <button className="border px-2 py-1" onClick={gotoLast} disabled={!canNext}>Last ⏭</button>
            </div>

            {openId !== undefined && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded shadow-xl p-4 max-w-md w-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{openId ? 'Edit User' : 'Create User'}</h3>
                            <button className="text-gray-600" onClick={closeForm}>✕</button>
                        </div>
                        <RegisteredUserForm key={refreshKey} userId={openId || undefined} onSaved={onSaved} />
                    </div>
                </div>
            )}
        </div>
    );
}
