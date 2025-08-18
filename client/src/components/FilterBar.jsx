import { useState } from 'react';

export default function FilterBar({ onChange }) {
    const [q, setQ] = useState('');
    const [nationality, setNationality] = useState('');
    const [skill, setSkill] = useState('');
    const [available, setAvailable] = useState('true'); // default to available
    const [minExp, setMinExp] = useState('');
    const [maxSalary, setMaxSalary] = useState('');

    function apply() {
        onChange({
            q: q || undefined,
            nationality: nationality || undefined,
            skill: skill || undefined,
            available: available || undefined,
            minExp: minExp || undefined,
            maxSalary: maxSalary || undefined,
            page: 1
        });
    }

    return (
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 16 }}>
            <input placeholder="Search name" value={q} onChange={e => setQ(e.target.value)} />
            <input placeholder="Nationality (e.g. Myanmar)" value={nationality} onChange={e => setNationality(e.target.value)} />
            <input placeholder="Skill (e.g. Cooking)" value={skill} onChange={e => setSkill(e.target.value)} />
            <select value={available} onChange={e => setAvailable(e.target.value)}>
                <option value="">Any</option>
                <option value="true">Available</option>
                <option value="false">Not available</option>
            </select>
            <input type="number" min="0" placeholder="Min Exp (yrs)" value={minExp} onChange={e => setMinExp(e.target.value)} />
            <input type="number" min="0" placeholder="Max Salary" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} />
            <button style={{ gridColumn: 'span 6' }} onClick={apply}>Apply</button>
        </div>
    );
}
