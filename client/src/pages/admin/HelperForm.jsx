// client/src/pages/admin/HelperForm.jsx
import { useEffect, useState } from 'react';

export default function HelperForm({ open, initial, onClose, onSubmit }) {
    const [form, setForm] = useState({
        name: '', age: '', nationality: '',
        experience: 0, skills: '', availability: true, expectedSalary: ''
    });

    useEffect(() => {
        if (!open) return; // avoid overwriting while closing
        if (initial) {
            setForm({
                name: initial.name || '',
                age: initial.age ?? '',
                nationality: initial.nationality || '',
                experience: initial.experience ?? 0,
                skills: Array.isArray(initial.skills) ? initial.skills.join(', ') : '',
                availability: !!initial.availability,
                expectedSalary: initial.expectedSalary ?? ''
            });
        } else {
            setForm({
                name: '', age: '', nationality: '',
                experience: 0, skills: '', availability: true, expectedSalary: ''
            });
        }
    }, [open, initial]);

    if (!open) return null;

    const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

    const submit = (e) => {
        e?.preventDefault?.();
        const payload = {
            name: form.name.trim(),
            age: Number(form.age),
            nationality: form.nationality.trim(),
            experience: Number(form.experience || 0),
            skills: form.skills
                ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
                : [],
            availability: !!form.availability,
            expectedSalary:
                form.expectedSalary === '' || form.expectedSalary === null
                    ? null
                    : Number(form.expectedSalary)
        };
        if (!payload.name || !payload.age || !payload.nationality) {
            alert('Name, Age, and Nationality are required.');
            return;
        }
        onSubmit(payload);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000
        }}>
            <form onSubmit={submit} style={{ background: '#fff', padding: 16, borderRadius: 8, width: '100%', maxWidth: 520 }}>
                <h3 style={{ marginTop: 0 }}>{initial ? 'Edit Helper' : 'Create Helper'}</h3>

                <div style={{ display: 'grid', gap: 8 }}>
                    <input
                        placeholder="Name *"
                        value={form.name}
                        onChange={e => update('name', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Age *"
                        value={form.age}
                        onChange={e => update('age', e.target.value)}
                    />
                    <input
                        placeholder="Nationality *"
                        value={form.nationality}
                        onChange={e => update('nationality', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Experience (years)"
                        value={form.experience}
                        onChange={e => update('experience', e.target.value)}
                    />
                    <input
                        placeholder="Skills (comma separated)"
                        value={form.skills}
                        onChange={e => update('skills', e.target.value)}
                    />
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            checked={form.availability}
                            onChange={e => update('availability', e.target.checked)}
                        />
                        Available
                    </label>
                    <input
                        type="number"
                        placeholder="Expected Salary"
                        value={form.expectedSalary}
                        onChange={e => update('expectedSalary', e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button type="submit">{initial ? 'Save changes' : 'Create'}</button>
                    <button type="button" onClick={onClose} style={{ opacity: .75 }}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
