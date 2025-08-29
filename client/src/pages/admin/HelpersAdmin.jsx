// client/src/pages/admin/HelpersAdmin.jsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api';
import HelperForm from './HelperForm.jsx';

// Admin page for managing helpers with create/edit capabilities
export default function HelpersAdmin() {
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('');
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Modal/form state
    // undefined = closed, null = creating, string = editing id
    const [openId, setOpenId] = useState(undefined);
    const [refreshKey, setRefreshKey] = useState(0); // force re-mount of form

    // keep track of whether we are editing or creating

    // Portal target set after mount to support SSR
    const [portalTarget, setPortalTarget] = useState(null);
    useEffect(() => {
        if (typeof document !== 'undefined') {
            setPortalTarget(
                document.getElementById('portal-root') || document.body
            );
        }
    }, []);

    // lock body scroll when modal is open
    useEffect(() => {
        if (openId !== undefined) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [openId]);

    const page = meta.page || 1;
    const limit = meta.limit || 20;
    const canPrev = page > 1;
    const canNext = page < (meta.pages || 1);

    async function load(p = page, l = limit) {
        setLoading(true);
        setMsg('');
        try {
            const res = await api.get('/admin/helpers', {
                params: { q, status, page: p, limit: l },
            });
            setItems(res.data?.data || []);
            setMeta(res.data?.meta || { page: p, pages: 1, total: 0, limit: l });
        } catch (e) {
            setMsg(e?.response?.data?.error || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load(1, limit); // initial load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function applyFilters() {
        load(1, limit);
    }

    function changePageSize(e) {
        const newLimit = Number(e.target.value) || 20;
        load(1, newLimit);
    }

    async function removeHelper(id) {
        if (!confirm('Delete this helper?')) return;
        try {
            await api.delete(`/admin/helpers/${id}`);
            // if last item on page removed, go back a page
            const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
            await load(nextPage, limit);
        } catch (e) {
            alert(e?.response?.data?.error || 'Delete failed');
        }
    }

    function openCreate() {
        setOpenId(null);
        setRefreshKey((k) => k + 1);
    }

    function openEdit(id) {
        setOpenId(id);
        setRefreshKey((k) => k + 1);
    }

    function closeForm() {
        setOpenId(undefined);
    }

    function onSaved() {
        closeForm();
        load(page, limit);
    }


    const gotoFirst = () => canPrev && load(1, limit);
    const gotoPrev = () => canPrev && load(page - 1, limit);
    const gotoNext = () => canNext && load(page + 1, limit);
    const gotoLast = () => canNext && load(meta.pages, limit);

    if (openId !== undefined) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <button className="border px-3 py-2" onClick={closeForm}>← Back</button>
                    <h2 className="text-xl font-semibold">
                        {openId ? 'Edit Helper' : 'Create Helper'}
                    </h2>
                </div>
                <HelperForm
                    key={refreshKey}
                    helperId={openId || undefined}
                    onSaved={onSaved}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Helpers</h2>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <input
                    className="border p-2 min-w-[220px]"
                    placeholder="Search name"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <select
                    className="border p-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">Any</option>
                    <option value="available">Available</option>
                    <option value="not">Not available</option>
                </select>
                <button
                    className="border px-3 py-2"
                    onClick={applyFilters}
                    disabled={loading}
                >
                    {loading ? 'Loading…' : 'Search'}
                </button>

                <div className="ml-auto flex items-center gap-2">
                    <label>Page size:</label>
                    <select
                        className="border p-2"
                        value={limit}
                        onChange={changePageSize}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <button
                        className="bg-blue-600 text-white px-3 py-2 rounded"
                        onClick={openCreate}
                    >
                        + New Helper
                    </button>
                </div>
            </div>

            {msg && <div className="text-red-600">{msg}</div>}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="[&>th]:text-left [&>th]:px-2 [&>th]:py-2 border-b">
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Nationality</th>
                            <th className="text-center">Age</th>
                            <th className="text-center">Exp</th>
                            <th>Skills</th>
                            <th className="text-center">Avail</th>
                            <th className="text-center">Salary</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(items || []).map((h) => (
                            <tr key={h._id} className="border-b hover:bg-gray-50">
                                <td className="px-2 py-2">
                                    {Array.isArray(h.photos) && h.photos[0] ? (
                                        <img
                                            src={h.photos[0]}
                                            alt=""
                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                        />
                                    ) : (
                                        <img
                                            src="/placeholder-helper.png"
                                            alt=""
                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, opacity: 0.85 }}
                                        />
                                    )}
                                </td>
                                <td className="px-2 py-2">{h.name}</td>
                                <td className="px-2 py-2">{h.nationality}</td>
                                <td className="px-2 py-2 text-center">{h.age}</td>
                                <td className="px-2 py-2 text-center">{h.experience}</td>
                                <td className="px-2 py-2">
                                    {Array.isArray(h.skills) ? h.skills.join(', ') : '-'}
                                </td>
                                <td className="px-2 py-2 text-center">
                                    {h.availability ? 'Yes' : 'No'}
                                </td>
                                <td className="px-2 py-2 text-center">
                                    {h.expectedSalary ?? '-'}
                                </td>
                                <td className="px-2 py-2">
                                    <button
                                        className="px-2 py-1 border rounded"
                                        onClick={() => openEdit(h._id)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="px-2 py-1 border rounded ml-2"
                                        onClick={() => removeHelper(h._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && (!items || items.length === 0) && (
                            <tr>
                                <td className="px-2 py-4 text-gray-600" colSpan={9}>
                                    No helpers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
                <button className="border px-2 py-1" onClick={gotoFirst} disabled={!canPrev}>
                    ⏮ First
                </button>
                <button className="border px-2 py-1" onClick={gotoPrev} disabled={!canPrev}>
                    ◀ Prev
                </button>
                <span className="opacity-80">
                    Page <b>{meta.page || 1}</b> of <b>{meta.pages || 1}</b>
                    {typeof meta.total === 'number' ? (
                        <> • Total: <b>{meta.total}</b></>
                    ) : null}
                </span>
                <button className="border px-2 py-1" onClick={gotoNext} disabled={!canNext}>
                    Next ▶
                </button>
                <button className="border px-2 py-1" onClick={gotoLast} disabled={!canNext}>
                    Last ⏭
                </button>
            </div>
        </div>
    );
}
