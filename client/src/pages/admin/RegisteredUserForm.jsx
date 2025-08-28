import { useEffect, useState } from 'react';
import api from '../../api';

export default function RegisteredUserForm({ userId, onSaved }) {
    const isEdit = Boolean(userId);
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isEdit) return;
        api.get(`/admin/users/${userId}`)
            .then(res => {
                if (res.data.success) {
                    const u = res.data.data;
                    setForm({
                        name: u.name || '',
                        email: u.email || '',
                        phone: u.phone || '',
                        address: u.address || '',
                    });
                }
            })
            .catch(() => setError('Failed to load user'));
    }, [userId, isEdit]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...form };
            let res;
            if (isEdit) res = await api.put(`/admin/users/${userId}`, payload);
            else res = await api.post('/admin/users', payload);
            if (res.data.success) {
                onSaved && onSaved();
            } else {
                setError(res.data.error || 'Save failed');
            }
        } catch (err) {
            setError(err?.response?.data?.error || 'Save failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600">{error}</div>}
            <div>
                <label className="block text-sm">Name</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="border p-2 w-full"
                    required
                />
            </div>
            <div>
                <label className="block text-sm">Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="border p-2 w-full"
                    required
                />
            </div>
            <div>
                <label className="block text-sm">Phone</label>
                <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
            </div>
            <div>
                <label className="block text-sm">Address</label>
                <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}
