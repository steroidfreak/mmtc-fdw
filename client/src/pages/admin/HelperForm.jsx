// client/src/components/HelperForm.jsx
import { useState, useEffect, useMemo } from 'react';
import api from "../../api";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:4000';
const PLACEHOLDER = '/placeholder-helper.png';

function toAbs(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/uploads') || url.startsWith('uploads')) {
        const rel = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE}${rel}`;
    }
    return url;
}

export default function HelperForm({ helperId, onSaved }) {
    const isEdit = Boolean(helperId);

    const [form, setForm] = useState({
        name: '',
        age: '',
        nationality: '',
        experience: '',
        skills: '',
        availability: true,
        expectedSalary: '',
        photos: [], // existing (saved) photo URLs
    });

    // Newly selected files (not uploaded yet)
    const [files, setFiles] = useState([]);               // File[]
    const [filePreviews, setFilePreviews] = useState([]); // string[] (blob URLs)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load helper if editing
    useEffect(() => {
        if (!isEdit) return;
        api.get(`/admin/helpers/${helperId}`)
            .then(res => {
                if (res.data.success) {
                    const h = res.data.data;
                    setForm({
                        name: h.name ?? '',
                        age: h.age ?? '',
                        nationality: h.nationality ?? '',
                        experience: h.experience ?? '',
                        skills: (h.skills || []).join(', '),
                        availability: h.availability ?? true,
                        expectedSalary: h.expectedSalary ?? '',
                        photos: h.photos || [],
                    });
                }
            })
            .catch(() => setError('Failed to load helper'));
    }, [helperId, isEdit]);

    // Build absolute URLs for existing photos
    const existingPhotoUrls = useMemo(
        () => (form.photos || []).map(toAbs),
        [form.photos]
    );

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    // Handle new file selection: save files, build previews
    function handleFileChange(e) {
        const picked = Array.from(e.target.files || []);
        if (!picked.length) return;

        // Append (not replace) so user can add more
        const nextFiles = [...files, ...picked];
        setFiles(nextFiles);

        // Create object URLs for the new ones only
        const newPreviews = picked.map(f => URL.createObjectURL(f));
        setFilePreviews(prev => [...prev, ...newPreviews]);
    }

    // Revoke object URLs on unmount or when previews change
    useEffect(() => {
        return () => {
            filePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [filePreviews]);

    // Remove a not-yet-uploaded file by index
    function removePendingFile(index) {
        setFiles(prev => prev.filter((_, i) => i !== index));
        // revoke and remove preview
        setFilePreviews(prev => {
            const url = prev[index];
            if (url) URL.revokeObjectURL(url);
            return prev.filter((_, i) => i !== index);
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...form,
                age: Number(form.age) || null,
                experience: Number(form.experience) || 0,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : null,
            };

            let res;
            if (isEdit) {
                res = await api.put(`/admin/helpers/${helperId}`, payload);
            } else {
                res = await api.post('/admin/helpers', payload);
            }
            const saved = res.data.data;

            // Upload newly selected files (if any)
            if (files.length > 0) {
                const fd = new FormData();
                files.forEach(f => fd.append('photos', f));
                const up = await api.post(`/admin/helpers/${saved._id}/photos`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                saved.photos = up.data.data.photos;
            }

            onSaved?.(saved);

            // Reset form if this was a create
            if (!isEdit) {
                setForm({
                    name: '',
                    age: '',
                    nationality: '',
                    experience: '',
                    skills: '',
                    availability: true,
                    expectedSalary: '',
                    photos: [],
                });
                // clear pending files & previews
                filePreviews.forEach(url => URL.revokeObjectURL(url));
                setFiles([]);
                setFilePreviews([]);
            }
        } catch (err) {
            console.error(err);
            setError('Save failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
            {error && <div className="text-red-600 mb-4">{error}</div>}

            {/* Title */}
            <h2 className="text-xl font-semibold mb-4">
                {isEdit ? 'Edit Helper' : 'Create Helper'}
            </h2>

            {/* Form grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <input
                        name="nationality"
                        value={form.nationality}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                    <input
                        type="number"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
                    <input
                        type="number"
                        name="expectedSalary"
                        value={form.expectedSalary}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                    <input
                        name="skills"
                        value={form.skills}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Cooking, Cleaning, Elderly care"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            name="availability"
                            checked={form.availability}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Available</span>
                    </label>
                </div>
            </div>

            {/* Photos */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                {/* Existing photos */}
                <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Existing</div>
                    <div className="flex gap-2 flex-wrap">
                        {existingPhotoUrls.length > 0 ? (
                            existingPhotoUrls.map((url, idx) => (
                                <img
                                    key={`ex-${idx}`}
                                    src={url}
                                    alt=""
                                    className="w-24 h-24 object-cover rounded border"
                                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                                />
                            ))
                        ) : (
                            <img
                                src={PLACEHOLDER}
                                alt="placeholder"
                                className="w-24 h-24 object-cover rounded border"
                            />
                        )}
                    </div>
                </div>

                {/* Pending (new) previews */}
                <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1">Pending (not yet saved)</div>
                    <div className="flex gap-2 flex-wrap">
                        {filePreviews.map((previewUrl, idx) => (
                            <div key={`new-${idx}`} className="relative">
                                <img
                                    src={previewUrl}
                                    alt={`new-${idx}`}
                                    className="w-24 h-24 object-cover rounded border"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePendingFile(idx)}
                                    className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-6 h-6 text-xs leading-5 hover:bg-gray-50"
                                    title="Remove"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {filePreviews.length === 0 && (
                            <div className="text-xs text-gray-500">No new photos selected</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? 'Saving...' : isEdit ? 'Update Helper' : 'Create Helper'}
                </button>
            </div>
        </form>
    );
}
