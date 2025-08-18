import { useEffect, useState } from 'react';
import api from '../api';
import FilterBar from '../components/FilterBar';
import HelperCard from '../components/HelperCard';
import useShortlist from '../hooks/useShortlist.jsx';

export default function Helpers() {
    const [params, setParams] = useState({ available: 'true', page: 1, limit: 20, sort: 'updatedAt:-1' });
    const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(false);
    const { me, shortlisted, toggle, loading: slLoading, err: slErr } = useShortlist();

    function load() {
        setLoading(true);
        api.get('/helpers', { params })
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(params)]);

    const { items, page, pages, total } = data;

    return (
        <>
            <h1>Available Helpers</h1>
            <FilterBar onChange={(p) => setParams(prev => ({ ...prev, ...p }))} />

            {(loading || slLoading) && <p>Loading…</p>}
            {slErr && <p style={{ color: 'crimson' }}>{slErr}</p>}
            {!loading && total === 0 && <p>No results.</p>}
            {!me && <p style={{ color: '#666' }}>Tip: <b>Login</b> to save a shortlist.</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {items.map(h => (
                    <HelperCard
                        key={h._id}
                        h={h}
                        shortlisted={shortlisted(h._id)}
                        onToggle={async (id) => {
                            try { await toggle(id); } catch (e) { alert(e.message || 'Failed'); }
                        }}
                    />
                ))}
            </div>

            {!loading && pages > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
                    <button disabled={page <= 1} onClick={() => setParams(prev => ({ ...prev, page: prev.page - 1 }))}>Prev</button>
                    <span>Page {page} / {pages}</span>
                    <button disabled={page >= pages} onClick={() => setParams(prev => ({ ...prev, page: prev.page + 1 }))}>Next</button>
                </div>
            )}
        </>
    );
}
