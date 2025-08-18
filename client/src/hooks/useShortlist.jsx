import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../auth.jsx';

export default function useShortlist() {
    const { me } = useAuth();
    const [ids, setIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    // Load shortlist when logged in
    useEffect(() => {
        let mounted = true;
        async function load() {
            setErr('');
            if (!me) { setIds(new Set()); return; }
            setLoading(true);
            try {
                const res = await api.get('/jobs/active/shortlist');
                const next = new Set((res.data.shortlist || []).map(h => h._id));
                if (mounted) setIds(next);
            } catch (e) {
                if (mounted) setErr(e?.response?.data?.error || 'Failed to load shortlist');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [me]);

    const shortlisted = useMemo(() => (id) => ids.has(id), [ids]);

    async function add(id) {
        if (!me) throw new Error('Please login to use shortlist');
        await api.post('/jobs/active/shortlist', { helperId: id });
        setIds(prev => new Set(prev).add(id));
    }

    async function remove(id) {
        if (!me) throw new Error('Please login to use shortlist');
        await api.delete(`/jobs/active/shortlist/${id}`);
        setIds(prev => {
            const n = new Set(prev);
            n.delete(id);
            return n;
        });
    }

    async function toggle(id) {
        if (ids.has(id)) { await remove(id); }
        else { await add(id); }
    }

    return { me, ids, shortlisted, add, remove, toggle, loading, err };
}
